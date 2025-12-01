import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.4.0";
import * as kv from "./kv_store.ts";
import * as questions from "./questions.ts";

const app = new Hono();

// Safely get environment variables
function getEnv(key: string, defaultValue: string = ''): string {
  const value = Deno.env.get(key);
  if (!value && !defaultValue) {
    console.warn(`Warning: Environment variable ${key} is not set`);
  }
  return value || defaultValue;
}

// Create Supabase client with error handling
let supabase: any;
try {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Continue with null client - endpoints will handle this
}

// Initialize Stripe with error handling
let stripe: any;
try {
  const stripeKey = getEnv('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY environment variable is not set!');
    throw new Error('Missing Stripe secret key');
  }
  
  console.log('Initializing Stripe with key:', stripeKey.substring(0, 7) + '...');
  
  stripe = new Stripe(stripeKey, {
    apiVersion: '2024-10-28.acacia' as any,
  });
  
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error);
  // Continue with null stripe - payment endpoints will handle this
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user token
async function verifyUser(authHeader: string | null) {
  if (!supabase) {
    return { error: 'Service unavailable - Supabase not initialized', user: null };
  }

  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'No token provided', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { error: 'Invalid token or user not found', user: null };
    }

    return { error: null, user };
  } catch (err) {
    console.error('Error verifying user:', err);
    return { error: 'Error verifying authentication', user: null };
  }
}

// Helper function to check if user is admin
async function isAdmin(user: any): Promise<boolean> {
  // Check if user has admin role in metadata
  return user?.user_metadata?.role === 'admin' || false;
}

// Helper function to verify admin access
async function verifyAdmin(authHeader: string | null) {
  const { error, user } = await verifyUser(authHeader);
  
  if (error || !user) {
    return { error: error || 'Unauthorized', user: null, isAdmin: false };
  }

  const adminStatus = await isAdmin(user);
  
  if (!adminStatus) {
    return { error: 'Admin access required', user, isAdmin: false };
  }

  return { error: null, user, isAdmin: true };
}

// Health check endpoint (no auth required)
app.get("/make-server-d36f8f91/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Sign up endpoint
app.post("/make-server-d36f8f91/signup", async (c) => {
  try {
    if (!supabase) {
      return c.json({ message: 'Service unavailable - Authentication system not initialized' }, 503);
    }

    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ message: 'Email and password are required' }, 400);
    }

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user:', error);
      return c.json({ message: error.message }, 400);
    }

    // Initialize user preferences
    await kv.set(`preferences:${data.user.id}`, {
      language: 'English',
      darkMode: false,
      region: 'Bulgaria',
    });

    return c.json({ 
      message: 'User created successfully',
      userId: data.user.id,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ message: 'Internal server error during signup' }, 500);
  }
});

// Get user subscriptions
app.get("/make-server-d36f8f91/subscriptions", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const subscription = await kv.get(`subscription:${user.id}`);
    
    if (!subscription) {
      return c.json({ subscriptions: [], expiresAt: null });
    }

    // Check if subscription is expired
    const now = Date.now();
    if (subscription.expiresAt && subscription.expiresAt < now) {
      // Subscription expired, remove it
      await kv.del(`subscription:${user.id}`);
      return c.json({ subscriptions: [], expiresAt: null });
    }

    return c.json({ 
      subscriptions: subscription.examTypes || [], 
      expiresAt: subscription.expiresAt || null 
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ message: 'Error fetching subscriptions' }, 500);
  }
});

// Add subscription (for payment processing)
app.post("/make-server-d36f8f91/subscriptions", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { examTypes } = body;

    if (!Array.isArray(examTypes) || examTypes.length === 0) {
      return c.json({ message: 'Invalid exam types' }, 400);
    }

    // Get current subscription
    const currentSubscription = await kv.get(`subscription:${user.id}`) || { examTypes: [] };

    // Add new exam types (merge with existing)
    const allExamTypes = [...new Set([...currentSubscription.examTypes, ...examTypes])];

    // Set expiration to 30 days from now
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

    await kv.set(`subscription:${user.id}`, {
      examTypes: allExamTypes,
      expiresAt,
      updatedAt: Date.now(),
    });

    return c.json({ 
      message: 'Subscription updated successfully',
      subscriptions: allExamTypes,
      expiresAt,
    });
  } catch (error: any) {
    console.error('Error adding subscription:', error);
    return c.json({ message: 'Error updating subscription' }, 500);
  }
});

// Save exam result
app.post("/make-server-d36f8f91/exam-results", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { examType, score, totalPoints, passed, answers, mode, tier } = body;

    if (!examType || score === undefined || totalPoints === undefined) {
      return c.json({ message: 'Invalid exam result data' }, 400);
    }

    const timestamp = Date.now();
    const resultKey = `exam_result:${user.id}:${examType}:${timestamp}`;

    // Save exam result
    await kv.set(resultKey, {
      examType,
      score,
      totalPoints,
      passed,
      answers,
      mode,
      tier,
      timestamp,
      userId: user.id,
    });

    // Update user progress
    const progressKey = `progress:${user.id}:${examType}`;
    const currentProgress = await kv.get(progressKey) || {
      attempts: 0,
      bestScore: 0,
      lastAttempt: null,
    };

    const newProgress = {
      attempts: currentProgress.attempts + 1,
      bestScore: Math.max(currentProgress.bestScore || 0, score),
      lastAttempt: timestamp,
      lastPassed: passed,
    };

    await kv.set(progressKey, newProgress);

    return c.json({ 
      message: 'Exam result saved successfully',
      resultId: resultKey,
      progress: newProgress,
    });
  } catch (error: any) {
    console.error('Error saving exam result:', error);
    return c.json({ message: 'Error saving exam result' }, 500);
  }
});

// Get exam results history
app.get("/make-server-d36f8f91/exam-results/:examType?", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const examType = c.req.param('examType');
    const prefix = examType 
      ? `exam_result:${user.id}:${examType}:`
      : `exam_result:${user.id}:`;

    const results = await kv.getByPrefix(prefix);
    
    // Sort by timestamp descending (most recent first)
    const sortedResults = results.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({ results: sortedResults });
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    return c.json({ message: 'Error fetching exam results' }, 500);
  }
});

// Get user progress
app.get("/make-server-d36f8f91/progress/:examType?", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const examType = c.req.param('examType');
    
    if (examType) {
      // Get progress for specific exam type
      const progress = await kv.get(`progress:${user.id}:${examType}`);
      return c.json({ progress: progress || null });
    } else {
      // Get progress for all exam types
      const prefix = `progress:${user.id}:`;
      const allProgress = await kv.getByPrefix(prefix);
      return c.json({ progress: allProgress });
    }
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return c.json({ message: 'Error fetching progress' }, 500);
  }
});

// Get/Update user preferences
app.get("/make-server-d36f8f91/preferences", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const preferences = await kv.get(`preferences:${user.id}`);
    return c.json({ preferences: preferences || {} });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return c.json({ message: 'Error fetching preferences' }, 500);
  }
});

app.post("/make-server-d36f8f91/preferences", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { language, darkMode, region } = body;

    const currentPreferences = await kv.get(`preferences:${user.id}`) || {};
    
    const updatedPreferences = {
      ...currentPreferences,
      ...(language !== undefined && { language }),
      ...(darkMode !== undefined && { darkMode }),
      ...(region !== undefined && { region }),
      updatedAt: Date.now(),
    };

    await kv.set(`preferences:${user.id}`, updatedPreferences);

    return c.json({ 
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return c.json({ message: 'Error updating preferences' }, 500);
  }
});

// ============== STRIPE PAYMENT ENDPOINTS ==============

// Create Stripe Checkout Session
app.post("/make-server-d36f8f91/create-checkout-session", async (c) => {
  console.log('[Checkout] Starting checkout session creation...');
  
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('[Checkout] Authorization failed:', error);
    return c.json({ message: 'Unauthorized', error }, 401);
  }

  console.log('[Checkout] User verified:', user.id);

  if (!stripe) {
    console.error('[Checkout] Stripe not initialized! Check STRIPE_SECRET_KEY environment variable.');
    return c.json({ 
      message: 'Payment system unavailable - Stripe not configured',
      hint: 'Run: supabase secrets set STRIPE_SECRET_KEY=sk_test_...'
    }, 503);
  }

  if (!supabase) {
    console.error('[Checkout] Supabase not initialized!');
    return c.json({ message: 'Payment system unavailable - Database not configured' }, 503);
  }

  try {
    const body = await c.req.json();
    const { examTypes } = body;

    console.log('[Checkout] Exam types requested:', examTypes);

    if (!Array.isArray(examTypes) || examTypes.length === 0) {
      return c.json({ message: 'Invalid exam types - must be a non-empty array' }, 400);
    }

    // Price per exam type: €5 per month
    const pricePerExam = 500; // in cents
    const totalAmount = examTypes.length * pricePerExam;

    console.log('[Checkout] Total amount:', totalAmount, 'cents (€' + (totalAmount / 100) + ')');

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
    
    if (userError) {
      console.error('[Checkout] Error fetching user data:', userError);
      return c.json({ message: 'Error fetching user data', error: userError.message }, 500);
    }
    
    const userEmail = userData.user?.email || '';
    console.log('[Checkout] User email:', userEmail);

    if (!userEmail) {
      console.error('[Checkout] User has no email!');
      return c.json({ message: 'User email not found' }, 400);
    }

    // Create Stripe Checkout Session
    console.log('[Checkout] Creating Stripe session...');
    
    const origin = c.req.header('origin') || 'http://localhost:3000';
    console.log('[Checkout] Origin:', origin);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: examTypes.map((examType: string) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Yacht Exam Training - ${examType}`,
            description: `30-day access to ${examType} exam questions (for training purposes only)`,
          },
          unit_amount: pricePerExam,
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment`,
      customer_email: userEmail,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        examTypes: examTypes.join(','),
      },
    });

    console.log('[Checkout] ✅ Session created successfully:', session.id);

    return c.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Checkout] ❌ Error creating Stripe checkout session:', error);
    console.error('[Checkout] Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    return c.json({ 
      message: 'Error creating checkout session', 
      error: error.message,
      type: error.type,
      code: error.code,
    }, 500);
  }
});

// Stripe Webhook Handler
app.post("/make-server-d36f8f91/stripe-webhook", async (c) => {
  const signature = c.req.header('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return c.json({ message: 'Missing webhook signature or secret' }, 400);
  }

  try {
    const body = await c.req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Stripe webhook event:', event.type);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId || session.client_reference_id;
      const examTypesStr = session.metadata?.examTypes;

      if (userId && examTypesStr) {
        const examTypes = examTypesStr.split(',');

        // Get current subscription
        const currentSubscription = await kv.get(`subscription:${userId}`) || { examTypes: [] };

        // Add new exam types (merge with existing)
        const allExamTypes = [...new Set([...currentSubscription.examTypes, ...examTypes])];

        // Set expiration to 30 days from now
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

        await kv.set(`subscription:${userId}`, {
          examTypes: allExamTypes,
          expiresAt,
          updatedAt: Date.now(),
          stripeSessionId: session.id,
          amountPaid: session.amount_total,
          currency: session.currency,
        });

        console.log(`Subscription updated for user ${userId}:`, allExamTypes);
      }
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return c.json({ message: 'Webhook error', error: error.message }, 400);
  }
});

// Verify payment session (for frontend confirmation)
app.get("/make-server-d36f8f91/verify-payment/:sessionId", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const sessionId = c.req.param('sessionId');
    
    if (!sessionId) {
      return c.json({ message: 'Session ID required' }, 400);
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.userId === user.id) {
      return c.json({ 
        success: true,
        examTypes: session.metadata.examTypes?.split(',') || [],
      });
    }

    return c.json({ success: false, message: 'Payment not completed' }, 400);
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return c.json({ message: 'Error verifying payment', error: error.message }, 500);
  }
});

// ============== ACCOUNT MANAGEMENT ==============

// Delete account endpoint
app.delete("/make-server-d36f8f91/delete-account", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const userId = user.id;

    // Delete all user data from KV store
    // 1. Delete subscriptions
    await kv.del(`subscription:${userId}`);
    
    // 2. Delete preferences
    await kv.del(`preferences:${userId}`);
    
    // 3. Delete all exam results (using prefix matching)
    const examResults = await kv.getByPrefix(`exam_result:${userId}:`);
    const resultKeys = examResults.map((_, index) => `exam_result:${userId}:${index}`);
    if (resultKeys.length > 0) {
      await kv.mdel(resultKeys);
    }
    
    // 4. Delete all progress data
    const progressData = await kv.getByPrefix(`progress:${userId}:`);
    const progressKeys = progressData.map((_, index) => `progress:${userId}:${index}`);
    if (progressKeys.length > 0) {
      await kv.mdel(progressKeys);
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      return c.json({ message: 'Failed to delete account from authentication system' }, 500);
    }

    console.log(`Successfully deleted account for user ${userId}`);
    
    return c.json({ 
      message: 'Account successfully deleted',
      success: true,
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return c.json({ message: 'Error deleting account', error: error.message }, 500);
  }
});

// ============== ADMIN ENDPOINTS ==============

// Check if current user is admin (alternative endpoint path)
app.get("/make-server-d36f8f91/check-admin", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ isAdmin: false });
  }

  const adminStatus = await isAdmin(user);
  return c.json({ isAdmin: adminStatus });
});

// Check if current user is admin
app.get("/make-server-d36f8f91/admin/check", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ isAdmin: false });
  }

  const adminStatus = await isAdmin(user);
  return c.json({ isAdmin: adminStatus });
});

// List all users (admin only)
app.get("/make-server-d36f8f91/admin/users", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !adminStatus) {
    return c.json({ message: 'Admin access required' }, 403);
  }

  try {
    // Get all users from Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ message: 'Failed to list users' }, 500);
    }

    // Get subscription data for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (u) => {
        const subscription = await kv.get(`subscription:${u.id}`);
        const preferences = await kv.get(`preferences:${u.id}`);
        
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || 'N/A',
          role: u.user_metadata?.role || 'user',
          createdAt: u.created_at,
          subscriptions: subscription?.examTypes || [],
          expiresAt: subscription?.expiresAt || null,
          language: preferences?.language || 'English',
        };
      })
    );

    return c.json({ users: usersWithSubscriptions });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return c.json({ message: 'Error fetching users', error: error.message }, 500);
  }
});

// Grant licenses to a user (admin only)
app.post("/make-server-d36f8f91/admin/grant-licenses", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !adminStatus) {
    return c.json({ message: 'Admin access required' }, 403);
  }

  try {
    const body = await c.req.json();
    const { userId, examTypes } = body;

    if (!userId || !Array.isArray(examTypes)) {
      return c.json({ message: 'Invalid request data' }, 400);
    }

    // Get current subscription
    const currentSubscription = await kv.get(`subscription:${userId}`) || { examTypes: [] };

    // Add new exam types (merge with existing)
    const allExamTypes = [...new Set([...currentSubscription.examTypes, ...examTypes])];

    // Set expiration to 30 days from now
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

    await kv.set(`subscription:${userId}`, {
      examTypes: allExamTypes,
      expiresAt,
      updatedAt: Date.now(),
      grantedBy: user.id,
      grantedByAdmin: true,
    });

    console.log(`Admin ${user.email} granted licenses to user ${userId}:`, examTypes);

    return c.json({ 
      message: 'Licenses granted successfully',
      subscriptions: allExamTypes,
      expiresAt,
    });
  } catch (error: any) {
    console.error('Error granting licenses:', error);
    return c.json({ message: 'Error granting licenses', error: error.message }, 500);
  }
});

// Revoke licenses from a user (admin only)
app.post("/make-server-d36f8f91/admin/revoke-licenses", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !adminStatus) {
    return c.json({ message: 'Admin access required' }, 403);
  }

  try {
    const body = await c.req.json();
    const { userId, examTypes } = body;

    if (!userId || !Array.isArray(examTypes)) {
      return c.json({ message: 'Invalid request data' }, 400);
    }

    // Get current subscription
    const currentSubscription = await kv.get(`subscription:${userId}`) || { examTypes: [] };

    // Remove specified exam types
    const remainingExamTypes = currentSubscription.examTypes.filter(
      (type: string) => !examTypes.includes(type)
    );

    if (remainingExamTypes.length === 0) {
      // No licenses left, delete subscription
      await kv.del(`subscription:${userId}`);
      console.log(`Admin ${user.email} revoked all licenses from user ${userId}`);
      return c.json({ 
        message: 'All licenses revoked',
        subscriptions: [],
      });
    }

    // Update subscription with remaining licenses
    await kv.set(`subscription:${userId}`, {
      ...currentSubscription,
      examTypes: remainingExamTypes,
      updatedAt: Date.now(),
    });

    console.log(`Admin ${user.email} revoked licenses from user ${userId}:`, examTypes);

    return c.json({ 
      message: 'Licenses revoked successfully',
      subscriptions: remainingExamTypes,
    });
  } catch (error: any) {
    console.error('Error revoking licenses:', error);
    return c.json({ message: 'Error revoking licenses', error: error.message }, 500);
  }
});

// Make a user an admin (requires admin key for security)
app.post("/make-server-d36f8f91/admin/make-admin", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, adminKey } = body;

    // Require admin key for this sensitive operation
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    
    if (adminKey !== ADMIN_KEY) {
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!userId) {
      return c.json({ message: 'User ID required' }, 400);
    }

    // Update user metadata to add admin role
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    });

    if (error) {
      console.error('Error making user admin:', error);
      return c.json({ message: 'Failed to update user role' }, 500);
    }

    console.log(`User ${userId} is now an admin`);

    return c.json({ 
      message: 'User is now an admin',
      userId,
    });
  } catch (error: any) {
    console.error('Error making user admin:', error);
    return c.json({ message: 'Error updating user role', error: error.message }, 500);
  }
});

// ============== QUESTION ENDPOINTS ==============

// Get random questions for an exam (paid tier only)
app.get("/make-server-d36f8f91/questions/:examType", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('[Questions API] Unauthorized access attempt:', error);
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const examType = c.req.param('examType');
    
    console.log(`[Questions API] User ${user.email} requesting questions for exam type: ${examType}`);
    
    if (!examType) {
      return c.json({ message: 'Exam type required' }, 400);
    }

    // Verify user has subscription for this exam type
    const subscription = await kv.get(`subscription:${user.id}`);
    
    console.log(`[Questions API] User subscription:`, subscription);
    
    if (!subscription || !subscription.examTypes?.includes(examType)) {
      console.log(`[Questions API] User does not have subscription for ${examType}`);
      return c.json({ message: 'Subscription required for this exam type' }, 403);
    }

    // Check if subscription is expired
    if (subscription.expiresAt && subscription.expiresAt < Date.now()) {
      console.log(`[Questions API] User subscription expired at ${new Date(subscription.expiresAt)}`);
      return c.json({ message: 'Subscription expired' }, 403);
    }

    // Get random questions
    console.log(`[Questions API] Fetching questions for ${examType}...`);
    const examQuestions = await questions.getRandomQuestions(examType, 40);
    console.log(`[Questions API] Found ${examQuestions.length} questions for ${examType}`);

    if (examQuestions.length === 0) {
      console.log(`[Questions API] No questions found in database for ${examType}`);
      return c.json({ message: 'No questions available for this exam type' }, 404);
    }

    return c.json({ questions: examQuestions });
  } catch (error: any) {
    console.error('[Questions API] Error fetching questions:', error);
    return c.json({ message: 'Error fetching questions', error: error.message }, 500);
  }
});

// Get question count for exam type
app.get("/make-server-d36f8f91/questions/:examType/count", async (c) => {
  try {
    const examType = c.req.param('examType');
    
    if (!examType) {
      return c.json({ message: 'Exam type required' }, 400);
    }

    const count = await questions.getQuestionCount(examType);
    return c.json({ count, examType });
  } catch (error: any) {
    console.error('Error getting question count:', error);
    return c.json({ message: 'Error getting question count' }, 500);
  }
});

// Get mock/test questions (first 10 questions, no auth required)
app.get("/make-server-d36f8f91/questions/:examType/mock", async (c) => {
  try {
    const examType = c.req.param('examType');
    
    console.log(`[Mock Questions API] Requesting mock questions for exam type: ${examType}`);
    
    if (!examType) {
      return c.json({ message: 'Exam type required' }, 400);
    }

    // Get first 10 questions (sorted by question number)
    const mockQuestions = await questions.getFirstQuestions(examType, 10);
    console.log(`[Mock Questions API] Found ${mockQuestions.length} mock questions for ${examType}`);

    if (mockQuestions.length === 0) {
      console.log(`[Mock Questions API] No questions found in database for ${examType}`);
      return c.json({ message: 'No questions available for this exam type' }, 404);
    }

    return c.json({ questions: mockQuestions });
  } catch (error: any) {
    console.error('[Mock Questions API] Error fetching mock questions:', error);
    return c.json({ message: 'Error fetching mock questions', error: error.message }, 500);
  }
});

// Import questions (admin endpoint - requires special authorization)
app.post("/make-server-d36f8f91/questions/import", async (c) => {
  try {
    const body = await c.req.json();
    const { questions: questionsToImport, adminKey } = body;

    // Simple admin key check (you should change this to a secure key)
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    
    if (adminKey !== ADMIN_KEY) {
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!Array.isArray(questionsToImport) || questionsToImport.length === 0) {
      return c.json({ message: 'Invalid questions data' }, 400);
    }

    // Save all questions
    await questions.saveQuestions(questionsToImport);

    return c.json({ 
      message: 'Questions imported successfully',
      count: questionsToImport.length,
    });
  } catch (error: any) {
    console.error('Error importing questions:', error);
    return c.json({ message: 'Error importing questions', error: error.message }, 500);
  }
});

// Database diagnostics endpoint (helps debug question loading issues)
app.get("/make-server-d36f8f91/diagnostics/questions", async (c) => {
  try {
    const examTypes = ['jet', 'small', 'big', 'yacht', 'navigation'];
    const diagnostics: any = {};

    for (const examType of examTypes) {
      const count = await questions.getQuestionCount(examType);
      const questionIds = await questions.getQuestionIds(examType);
      
      // Get one sample question
      const sampleQuestionId = questionIds.length > 0 ? questionIds[0] : null;
      let sampleQuestion = null;
      
      if (sampleQuestionId) {
        const q = await questions.getQuestion(sampleQuestionId);
        if (q) {
          sampleQuestion = {
            id: q.id,
            questionText: q.questionText?.substring(0, 100) || 'No text',
            examType: q.examType,
            imageUrl: q.imageUrl || 'No image',
            hasImage: !!q.imageUrl,
          };
        }
      }

      diagnostics[examType] = {
        count,
        indexExists: questionIds.length > 0,
        sampleQuestionId,
        sampleQuestion,
      };
    }

    return c.json({ 
      diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error running diagnostics:', error);
    return c.json({ message: 'Error running diagnostics', error: error.message }, 500);
  }
});

// Delete all questions (admin only - for cleanup)
app.post("/make-server-d36f8f91/admin/delete-all-questions", async (c) => {
  try {
    const body = await c.req.json();
    const { adminKey } = body;

    // Require admin key
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    
    if (adminKey !== ADMIN_KEY) {
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    const examTypes = ['jet', 'small', 'big', 'yacht', 'navigation'];
    let totalDeleted = 0;

    for (const examType of examTypes) {
      const questionIds = await questions.getQuestionIds(examType);
      
      // Delete all questions for this exam type
      for (const id of questionIds) {
        await questions.deleteQuestion(id);
        totalDeleted++;
      }
      
      // Delete the index
      await kv.del(`questions_index:${examType}`);
    }

    console.log(`Deleted ${totalDeleted} questions from database`);

    return c.json({ 
      message: 'All questions deleted successfully',
      deleted: totalDeleted,
    });
  } catch (error: any) {
    console.error('Error deleting questions:', error);
    return c.json({ message: 'Error deleting questions', error: error.message }, 500);
  }
});

Deno.serve(app.fetch);