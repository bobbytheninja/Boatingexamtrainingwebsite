import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { QuestionImporter } from './QuestionImporter';
import { UserManagement } from './UserManagement';
import { DatabaseDiagnostics } from './DatabaseDiagnostics';
import { ArrowLeft, Database, Users, Key, UserPlus, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'sonner@2.0.3';
import { ButtonSpinner } from './LoadingSpinner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Language, getTranslation } from '../data/translations';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const { user, signUp, accessToken } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [language, setLanguage] = useState<Language>('English');
  const [region, setRegion] = useState('Bulgaria');
  const t = getTranslation(language);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpass123');
  const [testName, setTestName] = useState('Test User');
  const [creatingDemoAccount, setCreatingDemoAccount] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [grantingLicenses, setGrantingLicenses] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !accessToken) {
        setIsAlreadyAdmin(false);
        setCheckingAdminStatus(false);
        return;
      }
      
      setCheckingAdminStatus(true);
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/check-admin`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAlreadyAdmin(data.isAdmin || false);
        } else {
          setIsAlreadyAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAlreadyAdmin(false);
      } finally {
        setCheckingAdminStatus(false);
      }
    };

    checkAdminStatus();
  }, [user, accessToken]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/health`
      );
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Server is running! Status: ${data.status}`);
      } else {
        toast.error(`❌ Server responded with status ${response.status}`);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      toast.error(`❌ Cannot reach server: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateDemoAccount = async () => {
    setCreatingDemoAccount(true);
    try {
      await signUp(testEmail, testPassword, testName);
      toast.success('Demo account created and logged in successfully! 🎉');
    } catch (error: any) {
      console.error('Demo account creation error:', error);
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
        toast.error('This email is already registered. Either use the Sign In tab with these credentials, or change the email above and try again.');
      } else if (errorMessage.includes('Missing authorization header')) {
        toast.error('Server authorization error. Please check that the Supabase Edge Function has the correct environment variables configured.');
      } else {
        toast.error(`Failed to create demo account: ${errorMessage}`);
      }
    } finally {
      setCreatingDemoAccount(false);
    }
  };

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
      console.log('Making user admin:', {
        userId: user.id,
        email: user.email,
        hasAdminKey: !!adminKeyInput,
      });

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/make-admin`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
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

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unknown error' };
        }
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('Admin access granted:', result);
      
      // Update the local admin status
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

  const handleGrantAllLicenses = async () => {
    if (!user) {
      toast.error('You must be logged in to grant licenses');
      return;
    }

    setGrantingLicenses(true);
    try {
      // Import the createClient function
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session found. Please log in again.');
      }

      const allExamTypes = ['jet', 'small', 'big', 'yacht', 'navigation'];
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            examTypes: allExamTypes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grant licenses');
      }

      const data = await response.json();
      toast.success(`🎉 All 5 exam licenses granted! Valid for 30 days. You can now access all exams for testing.`);
      
      // Reload the page to refresh subscriptions
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error granting licenses:', error);
      toast.error(`Failed to grant licenses: ${error.message}`);
    } finally {
      setGrantingLicenses(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'admin') return;
    if (page === 'home') {
      onBack();
    } else if (page === 'login') {
      onBack();
    } else if (page === 'account') {
      window.location.href = '/account';
    } else if (page === 'contact') {
      window.location.href = '/contact';
    } else if (page === 'partners') {
      window.location.href = '/partners';
    } else if (page === 'pricing') {
      window.location.href = '/pricing';
    }
  };

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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button onClick={onBack} variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 dark:text-gray-100 flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-purple-500" />
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Manage users, grant licenses, import questions, and configure your yacht exam platform
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <a href="/FIXES_APPLIED.md" target="_blank" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              ✅ Latest Fixes
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="/START_HERE.md" target="_blank" className="text-teal-600 dark:text-teal-400 hover:underline">
              📖 Start Here
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="/DEBUG_AUTH.md" target="_blank" className="text-teal-600 dark:text-teal-400 hover:underline">
              🔍 Debug Guide
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="/TROUBLESHOOTING.md" target="_blank" className="text-teal-600 dark:text-teal-400 hover:underline">
              🔧 Troubleshooting
            </a>
          </div>
        </div>

        {/* Important Notice */}
        {!user ? (
          <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-200">
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
        ) : (
          <Alert className="mb-6 border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="text-purple-900 dark:text-purple-200">
              <strong className="block mb-1">🛡️ Admin Setup Required</strong>
              <p className="text-sm mb-2">
                To access the full admin features (User Management, license control), go to the <strong>API Keys</strong> tab and grant yourself admin access using the admin key.
              </p>
              <p className="text-xs text-purple-800 dark:text-purple-300">
                💡 Once you're an admin, you'll see a "Manage Users" tab where you can control all user licenses.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="diagnostics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="diagnostics">
              <AlertCircle className="w-4 h-4 mr-2" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="import">
              <Database className="w-4 h-4 mr-2" />
              Import Questions
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="test">
              <UserPlus className="w-4 h-4 mr-2" />
              Test Auth
            </TabsTrigger>
            <TabsTrigger value="keys">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics">
            <DatabaseDiagnostics />
          </TabsContent>

          <TabsContent value="import">
            <QuestionImporter />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="test">
            <Card className="dark:bg-slate-700 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Test Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-200">
                      ✅ Currently logged in as: <strong>{user.email}</strong>
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                      User ID: {user.id}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold dark:text-gray-100">Quick Test Credentials</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use these credentials to test the authentication flow. Make sure to sign up first if you haven't already.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-blue-900 dark:text-blue-200">Email</Label>
                      <Input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-blue-900 dark:text-blue-200">Password</Label>
                      <Input
                        type="text"
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-blue-900 dark:text-blue-200">Name</Label>
                      <Input
                        type="text"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-600">
                    <h4 className="font-semibold mb-3 dark:text-gray-100">Server Connection Test:</h4>
                    <Button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      variant="outline"
                      className="w-full mb-4 border-2"
                    >
                      {testingConnection ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Test Server Connection
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-600">
                    <h4 className="font-semibold mb-3 dark:text-gray-100">Quick Demo Account Setup:</h4>
                    <Button
                      onClick={handleCreateDemoAccount}
                      disabled={creatingDemoAccount || !!user}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white mb-4"
                    >
                      {creatingDemoAccount ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          Creating Demo Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {user ? 'Already Logged In' : 'Create & Login with Demo Account'}
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>✓ This will create an account with the credentials shown above</p>
                      <p>✓ You'll be automatically logged in</p>
                      <p>✓ You can then test all features including payments</p>
                    </div>
                  </div>

                  {user && (
                    <div className="pt-4 border-t dark:border-slate-600">
                      <h4 className="font-semibold mb-3 dark:text-gray-100 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                        Grant Test Licenses (Skip Payment)
                      </h4>
                      <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-700 rounded-lg p-4 mb-4">
                        <p className="text-sm text-teal-900 dark:text-teal-200 mb-2">
                          🎁 <strong>Testing Mode:</strong> Grant yourself all 5 exam licenses instantly without payment.
                        </p>
                        <ul className="text-xs text-teal-800 dark:text-teal-300 space-y-1 ml-5 list-disc">
                          <li>Jet Ski Exam</li>
                          <li>Small Boat Exam</li>
                          <li>Big Boat Exam</li>
                          <li>Yacht (up to 50 tons) Exam</li>
                          <li>Navigation Device Exam</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={handleGrantAllLicenses}
                        disabled={grantingLicenses}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                      >
                        {grantingLicenses ? (
                          <>
                            <ButtonSpinner className="mr-2" />
                            Granting All Licenses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Grant All Exam Licenses (30 Days)
                          </>
                        )}
                      </Button>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-3">
                        <p>✓ Bypasses payment requirement for testing</p>
                        <p>✓ Valid for 30 days from grant date</p>
                        <p>✓ Lets you test all exam features immediately</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t dark:border-slate-600 mt-4">
                    <h4 className="font-semibold mb-2 dark:text-gray-100">Manual Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>Go to the Login page</li>
                      <li>Click on the "Sign Up" tab</li>
                      <li>Use the credentials above (or your own) to create an account</li>
                      <li>You'll be automatically logged in</li>
                      <li>You can then test the payment flow from your Account page</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card className="dark:bg-slate-700 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Environment Variables & Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="font-semibold mb-3 dark:text-gray-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-500" />
                      Grant Admin Access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Make yourself an admin to access the User Management tab and control all user licenses.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm dark:text-gray-200">Admin Key</Label>
                        <Input
                          type="password"
                          value={adminKeyInput}
                          onChange={(e) => setAdminKeyInput(e.target.value)}
                          placeholder="Enter admin key (default: change-this-key)"
                          className="mt-1 dark:bg-slate-600 dark:border-slate-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          💡 Default key: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">change-this-key</code>
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
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>✓ Grants access to the User Management tab</p>
                        <p>✓ Allows you to manage all user licenses</p>
                        <p>✓ Admin status is permanent until manually removed</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-gray-100">Required Secrets</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">STRIPE_SECRET_KEY</code>
                        <span className="text-gray-600 dark:text-gray-400">- Already configured</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">SUPABASE_*</code>
                        <span className="text-gray-600 dark:text-gray-400">- Already configured</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-600">
                    <h3 className="font-semibold mb-2 dark:text-gray-100 flex items-center gap-2">
                      <Key className="w-5 h-5 text-teal-500" />
                      Admin Import Key
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      This key is required to import questions. The key is stored as an <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ADMIN_IMPORT_KEY</code> environment variable in your Supabase Edge Functions.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-300 dark:border-teal-600 rounded-lg p-4">
                        <p className="text-sm text-teal-900 dark:text-teal-200 mb-2">
                          <strong>🔑 Your Admin Key:</strong>
                        </p>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded border border-teal-200 dark:border-teal-700">
                          <code className="flex-1 font-mono text-lg">change-this-key</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText('change-this-key');
                              toast.success('Admin key copied to clipboard!');
                            }}
                            className="border-teal-300 hover:bg-teal-50 dark:border-teal-600 dark:hover:bg-teal-900/30"
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-teal-800 dark:text-teal-300 mt-2">
                          ℹ️ This is the <strong>default admin key</strong>. Paste this into the "Admin Key" field in the Import Questions tab to import your questions.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                        <p className="text-sm text-yellow-900 dark:text-yellow-200">
                          <strong>⚠️ For Production:</strong>
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                          Change this to a secure random string in your Supabase dashboard:
                        </p>
                        <ol className="text-xs text-yellow-800 dark:text-yellow-300 mt-2 space-y-1 ml-4 list-decimal">
                          <li>Go to Supabase Dashboard → Edge Functions</li>
                          <li>Click on Settings → Secrets</li>
                          <li>Add/Update secret: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">ADMIN_IMPORT_KEY</code></li>
                          <li>Set it to a secure random string (e.g., generated UUID)</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-600">
                    <h3 className="font-semibold mb-2 dark:text-gray-100">Stripe Webhook Secret</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      For Stripe webhooks to work, you need to:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>Go to Stripe Dashboard → Developers → Webhooks</li>
                      <li>Add endpoint: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">https://[project-id].supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook</code></li>
                      <li>Select event: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">checkout.session.completed</code></li>
                      <li>Copy the webhook signing secret</li>
                      <li>Add it as <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">STRIPE_WEBHOOK_SECRET</code> in Supabase Edge Functions secrets</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    
    <Footer />
    </>
  );
}
