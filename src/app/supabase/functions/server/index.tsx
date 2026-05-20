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
    } else {
      // No active session stored yet - this is fine (first login or session not set yet)
      console.log('[VerifyUser] ℹ️ No active session stored - allowing request (first login or setting session)');
    }
    
    return { error: null, user };
  } catch (err: any) {
    console.error('[VerifyUser] ❌ Exception during token verification:', err.message);
    console.error('[VerifyUser] ❌ Exception name:', err.name);
    console.error('[VerifyUser] ❌ Stack:', err.stack);
    return { error: 'Error verifying authentication', user: null };
  }
}

// Helper function to verify user token WITHOUT session checking (for setting new sessions)
async function verifyUserBasic(authHeader: string | null) {
  if (!supabase) {
    return { error: 'Service unavailable - Supabase not initialized', user: null };
  }

  if (!authHeader) {
    console.error('[VerifyUserBasic] ❌ No authorization header provided');
    return { error: 'No authorization header', user: null };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error('[VerifyUserBasic] ❌ Invalid authorization header format');
    return { error: 'Invalid authorization header format', user: null };
  }

  const token = parts[1];
  if (!token) {
    console.error('[VerifyUserBasic] ❌ No token provided after Bearer');
    return { error: 'No token provided', user: null };
  }

  try {
    // Use service role client to verify the user's JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('[VerifyUserBasic] ❌ Supabase auth.getUser error:', error.message);
      return { error: error.message || 'Invalid token or user not found', user: null };
    }
    
    if (!user) {
      console.error('[VerifyUserBasic] ❌ No user returned from token verification');
      return { error: 'Invalid token or user not found', user: null };
    }

    console.log('[VerifyUserBasic] ✅ User verified successfully:', user.id, user.email);
    return { error: null, user };
  } catch (err: any) {
    console.error('[VerifyUserBasic] ❌ Exception during token verification:', err.message);
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

// Debug endpoint to check raw subscription data (admin only)
app.get("/make-server-d36f8f91/admin/debug-subscription/:email", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));

  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const email = c.req.param('email');

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[DEBUG] Getting subscription data for:', email);
    console.log('═══════════════════════════════════════════════════');

    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      return c.json({ message: 'Failed to find user' }, 500);
    }

    const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return c.json({ message: 'User not found' }, 404);
    }

    console.log('[DEBUG] User found:', targetUser.id, targetUser.email);

    // Get raw subscription data
    const rawSubscription = await kv.get(`subscription:${targetUser.id}`);

    console.log('[DEBUG] Raw subscription data:', JSON.stringify(rawSubscription, null, 2));

    return c.json({
      email: targetUser.email,
      userId: targetUser.id,
      rawSubscription: rawSubscription,
      examTypes: rawSubscription?.examTypes || [],
      examTypesCount: rawSubscription?.examTypes?.length || 0,
      expiresAt: rawSubscription?.expiresAt || null,
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return c.json({ message: 'Error fetching subscription data', error: error.message }, 500);
  }
});

// Public endpoint to grant admin by email (requires only admin key, NO AUTH)
app.post("/make-server-d36f8f91/public/grant-admin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, adminKey } = body;

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[POST /public/grant-admin] PUBLIC REQUEST');
    console.log('═══════════════════════════════════════════════════');
    console.log('[grant-admin] Email:', email);

    // Require admin key for this sensitive operation (NO user auth needed)
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';

    if (!adminKey) {
      console.error('[grant-admin] ❌ No admin key provided');
      return c.json({ message: 'Admin key required' }, 400);
    }

    if (adminKey !== ADMIN_KEY) {
      console.error('[grant-admin] ❌ Invalid admin key');
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!email) {
      console.error('[grant-admin] ❌ No email provided');
      return c.json({ message: 'Email required' }, 400);
    }

    // Find user by email
    console.log('[grant-admin] Looking up user by email...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('[grant-admin] ❌ Error listing users:', listError);
      return c.json({ message: 'Failed to find user' }, 500);
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error('[grant-admin] ❌ User not found:', email);
      return c.json({ message: 'User not found with that email' }, 404);
    }

    console.log('[grant-admin] ✅ User found:', user.id, user.email);

    // Update user metadata to add admin role
    console.log('[grant-admin] Updating user metadata to grant admin role...');
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    });

    if (error) {
      console.error('[grant-admin] ❌ Error updating user metadata:', error);
      return c.json({ message: 'Failed to update user role' }, 500);
    }

    console.log(`[grant-admin] ✅ ${user.email} (${user.id}) is now an admin`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    return c.json({
      success: true,
      message: 'User is now an admin',
      email: user.email,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('[grant-admin] ❌ Exception:', error);
    console.error('[grant-admin] Stack:', error.stack);
    return c.json({ message: 'Error updating user role', error: error.message }, 500);
  }
});

// Sitemap XML endpoint (no auth required) - for SEO
app.get("/make-server-d36f8f91/sitemap.xml", (c) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://blackseabulgaria.com/</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>https://blackseabulgaria.com/login</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/pricing</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/partners</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/contact</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Exam Categories -->
  <url>
    <loc>https://blackseabulgaria.com/exam-mode/jetSki</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/exam-mode/smallBoat</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/exam-mode/bigBoat</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/exam-mode/yacht</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://blackseabulgaria.com/exam-mode/navigation</loc>
    <lastmod>2026-03-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  // Return XML with proper content type
  return c.body(sitemap, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  });
});

// Robots.txt endpoint (no auth required) - for SEO
app.get("/make-server-d36f8f91/robots.txt", (c) => {
  const robots = `# Black Sea Bulgaria - Yacht Exam Training
# https://blackseabulgaria.com

# Allow all search engines
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin
Disallow: /account
Disallow: /payment
Disallow: /payment-success

# Sitemap location
Sitemap: https://blackseabulgaria.com/sitemap.xml

# Crawl delay (be nice to the server)
Crawl-delay: 1
`;

  // Return plain text with proper content type
  return c.body(robots, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
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

// Lightweight session validity check — used by client polling to detect forced logout
app.get("/make-server-d36f8f91/session-check", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, user } = await verifyUser(authHeader);
  if (error || !user) {
    return c.json({ error }, 401);
  }
  return c.json({ valid: true });
});

// Invalidate all other sessions for a user (for concurrent session limiting)
app.post("/make-server-d36f8f91/invalidate-sessions", async (c) => {
  try {
    if (!supabase) {
      return c.json({ message: 'Service unavailable - Authentication system not initialized' }, 503);
    }

    const authHeader = c.req.header('Authorization');
    console.log('[Session Invalidation] 📨 Received authorization header:', authHeader ? (authHeader.substring(0, 20) + '...') : 'NONE');
    
    // Use verifyUserBasic instead of verifyUser to avoid session checking
    // (we're SETTING the session here, so we can't check if it matches yet!)
    const { error, user } = await verifyUserBasic(authHeader);
    
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

// Logout endpoint - clears the user's active session from KV store
app.post("/make-server-d36f8f91/logout", async (c) => {
  try {
    if (!supabase) {
      return c.json({ message: 'Service unavailable - Authentication system not initialized' }, 503);
    }

    const authHeader = c.req.header('Authorization');
    console.log('[Logout] 📨 Logout request received');
    
    // Use verifyUserBasic to avoid session checking (user is logging out, so session might be expired)
    const { error, user } = await verifyUserBasic(authHeader);
    
    if (error || !user) {
      console.error('[Logout] ❌ User verification failed:', error);
      // Even if verification fails, we should still try to clear local state
      return c.json({ message: 'Logged out (no active session to clear)' }, 200);
    }

    console.log(`[Logout] 🚪 Logging out user ${user.id} (${user.email})`);

    // Delete the active session from KV store
    const sessionKey = `active_session:${user.id}`;
    await kv.del(sessionKey);

    console.log(`[Logout] ✅ Cleared active session for user ${user.id}`);
    
    return c.json({ 
      message: 'Logged out successfully',
      note: 'Session cleared from server'
    });
  } catch (error: any) {
    console.error('[Logout] ❌ Unexpected error:', error);
    return c.json({ message: 'Internal server error during logout', error: error.message }, 500);
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
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[GET /subscriptions] REQUEST for user:', user.id);
    console.log('═══════════════════════════════════════════════════');

    const subscription = await kv.get(`subscription:${user.id}`);

    console.log('[GET /subscriptions] Raw subscription data:', JSON.stringify(subscription, null, 2));
    console.log('[GET /subscriptions] Exam types:', subscription?.examTypes);
    console.log('[GET /subscriptions] Exam types count:', subscription?.examTypes?.length);

    if (!subscription) {
      console.log('[GET /subscriptions] No subscription found, returning empty array');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      return c.json({ subscriptions: [], expiresAt: null });
    }

    // Check if subscription is expired
    const now = Date.now();
    if (subscription.expiresAt && subscription.expiresAt < now) {
      console.log('[GET /subscriptions] Subscription EXPIRED, deleting...');
      // Subscription expired, remove it
      await kv.del(`subscription:${user.id}`);
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      return c.json({ subscriptions: [], expiresAt: null });
    }

    // Normalize exam types: lowercase+trim only. Custom types (e.g. "yacht5otonesenglish") are
    // preserved as-is so deduplication doesn't collapse distinct subscriptions into one.
    const normalizedExamTypes = (subscription.examTypes || []).map((type: string) =>
      type.toLowerCase().trim()
    );

    // Remove duplicates from exam types array
    const uniqueExamTypes = [...new Set(normalizedExamTypes)];

    const result = {
      subscriptions: uniqueExamTypes,
      expiresAt: subscription.expiresAt || null
    };

    if (uniqueExamTypes.length !== subscription.examTypes?.length) {
      console.log('[GET /subscriptions] ⚠️ Cleaned subscription data');
      console.log('[GET /subscriptions] Original:', subscription.examTypes);
      console.log('[GET /subscriptions] Cleaned:', uniqueExamTypes);
    }

    console.log('[GET /subscriptions] Returning result:', JSON.stringify(result, null, 2));
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    return c.json(result);
  } catch (error: any) {
    console.error('[GET /subscriptions] ❌ ERROR:', error);
    console.error('[GET /subscriptions] Error stack:', error.stack);
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

    // Fetch categories to get dynamic pricing
    console.log('[Checkout] Fetching categories from KV store...');
    const categories = await kv.get('exam_categories') || [];
    console.log('[Checkout] Categories loaded:', categories);
    
    // Calculate total and prepare pricing info
    let totalAmount = 0;
    const pricingInfo: { [key: string]: number } = {};
    const blockedCategories: string[] = [];
    
    for (const examType of examTypes) {
      const category = Array.isArray(categories) 
        ? categories.find((cat: any) => cat.type === examType)
        : null;
      
      // 🚨 CHECK: Block purchase if category is marked as "expiring soon"
      if (category?.expiringSoon) {
        console.log(`[Checkout] ❌ Category ${examType} is marked as expiring soon - blocking purchase`);
        blockedCategories.push(examType);
        continue;
      }
      
      const pricePerExam = category?.price || 5; // Default to €5 if not found
      const priceInCents = pricePerExam * 100;
      totalAmount += priceInCents;
      pricingInfo[examType] = priceInCents;
      
      console.log(`[Checkout] ${examType}: €${pricePerExam} (${priceInCents} cents)`);
    }
    
    // If any categories are blocked, return error
    if (blockedCategories.length > 0) {
      return c.json({ 
        message: 'Some exam categories are no longer available for purchase',
        blockedCategories,
        hint: 'These exams are being phased out and cannot be purchased'
      }, 400);
    }

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
          unit_amount: pricingInfo[examType], // Use dynamic pricing per exam type
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

// Make a user an admin by email (requires admin key for security - NO AUTH HEADER NEEDED)
app.post("/make-server-d36f8f91/admin/make-admin-by-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email, adminKey } = body;

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[POST /admin/make-admin-by-email] REQUEST');
    console.log('═══════════════════════════════════════════════════');
    console.log('[make-admin-by-email] Email:', email);
    console.log('[make-admin-by-email] Admin key provided:', !!adminKey);

    // Require admin key for this sensitive operation (NO user auth needed)
    const ADMIN_KEY = Deno.env.get('ADMIN_IMPORT_KEY') || 'change-this-key';
    console.log('[make-admin-by-email] Expected admin key starts with:', ADMIN_KEY.substring(0, 5) + '...');

    if (!adminKey) {
      console.error('[make-admin-by-email] ❌ No admin key provided');
      return c.json({ message: 'Admin key required' }, 400);
    }

    if (adminKey !== ADMIN_KEY) {
      console.error('[make-admin-by-email] ❌ Invalid admin key provided');
      console.error('[make-admin-by-email] Received key starts with:', adminKey.substring(0, 5) + '...');
      return c.json({ message: 'Unauthorized - Invalid admin key' }, 401);
    }

    if (!email) {
      console.error('[make-admin-by-email] ❌ No email provided');
      return c.json({ message: 'Email required' }, 400);
    }

    // Find user by email
    console.log('[make-admin-by-email] Looking up user by email...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('[make-admin-by-email] ❌ Error listing users:', listError);
      return c.json({ message: 'Failed to find user' }, 500);
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error('[make-admin-by-email] ❌ User not found:', email);
      return c.json({ message: 'User not found with that email' }, 404);
    }

    console.log('[make-admin-by-email] ✅ User found:', user.id, user.email);

    // Update user metadata to add admin role
    console.log('[make-admin-by-email] Updating user metadata to grant admin role...');
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    });

    if (error) {
      console.error('[make-admin-by-email] ❌ Error updating user metadata:', error);
      return c.json({ message: 'Failed to update user role' }, 500);
    }

    console.log(`[make-admin-by-email] ✅ ${user.email} (${user.id}) is now an admin`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    return c.json({
      message: 'User is now an admin',
      email: user.email,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('[make-admin-by-email] ❌ Exception:', error);
    console.error('[make-admin-by-email] Stack:', error.stack);
    return c.json({ message: 'Error updating user role', error: error.message }, 500);
  }
});

// Grant admin access to a user (admin only - more secure than admin key)
app.post("/make-server-d36f8f91/admin/grant-admin-access", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));

  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({ message: 'User ID required' }, 400);
    }

    console.log(`Admin ${user.email} is granting admin access to user ${userId}`);

    // Update user metadata to add admin role
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    });

    if (updateError) {
      console.error('Error granting admin access:', updateError);
      return c.json({ message: 'Failed to update user role' }, 500);
    }

    console.log(`✅ User ${userId} is now an admin (granted by ${user.email})`);

    return c.json({
      message: 'Admin access granted successfully',
      userId,
    });
  } catch (error: any) {
    console.error('Error granting admin access:', error);
    return c.json({ message: 'Error granting admin access', error: error.message }, 500);
  }
});

// Revoke admin access from a user (admin only)
app.post("/make-server-d36f8f91/admin/revoke-admin-access", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));

  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({ message: 'User ID required' }, 400);
    }

    // Prevent self-revocation
    if (userId === user.id) {
      console.log(`❌ Admin ${user.email} tried to revoke their own admin access`);
      return c.json({ message: 'You cannot revoke your own admin access' }, 400);
    }

    // Count total admins before revoking
    console.log(`Checking total admin count before revoking access from user ${userId}...`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users to check admin count:', listError);
      return c.json({ message: 'Failed to verify admin count' }, 500);
    }

    const adminCount = users.filter(u => u.user_metadata?.role === 'admin').length;
    console.log(`Current admin count: ${adminCount}`);

    // Prevent revoking if this would leave zero admins
    if (adminCount <= 1) {
      console.log(`❌ Cannot revoke admin access - this would leave the system with zero admins!`);
      return c.json({
        message: 'Cannot revoke admin access - at least one admin must remain in the system',
        adminCount
      }, 400);
    }

    console.log(`Admin ${user.email} is revoking admin access from user ${userId}`);

    // Update user metadata to remove admin role
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'user' }
    });

    if (updateError) {
      console.error('Error revoking admin access:', updateError);
      return c.json({ message: 'Failed to update user role' }, 500);
    }

    console.log(`✅ Admin access revoked from user ${userId} (by ${user.email})`);
    console.log(`   Remaining admins: ${adminCount - 1}`);

    return c.json({
      message: 'Admin access revoked successfully',
      userId,
      remainingAdmins: adminCount - 1,
    });
  } catch (error: any) {
    console.error('Error revoking admin access:', error);
    return c.json({ message: 'Error revoking admin access', error: error.message }, 500);
  }
});

// Make a user an admin (requires admin key for security - fallback method)
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
    // Use registered categories, not a hardcoded list, so the UI matches what the admin set up.
    const categories = await kv.get('exam_categories') || [];
    const examTypes: string[] = Array.isArray(categories)
      ? categories.map((cat: any) => cat.type).filter(Boolean)
      : [];

    const diagnostics: any = {};

    for (const examType of examTypes) {
      const questionIds = await questions.getQuestionIds(examType);
      const count = questionIds.length;

      let sampleQuestionId = null;
      let sampleQuestion = null;

      if (questionIds.length > 0) {
        sampleQuestionId = questionIds[0];
        const q = await kv.get(`question:${sampleQuestionId}`);

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

// ============== PARTNER MANAGEMENT ENDPOINTS ==============

// Get all partners (public endpoint - no auth required)
app.get("/make-server-d36f8f91/partners", async (c) => {
  try {
    const partners = await kv.getByPrefix('partner:');
    
    // Return all language fields - frontend will pick the right one
    // Sort by order field (if exists) or by creation date
    const sortedPartners = partners.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    
    return c.json({ partners: sortedPartners });
  } catch (error: any) {
    console.error('Error fetching partners:', error);
    return c.json({ message: 'Error fetching partners' }, 500);
  }
});

// Get single partner (public endpoint)
app.get("/make-server-d36f8f91/partners/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const partner = await kv.get(`partner:${id}`);
    
    if (!partner) {
      return c.json({ message: 'Partner not found' }, 404);
    }
    
    return c.json({ partner });
  } catch (error: any) {
    console.error('Error fetching partner:', error);
    return c.json({ message: 'Error fetching partner' }, 500);
  }
});

// Create partner (admin only)
app.post("/make-server-d36f8f91/partners", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const body = await c.req.json();
    const { 
      name, 
      description, 
      specializations,
      website, 
      classesLink, 
      image,
      order 
    } = body;

    if (!name || !description || !website) {
      return c.json({ message: 'Missing required fields: name, description, website' }, 400);
    }

    // Generate unique ID
    const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const partner = {
      id,
      name,
      description,
      specializations: specializations || [],
      website,
      classesLink: classesLink || website,
      image: image || '',
      order: order !== undefined ? order : Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await kv.set(`partner:${id}`, partner);

    return c.json({ 
      message: 'Partner created successfully',
      partner,
    });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return c.json({ message: 'Error creating partner' }, 500);
  }
});

// Update partner (admin only)
app.put("/make-server-d36f8f91/partners/:id", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const id = c.req.param('id');
    const existingPartner = await kv.get(`partner:${id}`);
    
    if (!existingPartner) {
      return c.json({ message: 'Partner not found' }, 404);
    }

    const body = await c.req.json();
    const { 
      name, 
      description, 
      specializations,
      website, 
      classesLink, 
      image,
      order 
    } = body;

    if (!name || !description || !website) {
      return c.json({ message: 'Missing required fields: name, description, website' }, 400);
    }
    
    const updatedPartner = {
      id,
      name,
      description,
      specializations: specializations || [],
      website,
      classesLink: classesLink || website,
      image: image || '',
      order: order !== undefined ? order : existingPartner.order,
      createdAt: existingPartner.createdAt,
      updatedAt: Date.now(),
    };

    await kv.set(`partner:${id}`, updatedPartner);

    return c.json({ 
      message: 'Partner updated successfully',
      partner: updatedPartner,
    });
  } catch (error: any) {
    console.error('Error updating partner:', error);
    return c.json({ message: 'Error updating partner' }, 500);
  }
});

// Delete partner (admin only)
app.delete("/make-server-d36f8f91/partners/:id", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const id = c.req.param('id');
    const existingPartner = await kv.get(`partner:${id}`);
    
    if (!existingPartner) {
      return c.json({ message: 'Partner not found' }, 404);
    }

    await kv.del(`partner:${id}`);

    return c.json({ 
      message: 'Partner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return c.json({ message: 'Error deleting partner' }, 500);
  }
});

// Cleanup endpoint - removes old multilingual fields from all partners
app.post("/make-server-d36f8f91/partners/cleanup", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error === 'Unauthorized' ? 401 : 403);
  }

  try {
    const partners = await kv.getByPrefix('partner:');
    let cleanedCount = 0;

    for (const partner of partners) {
      // Keep only the core fields, remove all language-specific fields
      const cleanedPartner = {
        id: partner.id,
        name: partner.name,
        description: partner.description,
        specializations: partner.specializations || [],
        website: partner.website,
        classesLink: partner.classesLink,
        image: partner.image,
        order: partner.order,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt,
      };

      await kv.set(`partner:${partner.id}`, cleanedPartner);
      cleanedCount++;
    }

    return c.json({ 
      message: `Successfully cleaned ${cleanedCount} partners`,
      count: cleanedCount
    });
  } catch (error: any) {
    console.error('Error cleaning up partners:', error);
    return c.json({ message: 'Error cleaning up partners' }, 500);
  }
});

// ============== CATEGORY MANAGEMENT ==============

// Initialize default categories if they don't exist
async function initializeDefaultCategories() {
  console.log('[Server] Checking for existing categories...');
  const existingCategories = await kv.get('exam_categories');
  console.log('[Server] Existing categories:', existingCategories);
  console.log('[Server] Exists?', !!existingCategories);
  console.log('[Server] Is array?', Array.isArray(existingCategories));
  console.log('[Server] Array length:', Array.isArray(existingCategories) ? existingCategories.length : 'N/A');
  
  // Initialize if categories don't exist OR if the array is empty
  if (!existingCategories || (Array.isArray(existingCategories) && existingCategories.length === 0)) {
    console.log('[Server] Initializing default exam categories...');
    
    const defaultCategories = [
      {
        type: 'jet',
        title: 'Jet Ski License',
        titleBg: 'Лиценз за джет',
        description: 'Master jet ski operation and safety procedures',
        descriptionBg: 'Овладейте управлението на джет и процедурите за безопасност',
        icon: 'Waves',
        color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
        image: 'https://images.unsplash.com/photo-1721798974342-7b2b859493a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjBvY2VhbnxlbnwxfHx8fDE3NjIzMjEyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'small',
        title: 'Small Boat License',
        titleBg: 'Лиценз за малка лодка',
        description: 'Learn fundamentals of small boat navigation and handling',
        descriptionBg: 'Научете основите на навигацията и управлението на малки лодки',
        icon: 'Ship',
        color: 'bg-gradient-to-br from-sky-500 to-blue-600',
        image: 'https://images.unsplash.com/photo-1759809278956-70c6a72eecdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJvYXQlMjBzYWlsaW5nfGVufDF8fHx8MTc2MjM1NDIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'big',
        title: 'Big Boat License',
        titleBg: 'Лиценз за голяма лодка',
        description: 'Advanced training for operating larger vessels',
        descriptionBg: 'Разширено обучение за управление на по-големи съдове',
        icon: 'Anchor',
        color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1604930270269-67876a4cbe4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHNoaXAlMjBkZWNrfGVufDF8fHx8MTc2MjM1NDIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'yacht',
        title: 'Yacht License (Up to 50 Tons)',
        titleBg: 'Лиценз за яхта (до 50 тона)',
        description: 'Professional certification for yacht operation and management',
        descriptionBg: 'Професионална сертификация за управление на яхти',
        icon: 'Sailboat',
        color: 'bg-gradient-to-br from-indigo-600 to-purple-700',
        image: 'https://images.unsplash.com/photo-1598737285721-29346a5c9278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMG9jZWFufGVufDF8fHx8MTc2MjMwMjQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'navigation',
        title: 'Navigation Device License',
        titleBg: 'Лиценз за навигационно устройство',
        description: 'Expert knowledge of marine navigation equipment and systems',
        descriptionBg: 'Експертни познания за морско навигационно оборудване',
        icon: 'Compass',
        color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        image: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZpZ2F0aW9uJTIwY29tcGFzcyUyMG1hcmluZXxlbnwxfHx8fDE3NjIzNTQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
    ];
    
    await kv.set('exam_categories', defaultCategories);
    console.log('[Server] ✅ Default categories initialized');
    console.log('[Server] Stored categories:', defaultCategories);
  } else {
    console.log('[Server] Categories already exist, skipping initialization');
  }
}

// Debug endpoint to manually initialize categories (admin only)
app.post("/make-server-d36f8f91/debug/init-categories", async (c) => {
  console.log('');
  console.log('███████████████████████████████████████████████████');
  console.log('[POST /debug/init-categories] REQUEST RECEIVED');
  console.log('███████████████████████████████████████████████████');
  
  const authHeader = c.req.header('Authorization');
  console.log('[POST /debug/init-categories] Auth header present:', !!authHeader);
  
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(authHeader);
  
  console.log('[POST /debug/init-categories] Admin verification:');
  console.log('[POST /debug/init-categories]   - Error:', error);
  console.log('[POST /debug/init-categories]   - User:', user?.email);
  console.log('[POST /debug/init-categories]   - Is Admin:', adminStatus);
  
  if (error || !user || !adminStatus) {
    console.log('[POST /debug/init-categories] ❌ UNAUTHORIZED - Admin access required');
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    console.log('[POST /debug/init-categories] ✅ Admin verified, initializing categories...');
    
    const defaultCategories = [
      {
        type: 'jet',
        title: 'Jet Ski License',
        titleBg: 'Лиценз за джет',
        description: 'Master jet ski operation and safety procedures',
        descriptionBg: 'Овладейте управлението на джет и процедурите за безопасност',
        icon: 'Waves',
        color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
        image: 'https://images.unsplash.com/photo-1721798974342-7b2b859493a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjBvY2VhbnxlbnwxfHx8fDE3NjIzMjEyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'small',
        title: 'Small Boat License',
        titleBg: 'Лиценз за малка лодка',
        description: 'Learn fundamentals of small boat navigation and handling',
        descriptionBg: 'Научете основите на навигацията и управлението на малки лодки',
        icon: 'Ship',
        color: 'bg-gradient-to-br from-sky-500 to-blue-600',
        image: 'https://images.unsplash.com/photo-1759809278956-70c6a72eecdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJvYXQlMjBzYWlsaW5nfGVufDF8fHx8MTc2MjM1NDIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'big',
        title: 'Big Boat License',
        titleBg: 'Лиценз за голяма лодка',
        description: 'Advanced training for operating larger vessels',
        descriptionBg: 'Разширено обучение за управление на по-големи съдове',
        icon: 'Anchor',
        color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1604930270269-67876a4cbe4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHNoaXAlMjBkZWNrfGVufDF8fHx8MTc2MjM1NDIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'yacht',
        title: 'Yacht License (Up to 50 Tons)',
        titleBg: 'Лиценз за яхта (до 50 тона)',
        description: 'Professional certification for yacht operation and management',
        descriptionBg: 'Професионална сертификация за управление на яхти',
        icon: 'Sailboat',
        color: 'bg-gradient-to-br from-indigo-600 to-purple-700',
        image: 'https://images.unsplash.com/photo-1598737285721-29346a5c9278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMG9jZWFufGVufDF8fHx8MTc2MjMwMjQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'navigation',
        title: 'Navigation Device License',
        titleBg: 'Лиценз за навигационно устройство',
        description: 'Expert knowledge of marine navigation equipment and systems',
        descriptionBg: 'Експертни познания за морско навигационно оборудване',
        icon: 'Compass',
        color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        image: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZpZ2F0aW9uJTIwY29tcGFzcyUyMG1hcmluZXxlbnwxfHx8fDE3NjIzNTQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
    ];
    
    console.log('[POST /debug/init-categories] Saving to KV store key: exam_categories');
    console.log('[POST /debug/init-categories] Data to save:', JSON.stringify(defaultCategories, null, 2));
    
    await kv.set('exam_categories', defaultCategories);
    
    console.log('[POST /debug/init-categories] ✅ Data saved to KV store');
    
    // Verify it was saved
    const verification = await kv.get('exam_categories');
    console.log('[POST /debug/init-categories] Verification read from KV:', JSON.stringify(verification, null, 2));
    
    console.log('███████████████████████████████████████████████████');
    console.log('[POST /debug/init-categories] RESPONSE SENT - SUCCESS');
    console.log('███████████████████████████████████████████████████');
    console.log('');
    
    return c.json({ 
      message: 'Categories initialized successfully', 
      categories: defaultCategories 
    });
  } catch (error: any) {
    console.error('[POST /debug/init-categories] ❌ ERROR:', error);
    console.error('[POST /debug/init-categories] Error stack:', error.stack);
    console.log('███████████████████████████████████████████████████');
    console.log('[POST /debug/init-categories] RESPONSE SENT - ERROR');
    console.log('███████████████████████████████████████████████████');
    console.log('');
    return c.json({ message: 'Error initializing categories', error: error.message }, 500);
  }
});

// Initialize categories on server start
initializeDefaultCategories().catch(console.error);

// Get all categories
app.get("/make-server-d36f8f91/categories", async (c) => {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[GET /categories] REQUEST RECEIVED');
    console.log('═══════════════════════════════════════════════════');
    
    console.log('[GET /categories] Fetching from KV store key: exam_categories');
    const categories = await kv.get('exam_categories');
    
    console.log('[GET /categories] Raw data from KV:');
    console.log('[GET /categories]   - Type:', typeof categories);
    console.log('[GET /categories]   - Is Array:', Array.isArray(categories));
    console.log('[GET /categories]   - Value:', JSON.stringify(categories, null, 2));
    
    let result = categories || [];
    
    // Add default price to categories that don't have one
    if (Array.isArray(result)) {
      result = result.map((cat: any) => ({
        ...cat,
        price: cat.price !== undefined ? cat.price : 5, // Default to 5 if price is missing
      }));
    }
    
    console.log('[GET /categories] Final result to return:');
    console.log('[GET /categories]   - Array length:', Array.isArray(result) ? result.length : 'N/A');
    console.log('[GET /categories]   - Data:', JSON.stringify(result, null, 2));
    console.log('═══════════════════════════════════════════════════');
    console.log('[GET /categories] RESPONSE SENT');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    
    return c.json({ categories: result });
  } catch (error: any) {
    console.error('[GET /categories] ❌ ERROR:', error);
    console.error('[GET /categories] Error stack:', error.stack);
    return c.json({ message: 'Error fetching categories', error: error.message }, 500);
  }
});

// Public endpoint to force-initialize categories (no admin required)
app.post("/make-server-d36f8f91/categories/force-init", async (c) => {
  try {
    console.log('');
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('[POST /categories/force-init] PUBLIC REQUEST RECEIVED');
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('[POST /categories/force-init] Force initializing categories...');
    
    const defaultCategories = [
      {
        type: 'jet',
        title: 'Jet Ski License',
        titleBg: 'Лиценз за джет',
        description: 'Master jet ski operation and safety procedures',
        descriptionBg: 'Овладейте управлението на джет и процедурите за безопасност',
        icon: 'Waves',
        color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
        image: 'https://images.unsplash.com/photo-1721798974342-7b2b859493a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjBvY2VhbnxlbnwxfHx8fDE3NjIzMjEyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'small',
        title: 'Small Boat License',
        titleBg: 'Лиценз за малка лодка',
        description: 'Learn fundamentals of small boat navigation and handling',
        descriptionBg: 'Научете основите на навигацията и управлението на малки лодки',
        icon: 'Ship',
        color: 'bg-gradient-to-br from-sky-500 to-blue-600',
        image: 'https://images.unsplash.com/photo-1759809278956-70c6a72eecdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJvYXQlMjBzYWlsaW5nfGVufDF8fHx8MTc2MjM1NDIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'big',
        title: 'Big Boat License',
        titleBg: 'Лиценз за голяма лодка',
        description: 'Advanced training for operating larger vessels',
        descriptionBg: 'Разширено обучение за управление на по-големи съдове',
        icon: 'Anchor',
        color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1604930270269-67876a4cbe4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHNoaXAlMjBkZWNrfGVufDF8fHx8MTc2MjM1NDIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'yacht',
        title: 'Yacht License (Up to 50 Tons)',
        titleBg: 'Лиценз за яхта (до 50 тона)',
        description: 'Professional certification for yacht operation and management',
        descriptionBg: 'Професионална сертификация за управление на яхти',
        icon: 'Sailboat',
        color: 'bg-gradient-to-br from-indigo-600 to-purple-700',
        image: 'https://images.unsplash.com/photo-1598737285721-29346a5c9278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMG9jZWFufGVufDF8fHx8MTc2MjMwMjQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
      {
        type: 'navigation',
        title: 'Navigation Device License',
        titleBg: 'Лиценз за навигационно устройство',
        description: 'Expert knowledge of marine navigation equipment and systems',
        descriptionBg: 'Експертни познания за морско навигационно оборудване',
        icon: 'Compass',
        color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        image: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZpZ2F0aW9uJTIwY29tcGFzcyUyMG1hcmluZXxlbnwxfHx8fDE3NjIzNTQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        price: 5,
      },
    ];
    
    console.log('[POST /categories/force-init] Saving to KV store key: exam_categories');
    console.log('[POST /categories/force-init] Data to save:', JSON.stringify(defaultCategories, null, 2));
    
    await kv.set('exam_categories', defaultCategories);
    
    console.log('[POST /categories/force-init] ✅ Data saved to KV store');
    
    // Verify it was saved
    const verification = await kv.get('exam_categories');
    console.log('[POST /categories/force-init] Verification read from KV:', JSON.stringify(verification, null, 2));
    
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('[POST /categories/force-init] RESPONSE SENT - SUCCESS');
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('');
    
    return c.json({ 
      success: true,
      message: 'Categories initialized successfully', 
      categories: defaultCategories 
    });
  } catch (error: any) {
    console.error('[POST /categories/force-init] ❌ ERROR:', error);
    console.error('[POST /categories/force-init] Error stack:', error.stack);
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('[POST /categories/force-init] RESPONSE SENT - ERROR');
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('');
    return c.json({ success: false, message: 'Error initializing categories', error: error.message }, 500);
  }
});

// Add or update a category (admin only)
app.post("/make-server-d36f8f91/categories", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    const body = await c.req.json();
    const { category, isUpdate } = body;

    if (!category || !category.type || !category.title || !category.description) {
      return c.json({ message: 'Missing required fields' }, 400);
    }

    // Get current categories
    const categories = await kv.get('exam_categories') || [];

    if (isUpdate) {
      // Update existing category
      const index = categories.findIndex((c: any) => c.type === category.type);
      if (index === -1) {
        return c.json({ message: 'Category not found' }, 404);
      }
      categories[index] = category;
    } else {
      // Add new category
      const exists = categories.some((c: any) => c.type === category.type);
      if (exists) {
        return c.json({ message: 'Category already exists' }, 400);
      }
      categories.push(category);
    }

    await kv.set('exam_categories', categories);
    
    console.log(`Category ${isUpdate ? 'updated' : 'added'}:`, category.type);
    
    return c.json({ 
      message: isUpdate ? 'Category updated successfully' : 'Category added successfully',
      category 
    });
  } catch (error: any) {
    console.error('Error saving category:', error);
    return c.json({ message: 'Error saving category', error: error.message }, 500);
  }
});

// Delete a category (admin only)
app.delete("/make-server-d36f8f91/categories/:type", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    const categoryType = c.req.param('type');
    
    if (!categoryType) {
      return c.json({ message: 'Category type required' }, 400);
    }

    // Get current categories
    const categories = await kv.get('exam_categories') || [];
    
    const index = categories.findIndex((c: any) => c.type === categoryType);
    if (index === -1) {
      return c.json({ message: 'Category not found' }, 404);
    }

    // Remove the category
    categories.splice(index, 1);
    
    await kv.set('exam_categories', categories);
    
    console.log('Category deleted:', categoryType);
    
    // 🚨 CLEANUP: Remove this category from ALL user subscriptions
    console.log(`[Delete Category] Removing ${categoryType} from all user subscriptions...`);
    const allSubscriptions = await kv.getByPrefix('subscription:');
    let cleanedCount = 0;
    
    for (const { key, value } of allSubscriptions) {
      if (value && Array.isArray(value.examTypes)) {
        const originalLength = value.examTypes.length;
        value.examTypes = value.examTypes.filter((sub: string) => sub !== categoryType);

        if (value.examTypes.length < originalLength) {
          await kv.set(key, value);
          cleanedCount++;
          console.log(`[Delete Category] Removed ${categoryType} from ${key}`);
        }
      }
    }
    
    console.log(`[Delete Category] Cleaned up ${cleanedCount} user subscriptions`);
    
    return c.json({ 
      message: 'Category deleted successfully',
      usersAffected: cleanedCount
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return c.json({ message: 'Error deleting category', error: error.message }, 500);
  }
});

// ============== REGIONS ==============

// Get all regions
app.get("/make-server-d36f8f91/regions", async (c) => {
  try {
    const regions = await kv.get('regions') || ['Bulgaria'];
    return c.json({ regions });
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return c.json({ regions: ['Bulgaria'] });
  }
});

// Add a region (admin only)
app.post("/make-server-d36f8f91/regions", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }
  try {
    const body = await c.req.json();
    const name = (body.name || '').trim();
    if (!name) return c.json({ message: 'Region name required' }, 400);
    const regions: string[] = await kv.get('regions') || ['Bulgaria'];
    if (regions.includes(name)) return c.json({ message: 'Region already exists' }, 409);
    regions.push(name);
    await kv.set('regions', regions);
    return c.json({ regions, message: 'Region added' });
  } catch (error: any) {
    return c.json({ message: 'Error adding region', error: error.message }, 500);
  }
});

// Delete a region (admin only)
app.delete("/make-server-d36f8f91/regions/:name", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }
  try {
    const name = decodeURIComponent(c.req.param('name'));
    const regions: string[] = await kv.get('regions') || ['Bulgaria'];
    const filtered = regions.filter((r: string) => r !== name);
    if (filtered.length === regions.length) return c.json({ message: 'Region not found' }, 404);
    await kv.set('regions', filtered);
    return c.json({ regions: filtered, message: 'Region deleted' });
  } catch (error: any) {
    return c.json({ message: 'Error deleting region', error: error.message }, 500);
  }
});

// ============== PRICING SETTINGS ==============

// Get overall pricing settings
app.get("/make-server-d36f8f91/pricing-settings", async (c) => {
  try {
    console.log('');
    console.log('💰💰💰 [GET /pricing-settings] Request received');
    const settings = await kv.get('pricing_settings');
    console.log('💰 [GET /pricing-settings] Raw settings from KV:', JSON.stringify(settings));
    console.log('💰 [GET /pricing-settings] Settings type:', typeof settings);
    const result = settings || { overallPrice: 5 };
    console.log('💰 [GET /pricing-settings] Final result:', JSON.stringify(result));
    console.log('💰💰💰 [GET /pricing-settings] Returning settings');
    console.log('');
    return c.json({ settings: result });
  } catch (error: any) {
    console.error('❌ [GET /pricing-settings] Error fetching pricing settings:', error);
    console.error('❌ [GET /pricing-settings] Error message:', error.message);
    console.error('❌ [GET /pricing-settings] Error stack:', error.stack);
    // Return default pricing on error instead of failing
    return c.json({ settings: { overallPrice: 5 } });
  }
});

// Update overall pricing settings (admin only)
app.post("/make-server-d36f8f91/pricing-settings", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    console.error('❌ [POST /pricing-settings] Auth failed:', { error, user: user?.id, isAdmin: adminStatus });
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    const body = await c.req.json();
    const { overallPrice } = body;

    console.log('');
    console.log('💰💰💰 [POST /pricing-settings] Save request received');
    console.log('💰 [POST /pricing-settings] Request body:', JSON.stringify(body));
    console.log('💰 [POST /pricing-settings] overallPrice value:', overallPrice);
    console.log('💰 [POST /pricing-settings] overallPrice type:', typeof overallPrice);

    if (overallPrice === undefined || overallPrice === null) {
      console.error('❌ [POST /pricing-settings] Validation failed: price is undefined or null');
      return c.json({ message: 'Overall price is required' }, 400);
    }

    if (typeof overallPrice !== 'number' || overallPrice < 0 || overallPrice > 100) {
      console.error('❌ [POST /pricing-settings] Validation failed: invalid number or out of range');
      return c.json({ message: 'Overall price must be a number between 0 and 100' }, 400);
    }

    const settings = { overallPrice };
    console.log('💰 [POST /pricing-settings] Settings to save:', JSON.stringify(settings));
    
    await kv.set('pricing_settings', settings);
    console.log('💰 [POST /pricing-settings] KV.SET completed successfully');
    
    // Verify the save by reading it back
    const verification = await kv.get('pricing_settings');
    console.log('💰 [POST /pricing-settings] Verification read from KV:', JSON.stringify(verification));
    
    console.log('💰💰💰 [POST /pricing-settings] Save completed successfully');
    console.log('');
    
    return c.json({ message: 'Pricing settings updated successfully', settings });
  } catch (error: any) {
    console.error('❌ [POST /pricing-settings] Error updating pricing settings:', error);
    console.error('❌ [POST /pricing-settings] Error message:', error.message);
    console.error('❌ [POST /pricing-settings] Error stack:', error.stack);
    return c.json({ message: 'Error updating pricing settings', error: error.message }, 500);
  }
});

// ============== ANALYTICS ==============

// Get active subscribers for a specific exam type (admin only)
app.get("/make-server-d36f8f91/analytics/subscribers/:examType", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    const examType = c.req.param('examType');
    
    if (!examType) {
      return c.json({ message: 'Exam type required' }, 400);
    }

    console.log(`[Analytics] Fetching subscribers for exam type: ${examType}`);
    
    // Get all subscriptions
    const allSubscriptions = await kv.getByPrefix('subscription:');
    const subscribers: any[] = [];
    const now = Date.now();
    
    for (const { key, value } of allSubscriptions) {
      if (value && Array.isArray(value.examTypes) && value.examTypes.includes(examType)) {
        const userId = key.replace('subscription:', '');
        
        // Check if subscription is still active
        const isActive = !value.expiresAt || value.expiresAt > now;
        
        if (isActive) {
          // Get user details from Supabase
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
          
          if (!userError && userData?.user) {
            subscribers.push({
              userId: userId,
              email: userData.user.email,
              name: userData.user.user_metadata?.name || 'N/A',
              expiresAt: value.expiresAt,
              expiryDate: value.expiresAt ? new Date(value.expiresAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A',
              daysRemaining: value.expiresAt ? Math.ceil((value.expiresAt - now) / (24 * 60 * 60 * 1000)) : null
            });
          }
        }
      }
    }
    
    console.log(`[Analytics] Found ${subscribers.length} active subscribers for ${examType}`);
    
    return c.json({ 
      examType,
      totalActiveSubscribers: subscribers.length,
      subscribers: subscribers.sort((a, b) => (b.daysRemaining || 0) - (a.daysRemaining || 0))
    });
  } catch (error: any) {
    console.error('[Analytics] Error fetching subscribers:', error);
    return c.json({ message: 'Error fetching subscribers', error: error.message }, 500);
  }
});

// Get overview of all exam types with subscriber counts (admin only)
app.get("/make-server-d36f8f91/analytics/overview", async (c) => {
  const { error, user, isAdmin: adminStatus } = await verifyAdmin(c.req.header('Authorization'));
  
  if (error || !user || !adminStatus) {
    return c.json({ message: error || 'Admin access required' }, error ? 401 : 403);
  }

  try {
    console.log('[Analytics] Fetching overview of all exam types');
    
    // Get all categories
    const categories = await kv.get('exam_categories') || [];
    
    // Get all subscriptions
    const allSubscriptions = await kv.getByPrefix('subscription:');
    const now = Date.now();
    
    // Count active subscribers per exam type
    const subscriberCounts: { [key: string]: number } = {};
    
    for (const { value } of allSubscriptions) {
      if (value && Array.isArray(value.examTypes)) {
        const isActive = !value.expiresAt || value.expiresAt > now;

        if (isActive) {
          for (const examType of value.examTypes) {
            subscriberCounts[examType] = (subscriberCounts[examType] || 0) + 1;
          }
        }
      }
    }
    
    // Build overview with category details
    const overview = Array.isArray(categories) 
      ? categories.map((cat: any) => ({
          type: cat.type,
          title: cat.title,
          titleBg: cat.titleBg,
          activeSubscribers: subscriberCounts[cat.type] || 0,
          expiringSoon: cat.expiringSoon || false,
          price: cat.price || 5
        }))
      : [];
    
    console.log('[Analytics] Overview generated for', overview.length, 'exam types');
    
    return c.json({ 
      overview,
      totalCategories: overview.length,
      totalActiveSubscriptions: Object.values(subscriberCounts).reduce((sum, count) => sum + count, 0)
    });
  } catch (error: any) {
    console.error('[Analytics] Error fetching overview:', error);
    return c.json({ message: 'Error fetching overview', error: error.message }, 500);
  }
});

Deno.serve(app.fetch);