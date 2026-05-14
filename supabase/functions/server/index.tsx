import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

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

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper to check admin status
async function isAdmin(accessToken: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) return false;
    return data.user.user_metadata?.isAdmin === true;
  } catch {
    return false;
  }
}

// Health check endpoint
app.get("/make-server-d36f8f91/health", (c) => {
  return c.json({ status: "ok" });
});

// Check admin status
app.get("/make-server-d36f8f91/check-admin", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ isAdmin: false }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminStatus = await isAdmin(token);

  return c.json({ isAdmin: adminStatus });
});

// Get all users (admin only)
app.get("/make-server-d36f8f91/admin/users", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminStatus = await isAdmin(token);

  if (!adminStatus) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    // Get all users
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const users = data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'Unknown',
      role: user.user_metadata?.isAdmin ? 'admin' : 'user',
      createdAt: user.created_at,
      subscriptions: user.user_metadata?.paidExams || [],
      expiresAt: user.user_metadata?.subscriptionExpiresAt || null,
      language: user.user_metadata?.language || 'English',
    }));

    return c.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Grant admin access
app.post("/make-server-d36f8f91/grant-admin", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Update user metadata to set admin
    const { data, error } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      {
        user_metadata: {
          ...userData.user.user_metadata,
          isAdmin: true
        }
      }
    );

    if (error) throw error;

    return c.json({ success: true, message: 'Admin access granted' });
  } catch (error: any) {
    console.error('Error granting admin:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get categories
app.get("/make-server-d36f8f91/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    const categoryList = categories.map((cat: any) => {
      try {
        return typeof cat === 'string' ? JSON.parse(cat) : cat;
      } catch {
        return cat;
      }
    });

    return c.json({ categories: categoryList });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return c.json({ error: error.message, categories: [] }, 500);
  }
});

// Create/Update category (admin only)
app.post("/make-server-d36f8f91/admin/categories", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminStatus = await isAdmin(token);

  if (!adminStatus) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const body = await c.req.json();
    const { type, title, titleBg, description, descriptionBg, icon, color, image } = body;

    if (!type) {
      return c.json({ error: 'Category type is required' }, 400);
    }

    const category = {
      type,
      title: title || '',
      titleBg: titleBg || '',
      description: description || '',
      descriptionBg: descriptionBg || '',
      icon: icon || 'Ship',
      color: color || '#0ea5e9',
      image: image || '',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`category:${type}`, JSON.stringify(category));

    return c.json({ success: true, category });
  } catch (error: any) {
    console.error('Error saving category:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete category (admin only)
app.delete("/make-server-d36f8f91/admin/categories/:type", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminStatus = await isAdmin(token);

  if (!adminStatus) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const type = c.req.param('type');
    await kv.del(`category:${type}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Grant licenses to user (admin only)
app.post("/make-server-d36f8f91/admin/grant-licenses", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminStatus = await isAdmin(token);

  if (!adminStatus) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const body = await c.req.json();
    const { userId, examTypes } = body;

    if (!userId || !examTypes) {
      return c.json({ error: 'userId and examTypes are required' }, 400);
    }

    // Get user
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Calculate expiry (30 days from now)
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

    // Update user metadata
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...userData.user.user_metadata,
          paidExams: examTypes,
          subscriptionExpiresAt: expiresAt
        }
      }
    );

    if (error) throw error;

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error granting licenses:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
