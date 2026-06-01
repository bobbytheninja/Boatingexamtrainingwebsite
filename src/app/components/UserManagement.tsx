import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Users, Calendar, CheckCircle, XCircle, Shield, Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';
import { projectId } from '../utils/supabase/info';
import { Alert, AlertDescription } from './ui/alert';
import { loadExamCategories } from '../utils/categoryLoader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  subscriptions: string[];
  expiresAt: number | null;
  language: string;
}

const USERS_PER_PAGE = 20;

export function UserManagement() {
  const { darkMode } = useDarkMode();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, string>>({});
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [examTypes, setExamTypes] = useState<{ value: string; label: string; short: string }[]>([]);

  // Load exam categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await loadExamCategories();
      setExamTypes(categories);
    };
    loadCategories();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          setErrorMessage('You need admin access to view users. Go to the "API Keys" tab to grant yourself admin access.');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        throw new Error(errorData.message || 'Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setErrorMessage(null);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(`Failed to load users: ${error.message}`);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleGrantLicense = async (userId: string, examType: string) => {
    if (examType === 'all') {
      await handleGrantAllLicenses(userId);
      return;
    }

    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/grant-licenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId,
            examTypes: [examType],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grant license');
      }

      toast.success(`License granted successfully!`);
      await loadUsers();
    } catch (error: any) {
      console.error('Error granting license:', error);
      toast.error(`Failed to grant license: ${error.message}`);
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleGrantAllLicenses = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const allExamTypes = examTypes.map(t => t.value);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/grant-licenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId,
            examTypes: allExamTypes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grant licenses');
      }

      toast.success(`All licenses granted!`);
      await loadUsers();
    } catch (error: any) {
      console.error('Error granting all licenses:', error);
      toast.error(`Failed to grant licenses: ${error.message}`);
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleRevokeLicense = async (userId: string, examType: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/revoke-licenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId,
            examTypes: [examType],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to revoke license');
      }

      toast.success(`License revoked!`);
      await loadUsers();
    } catch (error: any) {
      console.error('Error revoking license:', error);
      toast.error(`Failed to revoke license: ${error.message}`);
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleGrantAdmin = async (userId: string, userEmail: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/grant-admin-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grant admin access');
      }

      toast.success(`Admin access granted to ${userEmail}`);
      await loadUsers();
    } catch (error: any) {
      console.error('Error granting admin:', error);
      toast.error(`Failed to grant admin access: ${error.message}`);
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleRevokeAdmin = async (userId: string, userEmail: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/revoke-admin-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Special handling for "last admin" protection
        if (response.status === 400 && errorData.message?.includes('at least one admin')) {
          toast.error('Cannot revoke - at least one admin must remain in the system', {
            description: 'Grant admin access to another user first, then revoke this one.',
            duration: 5000,
          });
        } else if (response.status === 400 && errorData.message?.includes('your own')) {
          toast.error('You cannot revoke your own admin access', {
            description: 'Another admin must revoke your access.',
            duration: 4000,
          });
        } else {
          throw new Error(errorData.message || 'Failed to revoke admin access');
        }
        return;
      }

      const result = await response.json();
      toast.success(`Admin access revoked from ${userEmail}`, {
        description: result.remainingAdmins ? `${result.remainingAdmins} admin(s) remaining` : undefined,
      });
      await loadUsers();
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast.error(`Failed to revoke admin access: ${error.message}`);
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const cardStyle = { backgroundColor: darkMode ? '#334155' : '#ffffff', borderColor: darkMode ? '#475569' : '#e2e8f0' };
  const titleStyle = { color: darkMode ? '#f1f5f9' : '#0f172a' };
  const mutedStyle = { color: darkMode ? '#94a3b8' : '#6b7280' };

  if (loading) {
    return (
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle style={titleStyle} className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
            <ButtonSpinner className="mr-2" />
            Loading users...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle style={titleStyle} className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: darkMode ? 'rgba(120,53,15,0.2)' : '#fffbeb',
              border: `1px solid ${darkMode ? '#92400e' : '#fde68a'}`,
            }}
          >
            <div className="mb-3" style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Admin Access Required</h3>
            </div>
            <p className="mb-4" style={{ color: darkMode ? '#fde68a' : '#78350f' }}>
              {errorMessage}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Refresh After Granting Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle style={titleStyle} className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <Badge variant="outline" style={{ borderColor: darkMode ? '#64748b' : '#cbd5e1', color: darkMode ? '#cbd5e1' : '#374151' }}>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </Badge>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#475569' : '#cbd5e1', color: darkMode ? '#f1f5f9' : '#0f172a' }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <TableHead style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>User</TableHead>
                <TableHead style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Admin Status</TableHead>
                <TableHead style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Licenses</TableHead>
                <TableHead style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const isProcessing = processingUsers.has(user.id);
                const hasSubscriptions = user.subscriptions.length > 0;

                return (
                  <TableRow key={user.id} style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>{user.name}</span>
                        </div>
                        <div className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>{user.email}</div>
                        <div className="text-xs" style={{ color: darkMode ? '#64748b' : '#9ca3af' }}>
                          Joined {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {user.role === 'admin' ? (
                          <>
                            <Badge variant="destructive" className="w-fit">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="w-fit text-xs h-7 hover:bg-red-50"
                                style={{ borderColor: darkMode ? '#b91c1c' : '#ef4444', color: darkMode ? '#f87171' : '#dc2626' }}
                                >
                                  {isProcessing ? (
                                    <ButtonSpinner className="w-3 h-3" />
                                  ) : (
                                    <>
                                      <ShieldOff className="w-3 h-3 mr-1" />
                                      Revoke Admin
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent style={{ background: darkMode ? '#1e293b' : undefined }}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2" style={{ color: darkMode ? '#f87171' : '#dc2626' }}>
                                    <AlertTriangle className="w-5 h-5" />
                                    Revoke Admin Access?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription style={{ color: darkMode ? '#d1d5db' : undefined }}>
                                    Are you sure you want to revoke admin access from <strong>{user.email}</strong>?
                                    <br /><br />
                                    They will lose access to:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      <li>Admin panel</li>
                                      <li>User management</li>
                                      <li>License granting</li>
                                      <li>Question uploads</li>
                                      <li>Partner management</li>
                                    </ul>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel style={{ background: darkMode ? '#334155' : undefined, color: darkMode ? '#e2e8f0' : undefined }}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRevokeAdmin(user.id, user.email)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Yes, Revoke Admin Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleGrantAdmin(user.id, user.email)}
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            className="w-fit text-xs h-7 hover:bg-green-50"
                            style={{ borderColor: darkMode ? '#15803d' : '#22c55e', color: darkMode ? '#4ade80' : '#16a34a' }}
                          >
                            {isProcessing ? (
                              <ButtonSpinner className="w-3 h-3" />
                            ) : (
                              <>
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Grant Admin
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasSubscriptions ? (
                        <div className="flex flex-wrap gap-1">
                          {user.subscriptions.map((examType) => {
                            const examInfo = examTypes.find(t => t.value === examType);
                            return (
                              <div key={examType} className="group relative">
                                <Badge
                                  variant="secondary"
                                  className="text-xs cursor-pointer"
                                  style={{ backgroundColor: darkMode ? 'rgba(19,78,74,0.4)' : undefined, color: darkMode ? '#5eead4' : undefined }}
                                  title={examInfo?.label}
                                >
                                  {examInfo?.short || examType}
                                  <button
                                    onClick={() => handleRevokeLicense(user.id, examType)}
                                    disabled={isProcessing}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedLicenses[user.id] || ''}
                          onValueChange={(value) => setSelectedLicenses({ ...selectedLicenses, [user.id]: value })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#475569' : '#cbd5e1', color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                            <SelectValue placeholder="Grant..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <span className="font-semibold" style={{ color: darkMode ? '#2dd4bf' : '#0d9488' }}>
                                ⭐ All
                              </span>
                            </SelectItem>
                            {examTypes.map((type) => (
                              <SelectItem 
                                key={type.value} 
                                value={type.value}
                                disabled={user.subscriptions.includes(type.value)}
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            const selected = selectedLicenses[user.id];
                            if (selected) {
                              handleGrantLicense(user.id, selected);
                              setSelectedLicenses({ ...selectedLicenses, [user.id]: '' });
                            }
                          }}
                          disabled={!selectedLicenses[user.id] || isProcessing}
                          size="sm"
                          className="h-8 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          {isProcessing ? (
                            <ButtonSpinner />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}` }}
          >
            <div className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ background: darkMode ? '#475569' : undefined, borderColor: darkMode ? '#64748b' : undefined }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ background: darkMode ? '#475569' : undefined, borderColor: darkMode ? '#64748b' : undefined }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
