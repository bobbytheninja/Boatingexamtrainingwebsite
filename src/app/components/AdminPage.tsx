import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Alert, AlertDescription } from './ui/alert';
import { QuestionImporter } from './QuestionImporter';
import { ImageUploader } from './ImageUploader';
import { ImageDiagnostics } from './ImageDiagnostics';
import { UserManagement } from './UserManagement';
import { DatabaseDiagnostics } from './DatabaseDiagnostics';
import { PartnerManagement } from './PartnerManagement';
import { CategoryManagement } from './CategoryManagement';
import { Analytics } from './Analytics';
import { SubscriptionDebug } from './SubscriptionDebug';
import { ArrowLeft, Database, Users, Key, AlertCircle, CheckCircle, Shield, Image as ImageIcon, Ship, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'sonner';
import { ButtonSpinner, LoadingSpinner } from './LoadingSpinner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Language, getTranslation } from '../data/translations';

interface AdminPageProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export function AdminPage({ onBack, onNavigate }: AdminPageProps) {
  const { user, accessToken } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [language, setLanguage] = useState<Language>('English');
  const [region, setRegion] = useState('Bulgaria');
  const t = getTranslation(language);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(true); // Start as true to show loading
  const [backendError, setBackendError] = useState<string | null>(null);

  // Check if user is admin from user metadata
  const userIsAdmin = user?.isAdmin || false;

  // Check admin status on mount
  useEffect(() => {
    const controller = new AbortController();

    const checkAdminStatus = async () => {
      if (!user || !accessToken) {
        setIsAlreadyAdmin(false);
        setCheckingAdminStatus(false);
        setBackendError(null);
        return;
      }

      setCheckingAdminStatus(true);
      setBackendError(null);

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/check-admin`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAlreadyAdmin(data.isAdmin || false);
          setBackendError(null);
        } else {
          setIsAlreadyAdmin(false);
          if (response.status !== 404 && response.status !== 401 && response.status !== 403) {
            setBackendError(`Backend returned status ${response.status}`);
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error checking admin status:', error);
        setIsAlreadyAdmin(false);
        setBackendError(error.message || 'Backend connection failed');
      } finally {
        setCheckingAdminStatus(false);
      }
    };

    checkAdminStatus();
    return () => controller.abort();
  }, [user, accessToken]);

  const handleMakeAdmin = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!adminKeyInput) {
      toast.error('Please enter the admin key');
      return;
    }

    setMakingAdmin(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/make-admin`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          adminKey: adminKeyInput,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unknown error' };
        }
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      setIsAlreadyAdmin(true);
      
      toast.success(`🎉 Admin access granted! Refreshing page...`);
      
      // Reload the page to refresh user metadata
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast.error(`Error granting admin access: ${error.message}`);
    } finally {
      setMakingAdmin(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'admin') return;
    if (page === 'home') {
      onBack();
    } else if (page === 'login') {
      onBack();
    } else if (onNavigate) {
      onNavigate(`/${page}`);
    } else {
      window.location.href = `/${page}`;
    }
  };

  // Show loading state while checking admin status
  if (checkingAdminStatus) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Navigation
          currentPage="admin"
          onNavigate={handleNavigate}
          isLoggedIn={true}
          transparent={false}
          language={language}
          onLanguageChange={setLanguage}
          region={region}
          onRegionChange={setRegion}
          darkMode={darkMode}
          onDarkModeToggle={toggleDarkMode}
        />
        <div 
          className="min-h-screen pt-24 pb-12 px-4 transition-all duration-[400ms]"
          style={{ 
            background: darkMode 
              ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
              : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <div className="container mx-auto max-w-6xl flex items-center justify-center min-h-[60vh]">
            <Card 
              className="max-w-md w-full border-2 shadow-xl"
              style={{
                backgroundColor: darkMode ? '#334155' : '#ffffff',
                borderColor: darkMode ? '#475569' : '#93c5fd',
              }}
            >
              <CardContent className="pt-6 flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                <h3 className="text-xl font-semibold" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Loading Admin Panel...</h3>
                <p className="text-sm text-center" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                  Checking admin permissions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navigation
        currentPage="admin"
        onNavigate={handleNavigate}
        isLoggedIn={true}
        transparent={false}
        language={language}
        onLanguageChange={setLanguage}
        region={region}
        onRegionChange={setRegion}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
      />
      
      <div 
        className="min-h-screen pt-32 pb-12 px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <Button onClick={onBack} variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

        <div className="text-center mb-8">
          <h1 
            className="text-4xl mb-4 flex items-center justify-center gap-2 transition-colors duration-[400ms]"
            style={{ 
              color: darkMode ? '#f3f4f6' : '#1e293b',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <Shield className="w-8 h-8 text-purple-500" />
            Admin Panel
          </h1>
          <p 
            className="mb-3 transition-colors duration-[400ms]"
            style={{ 
              color: darkMode ? '#9ca3af' : '#64748b',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            Manage users, grant licenses, import questions, and configure your yacht exam platform
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <a href="/FIXES_APPLIED.md" target="_blank" className="hover:underline font-semibold" style={{ color: darkMode ? '#4ade80' : '#16a34a' }}>
              ✅ Latest Fixes
            </a>
            <span style={{ color: darkMode ? '#475569' : '#d1d5db' }}>|</span>
            <a href="/START_HERE.md" target="_blank" className="hover:underline" style={{ color: darkMode ? '#2dd4bf' : '#0d9488' }}>
              📖 Start Here
            </a>
            <span style={{ color: darkMode ? '#475569' : '#d1d5db' }}>|</span>
            <a href="/DEBUG_AUTH.md" target="_blank" className="hover:underline" style={{ color: darkMode ? '#2dd4bf' : '#0d9488' }}>
              🔍 Debug Guide
            </a>
            <span style={{ color: darkMode ? '#475569' : '#d1d5db' }}>|</span>
            <a href="/TROUBLESHOOTING.md" target="_blank" className="hover:underline" style={{ color: darkMode ? '#2dd4bf' : '#0d9488' }}>
              🔧 Troubleshooting
            </a>
          </div>
        </div>

        {/* Backend Error Alert */}
        {backendError && (
          <Alert className="mb-6" style={{ background: darkMode ? 'rgba(127,29,29,0.2)' : '#fef2f2', borderColor: darkMode ? '#991b1b' : '#ef4444' }}>
            <AlertCircle className="h-5 w-5" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
            <AlertDescription style={{ color: darkMode ? '#fca5a5' : '#7f1d1d' }}>
              <strong className="block mb-2">⚠️ Backend Connection Error</strong>
              <p className="text-sm mb-2">
                Could not connect to the backend server: {backendError}
              </p>
              <p className="text-sm mb-3">
                This usually means the backend hasn't been deployed yet. Please deploy the backend by running:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs mb-3">
                ./deploy-backend.sh
              </div>
              <p className="text-xs">
                Note: You can still use the Admin Panel, but some features may not work until the backend is deployed.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Limited Access Notice for Non-Admin Users */}
        {user && !userIsAdmin && !backendError && (
          <Alert className="mb-6" style={{ background: darkMode ? 'rgba(113,63,18,0.2)' : '#fefce8', borderColor: darkMode ? '#713f12' : '#eab308' }}>
            <Shield className="h-5 w-5" style={{ color: darkMode ? '#fbbf24' : '#ca8a04' }} />
            <AlertDescription style={{ color: darkMode ? '#fde68a' : '#713f12' }}>
              <strong className="block mb-2">⚠️ Limited Access</strong>
              <p className="text-sm mb-2">
                You currently have limited access to the admin panel. To unlock all admin features:
              </p>
              <ol className="text-sm space-y-1 ml-5 list-decimal">
                <li>Go to the <strong>"API Keys"</strong> tab below</li>
                <li>Enter the admin key in the "Grant Admin Access" section</li>
                <li>Click "Make Me An Admin"</li>
              </ol>
              <p className="text-xs mt-2">
                💡 Default admin key: <code style={{ background: darkMode ? 'rgba(113,63,18,0.4)' : '#fef9c3', padding: '0 4px', borderRadius: 3 }}>change-this-key</code>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Important Notice */}
        {!user ? (
          <Alert className="mb-6" style={{ background: darkMode ? 'rgba(120,53,15,0.2)' : '#fffbeb', borderColor: darkMode ? '#92400e' : '#f59e0b' }}>
            <AlertCircle className="h-5 w-5" style={{ color: darkMode ? '#fbbf24' : '#d97706' }} />
            <AlertDescription style={{ color: darkMode ? '#fde68a' : '#78350f' }}>
              <strong className="block mb-1">⚠️ Getting "Invalid login credentials" error?</strong>
              <p className="text-sm">
                This happens because no user accounts exist yet. You need to <strong>create an account first</strong> by either:
              </p>
              <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Using the "Create Demo Account" button in the <strong>Test Auth</strong> tab below, OR</li>
                <li>Going to the Login page and clicking the <strong>"Sign Up"</strong> tab to create your own account</li>
              </ul>
            </AlertDescription>
          </Alert>
        ) : userIsAdmin ? (
          <Alert className="mb-6" style={{ background: darkMode ? 'rgba(88,28,135,0.2)' : '#faf5ff', borderColor: darkMode ? '#7e22ce' : '#a855f7' }}>
            <Shield className="h-5 w-5" style={{ color: darkMode ? '#c084fc' : '#9333ea' }} />
            <AlertDescription style={{ color: darkMode ? '#e9d5ff' : '#581c87' }}>
              <strong className="block mb-1">🛡️ Admin Access Granted</strong>
              <p className="text-sm mb-2">
                You have full admin access. Use the tabs below to manage users, grant licenses, import questions, and configure the platform.
              </p>
              <p className="text-xs" style={{ color: darkMode ? '#d8b4fe' : '#6b21a8' }}>
                💡 Visit the "Manage Users" tab to control user licenses and the "Questions" tab to import exam questions.
              </p>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Show admin panel to all logged-in users, but limit features based on admin status */}
        {user && (
        <Tabs defaultValue={userIsAdmin ? "diagnostics" : "keys"} className="space-y-8">
          <TabsList className={`grid w-full max-w-6xl mx-auto gap-2.5 ${userIsAdmin ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 'grid-cols-1 sm:grid-cols-1'} h-auto p-3 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border shadow-lg rounded-lg backdrop-blur-sm`}>
            {userIsAdmin && (
              <>
                <TabsTrigger
                  value="diagnostics"
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Diagnostics</span>
                  <span className="sm:hidden text-xs">Diag</span>
                </TabsTrigger>
                <TabsTrigger
                  value="categories" 
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Ship className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Categories</span>
                  <span className="sm:hidden text-xs">Cat</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="import" 
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Database className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Import Questions</span>
                  <span className="sm:hidden text-xs">Import</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Manage Users</span>
                  <span className="sm:hidden text-xs">Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="partners" 
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Partners</span>
                  <span className="sm:hidden text-xs">Partners</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Database className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">Analytics</span>
                  <span className="sm:hidden text-xs">Stats</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="keys"
              className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md ${darkMode ? 'text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <Key className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">Admin Keys</span>
              <span className="sm:hidden text-xs">Keys</span>
            </TabsTrigger>
          </TabsList>

          {userIsAdmin && (
            <>
              <TabsContent value="diagnostics">
                <div className="space-y-6">
                  <DatabaseDiagnostics />
                  <SubscriptionDebug />
                </div>
              </TabsContent>

              <TabsContent value="categories">
                {accessToken ? (
                  <CategoryManagement accessToken={accessToken} />
                ) : (
                  <Card style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined }}>
                    <CardHeader>
                      <CardTitle>Category Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Please log in to manage categories.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="import">
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="questions" className="rounded-xl px-6 shadow-md hover:shadow-lg transition-all" style={{ border: `2px solid ${darkMode ? '#1d4ed8' : '#bfdbfe'}`, background: darkMode ? 'linear-gradient(to bottom right, rgba(30,58,138,0.2), rgba(14,165,233,0.1))' : 'linear-gradient(to bottom right, #eff6ff, #f0f9ff)' }}>
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg" style={{ color: darkMode ? '#bfdbfe' : '#1e3a8a' }}>Import Questions from Excel</h3>
                          <p className="text-sm mt-1" style={{ color: darkMode ? '#93c5fd' : '#1d4ed8' }}>Upload Excel files to import exam questions for all categories</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <QuestionImporter />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="images" className="rounded-xl px-6 shadow-md hover:shadow-lg transition-all" style={{ border: `2px solid ${darkMode ? '#7e22ce' : '#e9d5ff'}`, background: darkMode ? 'linear-gradient(to bottom right, rgba(88,28,135,0.2), rgba(219,39,119,0.1))' : 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)' }}>
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg" style={{ color: darkMode ? '#e9d5ff' : '#581c87' }}>Upload Question Images</h3>
                          <p className="text-sm mt-1" style={{ color: darkMode ? '#d8b4fe' : '#7e22ce' }}>Link images to questions by question number and category</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <ImageUploader />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="diagnostics" className="rounded-xl px-6 shadow-md hover:shadow-lg transition-all" style={{ border: `2px solid ${darkMode ? '#065f46' : '#a7f3d0'}`, background: darkMode ? 'linear-gradient(to bottom right, rgba(6,95,70,0.2), rgba(5,150,105,0.1))' : 'linear-gradient(to bottom right, #ecfdf5, #f0fdfa)' }}>
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-lg shadow-md">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg" style={{ color: darkMode ? '#a7f3d0' : '#064e3b' }}>Check Image Status</h3>
                          <p className="text-sm mt-1" style={{ color: darkMode ? '#6ee7b7' : '#065f46' }}>Diagnose image loading issues and verify image availability</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <ImageDiagnostics />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </TabsContent>

              <TabsContent value="users">
                <UserManagement />
              </TabsContent>

              <TabsContent value="partners">
                {accessToken ? (
                  <PartnerManagement accessToken={accessToken} />
                ) : (
                  <Card style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined }}>
                    <CardHeader>
                      <CardTitle>Partner Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Please log in to manage partners.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                {accessToken ? (
                  <Analytics accessToken={accessToken} />
                ) : (
                  <Card style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined }}>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Please log in to view analytics.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          )}

          <TabsContent value="keys">
            <Card style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined }}>
              <CardHeader>
                <CardTitle>Environment Variables & Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div
                    className="rounded-lg p-4"
                    style={{
                      border: `2px solid ${darkMode ? '#7e22ce' : '#d8b4fe'}`,
                      background: darkMode ? 'rgba(88,28,135,0.15)' : '#faf5ff',
                    }}
                  >
                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>
                      <Shield className="w-5 h-5 text-purple-500" />
                      Grant Admin Access
                    </h3>
                    <p className="text-sm mb-3" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                      Make yourself an admin to access the User Management tab and control all user licenses.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm" style={{ color: darkMode ? '#e2e8f0' : undefined }}>Admin Key</Label>
                        <Input
                          type="password"
                          value={adminKeyInput}
                          onChange={(e) => setAdminKeyInput(e.target.value)}
                          placeholder="Enter admin key (default: change-this-key)"
                          className="mt-1"
                          style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#475569' : undefined }}
                        />
                        <p className="text-xs mt-1" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
                          💡 Default key: <code style={{ background: darkMode ? '#374151' : '#e5e7eb', padding: '0 4px', borderRadius: 3 }}>change-this-key</code>
                        </p>
                      </div>
                      <Button
                        onClick={handleMakeAdmin}
                        disabled={makingAdmin || !adminKeyInput}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        {makingAdmin ? (
                          <>
                            <ButtonSpinner className="mr-2" />
                            Granting Admin Access...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Me An Admin
                          </>
                        )}
                      </Button>
                      <div className="text-xs space-y-1" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                        <p>✓ Grants access to the User Management tab</p>
                        <p>✓ Allows you to manage all user licenses</p>
                        <p>✓ Admin status is permanent until manually removed</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Required Secrets</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
                        <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>STRIPE_SECRET_KEY</code>
                        <span style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>- Already configured</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
                        <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>SUPABASE_*</code>
                        <span style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>- Already configured</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4" style={{ borderTop: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}` }}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>
                      <Key className="w-5 h-5 text-teal-500" />
                      Admin Import Key
                    </h3>
                    <p className="text-sm mb-3" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                      This key is required to import questions. The key is stored as an <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '0 4px', borderRadius: 3 }}>ADMIN_IMPORT_KEY</code> environment variable in your Supabase Edge Functions.
                    </p>
                    
                    <div className="space-y-3">
                      <div
                        className="rounded-lg p-4"
                        style={{
                          background: darkMode ? 'rgba(19,78,74,0.2)' : '#f0fdfa',
                          border: `2px solid ${darkMode ? '#0f766e' : '#5eead4'}`,
                        }}
                      >
                        <p className="text-sm mb-2" style={{ color: darkMode ? '#5eead4' : '#134e4a' }}>
                          <strong>🔑 Your Admin Key:</strong>
                        </p>
                        <div
                          className="flex items-center gap-2 p-3 rounded"
                          style={{
                            background: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#0f766e' : '#99f6e4'}`,
                          }}
                        >
                          <code className="flex-1 font-mono text-lg">change-this-key</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText('change-this-key');
                              toast.success('Admin key copied to clipboard!');
                            }}
                            style={{ borderColor: darkMode ? '#0f766e' : '#5eead4' }}
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs mt-2" style={{ color: darkMode ? '#2dd4bf' : '#0f766e' }}>
                          ℹ️ This is the <strong>default admin key</strong>. Paste this into the "Admin Key" field in the Import Questions tab to import your questions.
                        </p>
                      </div>

                      <div
                        className="rounded-lg p-4"
                        style={{
                          background: darkMode ? 'rgba(113,63,18,0.2)' : '#fefce8',
                          border: `1px solid ${darkMode ? '#713f12' : '#fef08a'}`,
                        }}
                      >
                        <p className="text-sm" style={{ color: darkMode ? '#fde68a' : '#713f12' }}>
                          <strong>⚠️ For Production:</strong>
                        </p>
                        <p className="text-xs mt-1" style={{ color: darkMode ? '#fcd34d' : '#854d0e' }}>
                          Change this to a secure random string in your Supabase dashboard:
                        </p>
                        <ol className="text-xs mt-2 space-y-1 ml-4 list-decimal" style={{ color: darkMode ? '#fcd34d' : '#854d0e' }}>
                          <li>Go to Supabase Dashboard → Edge Functions</li>
                          <li>Click on Settings → Secrets</li>
                          <li>Add/Update secret: <code style={{ background: darkMode ? 'rgba(113,63,18,0.3)' : '#fef9c3', padding: '0 4px', borderRadius: 3 }}>ADMIN_IMPORT_KEY</code></li>
                          <li>Set it to a secure random string (e.g., generated UUID)</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderTop: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}` }}>
                    <h3 className="font-semibold mb-2" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Stripe Webhook Secret</h3>
                    <p className="text-sm mb-3" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                      For Stripe webhooks to work, you need to:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                      <li>Go to Stripe Dashboard → Developers → Webhooks</li>
                      <li>Add endpoint: <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '0 4px', borderRadius: 3, fontSize: '0.75rem' }}>https://[project-id].supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook</code></li>
                      <li>Select event: <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '0 4px', borderRadius: 3, fontSize: '0.75rem' }}>checkout.session.completed</code></li>
                      <li>Copy the webhook signing secret</li>
                      <li>Add it as <code style={{ background: darkMode ? '#1f2937' : '#f3f4f6', padding: '0 4px', borderRadius: 3, fontSize: '0.75rem' }}>STRIPE_WEBHOOK_SECRET</code> in Supabase Edge Functions secrets</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
    
    <Footer />
    </>
  );
}