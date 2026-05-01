import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Users, Calendar, CheckCircle, XCircle, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';
import { projectId } from '../utils/supabase/info';
import { Alert, AlertDescription } from './ui/alert';
import { loadExamCategories } from '../utils/categoryLoader';

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

  if (loading) {
    return (
      <Card className="dark:bg-slate-700 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <ButtonSpinner className="mr-2" />
            Loading users...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="dark:bg-slate-700 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6 text-center">
            <div className="text-amber-600 dark:text-amber-400 mb-3">
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Admin Access Required</h3>
            </div>
            <p className="text-amber-900 dark:text-amber-200 mb-4">
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
    <Card className="dark:bg-slate-700 dark:border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <Badge variant="outline" className="dark:border-gray-500">
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
            className="pl-10 dark:bg-slate-600 dark:border-slate-500"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-600">
                <TableHead className="dark:text-gray-300">User</TableHead>
                <TableHead className="dark:text-gray-300">Licenses</TableHead>
                <TableHead className="dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const isProcessing = processingUsers.has(user.id);
                const hasSubscriptions = user.subscriptions.length > 0;

                return (
                  <TableRow key={user.id} className="dark:border-slate-600">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium dark:text-gray-100">{user.name}</span>
                          {user.role === 'admin' && (
                            <Badge variant="destructive" className="text-xs h-5">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Joined {formatDate(user.createdAt)}
                        </div>
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
                                  className="text-xs dark:bg-teal-900/30 dark:text-teal-300 cursor-pointer"
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
                        <span className="text-xs text-gray-500 dark:text-gray-500 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedLicenses[user.id] || ''}
                          onValueChange={(value) => setSelectedLicenses({ ...selectedLicenses, [user.id]: value })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs dark:bg-slate-600 dark:border-slate-500">
                            <SelectValue placeholder="Grant..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <span className="font-semibold text-teal-600 dark:text-teal-400">
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="dark:bg-slate-600 dark:border-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="dark:bg-slate-600 dark:border-slate-500"
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
