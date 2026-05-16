#!/usr/bin/env node

/**
 * Grant Admin Access Script
 *
 * This script grants admin privileges to a user by email.
 * It uses the Supabase Admin API directly.
 *
 * Usage:
 *   node grant-admin.mjs alexgramatikov@msn.com
 */

const SUPABASE_URL = 'https://abtrsjhvjfgcxxpkszwi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.error('');
  console.error('Get your service role key from:');
  console.error('https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi/settings/api');
  console.error('');
  console.error('Then run:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY="your-key-here"');
  console.error('node grant-admin.mjs alexgramatikov@msn.com');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email required');
  console.error('');
  console.error('Usage: node grant-admin.mjs <email>');
  console.error('Example: node grant-admin.mjs alexgramatikov@msn.com');
  process.exit(1);
}

async function grantAdmin(userEmail) {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔐 Granting Admin Access');
    console.log('═══════════════════════════════════════════════════');
    console.log('Email:', userEmail);
    console.log('');

    // Step 1: Find user by email
    console.log('Step 1: Finding user...');
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to list users: ${listResponse.statusText}`);
    }

    const { users } = await listResponse.json();
    const user = users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());

    if (!user) {
      console.error('❌ User not found with email:', userEmail);
      console.error('');
      console.error('Make sure the user has signed up first!');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('   - ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Current role:', user.user_metadata?.role || 'user');
    console.log('');

    // Step 2: Grant admin role
    console.log('Step 2: Granting admin role...');
    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update user: ${error}`);
    }

    const updatedUser = await updateResponse.json();

    console.log('✅ Admin access granted!');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Success!');
    console.log('═══════════════════════════════════════════════════');
    console.log(userEmail, 'is now an admin.');
    console.log('');
    console.log('They can now:');
    console.log('  ✓ Access the admin panel at /admin');
    console.log('  ✓ Manage exam categories');
    console.log('  ✓ Upload questions');
    console.log('  ✓ Grant/revoke licenses');
    console.log('  ✓ Manage partners');
    console.log('');
    console.log('The user needs to log out and log back in for changes to take effect.');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

grantAdmin(email);
