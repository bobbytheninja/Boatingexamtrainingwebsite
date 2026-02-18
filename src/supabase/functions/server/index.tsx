import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from "npm:stripe";
import * as kv from "./kv_store.tsx";
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
    console.error('[VerifyUser] ❌ No authorization header provided');
    return { error: 'No authorization header', user: null };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error('[VerifyUser] ❌ Invalid authorization header format. Parts:', parts.length, 'First part:', parts[0]);
    return { error: 'Invalid authorization header format', user: null };
  }

  const token = parts[1];
  if (!token) {
    console.error('[VerifyUser] ❌ No token provided after Bearer');
    return { error: 'No token provided', user: null };
  }

  const tokenSegments = token.split('.').length;
  console.log('[VerifyUser] Token verification attempt - Segments:', tokenSegments, 'Length:', token.length, 'First 30 chars:', token.substring(0, 30) + '...');

  try {
    console.log('[VerifyUser] 🔍 About to call supabase.auth.getUser() with token...');
    console.log('[VerifyUser] 🔍 Token type:', typeof token);
    console.log('[VerifyUser] 🔍 Token is string?', typeof token === 'string');
    console.log('[VerifyUser] 🔍 Token trimmed length:', token.trim().length);
    
    // Use service role client to verify the user's JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('[VerifyUser] ❌ Supabase auth.getUser error:', error.message);
      console.error('[VerifyUser] ❌ Error name:', error.name);
      console.error('[VerifyUser] ❌ Error status:', error.status);
      console.error('[VerifyUser] ❌ Full error object:', JSON.stringify(error, null, 2));
      return { error: error.message || 'Invalid token or user not found', user: null };
    }
    
    if (!user) {
      console.error('[VerifyUser] ❌ No user returned from token verification');
      return { error: 'Invalid token or user not found', user: null };
    }

    console.log('[VerifyUser] ✅ User verified successfully:', user.id, user.email);
    
    // ✅ NEW: Check if this token matches the stored active session
    const sessionKey = `active_session:${user.id}`;
    const activeSession = await kv.get(sessionKey);
    
    if (activeSession) {
      // If there's an active session stored, verify this token matches
      if (activeSession.token !== token) {
        console.log('[VerifyUser] ❌ Token mismatch - user logged in on another device');
        console.log('[VerifyUser] ℹ️ This session has been invalidated');
        return { error: 'Session invalidated - logged in on another device', user: null };
      }
      
      // Check if session is expired
      if (activeSession.expiresAt && activeSession.expiresAt < Date.now()) {
        console.log('[VerifyUser] ❌ Active session expired');
        await kv.del(sessionKey); // Clean up expired session
        return { error: 'Session expired', user: null };
      }
      
      console.log('[VerifyUser] ✅ Token matches active session - access granted');
    }
    
    return { error: null, user };
  } catch (err: any) {
    console.error('[VerifyUser] ❌ Exception during token verification:', err.message);
    console.error('[VerifyUser] ❌ Exception name:', err.name);
    console.error('[VerifyUser] ❌ Stack:', err.stack);
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

// Invalidate all other sessions for a user (for concurrent session limiting)
app.post("/make-server-d36f8f91/invalidate-sessions", async (c) => {
  try {
    if (!supabase) {
      return c.json({ message: 'Service unavailable - Authentication system not initialized' }, 503);
    }

    const authHeader = c.req.header('Authorization');
    console.log('[Session Invalidation] 📨 Received authorization header:', authHeader ? (authHeader.substring(0, 20) + '...') : 'NONE');
    
    const { error, user } = await verifyUser(authHeader);
    
    if (error || !user) {
      console.error('[Session Invalidation] ❌ User verification failed:', error);
      return c.json({ 
        message: 'Unauthorized',
        debug: {
          error: error,
          hasAuthHeader: !!authHeader,
          authHeaderPreview: authHeader ? authHeader.substring(0, 30) : 'missing'
        }
      }, 401);
    }

    console.log(`[Session Invalidation] 🔒 Invalidating ALL OTHER sessions for user ${user.id} (${user.email})`);

    // Extract the current token from the auth header
    const currentToken = authHeader?.split(' ')[1];
    
    // Store current session token in KV (this becomes the ONLY valid session)
    // All other sessions will be invalidated because they won't match this token
    const sessionKey = `active_session:${user.id}`;
    
    await kv.set(sessionKey, {
      token: currentToken,
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    });

    console.log(`[Session Invalidation] ✅ Set active session for user ${user.id}`);
    console.log(`[Session Invalidation] ℹ️ All other devices will be logged out when they try to access protected routes`);
    
    return c.json({ 
      message: 'All other sessions invalidated successfully',
      note: 'User has been logged out from all other devices. They will be prompted to log in again on those devices.'
    });
  } catch (error: any) {
    console.error('[Session Invalidation] ❌ Unexpected error:', error);
    return c.json({ message: 'Internal server error during session invalidation', error: error.message }, 500);
  }
});

// Contact form submission - send email
app.post("/make-server-d36f8f91/contact", async (c) => {
  console.log('[Contact] ===== NEW CONTACT FORM SUBMISSION =====');
  
  try {
    const resendApiKey = getEnv('RESEND_API_KEY');
    
    console.log('[Contact] Checking RESEND_API_KEY...', resendApiKey ? '✅ Present' : '❌ Missing');
    
    if (!resendApiKey) {
      console.error('[Contact] ❌ RESEND_API_KEY environment variable is not set!');
      return c.json({ message: 'Email service not configured' }, 503);
    }

    const body = await c.req.json();
    const { name, email, phone, message } = body;

    console.log('[Contact] Form data received:', { 
      name, 
      email,
      phone,
      messageLength: message?.length || 0 
    });

    if (!name || !email || !phone || !message) {
      console.error('[Contact] ❌ Missing required fields:', { 
        name: !!name, 
        email: !!email, 
        phone: !!phone,
        message: !!message 
      });
      return c.json({ message: 'Name, email, phone, and message are required' }, 400);
    }

    console.log('[Contact] Preparing email to send via Resend API...');

    // Send email using Resend API
    const emailPayload = {
      from: 'Yacht Exam Training <onboarding@resend.dev>',
      to: ['88xgdgbckn@privaterelay.appleid.com'], // Your Resend account email (forwards to bobby_rocks@me.com)
      subject: `New Contact Enquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0369a1; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px;">
            📧 New Contact Form Submission
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c4a6e;">Visitor Contact Details:</h3>
            
            <p style="margin: 10px 0;">
              <strong style="color: #0369a1;">Name:</strong><br/>
              ${name}
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #0369a1;">Email:</strong><br/>
              <a href="mailto:${email}" style="color: #0ea5e9;">${email}</a>
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #0369a1;">Phone:</strong><br/>
              <a href="tel:${phone}" style="color: #0ea5e9;">${phone}</a>
            </p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c4a6e;">Message:</h3>
            <p style="line-height: 1.6; color: #334155;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Sent from Yacht Exam Training Website Contact Form<br/>
            <a href="https://boatingexamtrainingwebsite.vercel.app" style="color: #0ea5e9;">boatingexamtrainingwebsite.vercel.app</a>
          </p>
        </div>
      `,
    };

    console.log('[Contact] Email payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('[Contact] Resend API response status:', emailResponse.status, emailResponse.statusText);

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      console.error('[Contact] ❌ Resend API error response:', JSON.stringify(errorData, null, 2));
      return c.json({ 
        message: 'Failed to send email', 
        error: errorData,
        status: emailResponse.status 
      }, 500);
    }

    const result = await emailResponse.json();
    console.log('[Contact] ✅ Email sent successfully! Resend response:', JSON.stringify(result, null, 2));

    return c.json({ 
      message: 'Email sent successfully',
      emailId: result.id 
    });
  } catch (error: any) {
    console.error('[Contact] ❌ Unexpected error while sending email:', error);
    console.error('[Contact] Error stack:', error.stack);
    return c.json({ 
      message: 'Internal server error while sending email',
      error: error.message 
    }, 500);
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
    console.log(`[Mock Questions API] Calling getFirstQuestions for ${examType}...`);
    const mockQuestions = await questions.getFirstQuestions(examType, 10);
    console.log(`[Mock Questions API] Found ${mockQuestions.length} mock questions for ${examType}`);

    if (mockQuestions.length === 0) {
      console.log(`[Mock Questions API] No questions found in database for ${examType}`);
      return c.json({ message: 'No questions available for this exam type' }, 404);
    }

    return c.json({ questions: mockQuestions });
  } catch (error: any) {
    console.error('[Mock Questions API] Error fetching mock questions:', error);
    console.error('[Mock Questions API] Error stack:', error.stack);
    console.error('[Mock Questions API] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return c.json({ 
      message: `Failed to fetch mock questions: ${error.message}`,
      error: error.message,
      details: error.stack 
    }, 500);
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

    // **COUNT IMAGES BEFORE IMPORT**
    const questionsWithImages = questionsToImport.filter(q => q.imageUrl && q.imageUrl.trim() !== '');
    const imageCount = questionsWithImages.length;
    const imagePercentage = ((imageCount / questionsToImport.length) * 100).toFixed(1);

    console.log(`[Import API] 🖼️ IMAGE STATS: ${imageCount}/${questionsToImport.length} questions have images (${imagePercentage}%)`);

    // Save all questions
    await questions.saveQuestions(questionsToImport);

    return c.json({ 
      message: 'Questions imported successfully',
      count: questionsToImport.length,
      imageCount: imageCount,
      imagePercentage: imagePercentage,
      imageStats: {
        total: questionsToImport.length,
        withImages: imageCount,
        withoutImages: questionsToImport.length - imageCount,
        percentage: imagePercentage,
      }
    });
  } catch (error: any) {
    console.error('Error importing questions:', error);
    return c.json({ message: 'Error importing questions', error: error.message }, 500);
  }
});

// Update question images (admin endpoint - requires special authorization)
app.post("/make-server-d36f8f91/questions/update-images", async (c) => {
  try {
    const body = await c.req.json();
    const { examType, imageLinks, adminKey } = body;

    // Simple admin key check
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    
    if (adminKey !== ADMIN_KEY) {
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!examType || !Array.isArray(imageLinks) || imageLinks.length === 0) {
      return c.json({ message: 'Invalid request data' }, 400);
    }

    console.log(`[Update Images API] Updating ${imageLinks.length} questions for ${examType} exam...`);

    let updatedCount = 0;

    // Update each question with its image URL
    for (const { questionNumber, url } of imageLinks) {
      const paddedNumber = String(questionNumber).padStart(3, '0');
      const questionId = `${examType}_${paddedNumber}`;
      
      // Get existing question
      const existingQuestion = await kv.get(questionId);
      
      if (existingQuestion) {
        // Update with image URL
        await kv.set(questionId, {
          ...existingQuestion,
          imageUrl: url,
        });
        updatedCount++;
        console.log(`  ✅ Updated question ${questionNumber} with image: ${url}`);
      } else {
        console.warn(`  ⚠️ Question ${questionNumber} (${questionId}) not found - skipping`);
      }
    }

    console.log(`[Update Images API] Successfully updated ${updatedCount}/${imageLinks.length} questions`);

    return c.json({ 
      message: `Successfully updated ${updatedCount} questions with images`,
      updated: updatedCount,
      total: imageLinks.length,
    });
  } catch (error: any) {
    console.error('Error updating question images:', error);
    return c.json({ message: 'Error updating question images', error: error.message }, 500);
  }
});

// Upload single image to Supabase Storage
app.post("/make-server-d36f8f91/images/upload", async (c) => {
  try {
    const body = await c.req.json();
    const { examType, questionNumber, base64Data, fileExt, mimeType, adminKey } = body;

    // Simple admin key check
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    
    if (adminKey !== ADMIN_KEY) {
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!examType || !questionNumber || !base64Data || !fileExt) {
      return c.json({ message: 'Missing required fields' }, 400);
    }

    if (!supabase) {
      return c.json({ message: 'Supabase client not initialized' }, 500);
    }

    const bucketName = 'make-d36f8f91-exam-images';

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`[Upload] Creating storage bucket: ${bucketName}`);
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      
      if (bucketError) {
        console.error('[Upload] Bucket creation error:', bucketError);
        return c.json({ message: `Failed to create storage bucket: ${bucketError.message}` }, 500);
      }
      
      console.log(`[Upload] ✅ Bucket created: ${bucketName}`);
    }

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload file
    const fileName = `${examType}/q${questionNumber}.${fileExt}`;
    
    console.log(`[Upload] Uploading ${fileName} (${bytes.length} bytes)`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, bytes, {
        contentType: mimeType,
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      console.error('[Upload] Upload error:', uploadError);
      return c.json({ message: `Failed to upload image: ${uploadError.message}` }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    console.log(`[Upload] ✅ Uploaded ${fileName}: ${publicUrl}`);

    // Update question with image URL using the questions module
    const paddedNumber = String(questionNumber).padStart(3, '0');
    const questionId = `${examType}_${paddedNumber}`;
    
    const existingQuestion = await questions.getQuestion(questionId);
    
    if (existingQuestion) {
      await kv.set(`question:${questionId}`, {
        ...existingQuestion,
        imageUrl: publicUrl,
      });
      console.log(`[Upload] ✅ Updated question ${questionId} in database`);
    } else {
      console.warn(`[Upload] ⚠️ Question ${questionNumber} not found in database (will add image URL anyway)`);
    }

    return c.json({
      message: 'Image uploaded successfully',
      url: publicUrl,
    });

  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return c.json({ message: `Error uploading image: ${error.message}` }, 500);
  }
});

// Database diagnostics endpoint (helps debug question loading issues)
app.get("/make-server-d36f8f91/diagnostics/questions", async (c) => {
  try {
    const examTypes = ['jet', 'small', 'big', 'yacht', 'navigation'];
    const diagnostics: any = {};

    for (const examType of examTypes) {
      const questionIds = await questions.getQuestionIds(examType);
      const count = questionIds.length;
      
      let sampleQuestionId = null;
      let sampleQuestion = null;

      if (questionIds.length > 0) {
        sampleQuestionId = questionIds[0];
        const q = await kv.get(sampleQuestionId);
        
        if (q) {
          sampleQuestion = {
            id: sampleQuestionId,
            questionNumber: q.questionNumber,
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

// Check specific question and image status
app.post("/make-server-d36f8f91/diagnostics/check-question", async (c) => {
  try {
    const body = await c.req.json();
    const { examType, questionNumber } = body;

    if (!examType || !questionNumber) {
      return c.json({ message: 'Missing examType or questionNumber' }, 400);
    }

    const paddedNumber = String(questionNumber).padStart(3, '0');
    const questionId = `${examType}_${paddedNumber}`;

    console.log(`[Diagnostics] Checking question: ${questionId}`);

    // Get question from database using the questions module
    const question = await questions.getQuestion(questionId);

    if (!question) {
      // Check if there are ANY questions for this exam type
      const questionIds = await questions.getQuestionIds(examType);
      
      return c.json({
        found: false,
        questionId,
        examType,
        questionNumber,
        message: `Question #${questionNumber} not found in database`,
        examTypeHasQuestions: questionIds.length > 0,
        totalQuestionsInExam: questionIds.length,
        suggestion: questionIds.length === 0 
          ? `No questions found for ${examType} exam. Please import questions first.`
          : `Question #${questionNumber} doesn't exist. Available questions: 1-${questionIds.length}`,
      });
    }

    // Check if image URL exists
    const hasImageUrl = !!question.imageUrl;
    let imageStatus = 'no_image';
    let imageAccessible = false;

    if (hasImageUrl) {
      // Try to check if image is accessible
      try {
        const response = await fetch(question.imageUrl, { method: 'HEAD' });
        imageAccessible = response.ok;
        imageStatus = imageAccessible ? 'image_ok' : 'image_url_exists_but_not_accessible';
      } catch (error) {
        imageStatus = 'image_url_exists_but_not_accessible';
      }
    }

    return c.json({
      found: true,
      questionId,
      question: {
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        answerA: question.answerA,
        answerB: question.answerB,
        answerC: question.answerC,
        answerD: question.answerD,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        imageUrl: question.imageUrl,
      },
      imageStatus: {
        hasImageUrl,
        imageUrl: question.imageUrl || null,
        imageAccessible,
        status: imageStatus,
        message: imageStatus === 'image_ok' 
          ? '✅ Image is uploaded and accessible'
          : hasImageUrl 
            ? '⚠️ Image URL exists but file may not be accessible'
            : '❌ No image uploaded for this question',
      },
    });
  } catch (error: any) {
    console.error('[Diagnostics] Error:', error);
    return c.json({ message: `Error checking question: ${error.message}` }, 500);
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