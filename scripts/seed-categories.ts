/**
 * Seed Default Exam Categories
 *
 * Run this script to initialize default exam categories in the database
 *
 * Usage:
 *   deno run --allow-net --allow-env scripts/seed-categories.ts
 */

const projectId = 'abtrsjhvjfgcxxpkszwi';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('Set it with: export SUPABASE_SERVICE_ROLE_KEY="your-key-here"');
  Deno.exit(1);
}

const defaultCategories = [
  {
    type: 'jet',
    title: 'Jet Ski License',
    titleBg: 'Лиценз за джет',
    description: 'Test your knowledge for operating personal watercraft',
    descriptionBg: 'Тест на знанията ви за управление на водни мотоциклети',
    icon: 'Waves',
    color: '#06b6d4',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
  {
    type: 'small',
    title: 'Small Boat License',
    titleBg: 'Лиценз за малка лодка',
    description: 'Basic boating skills and safety knowledge',
    descriptionBg: 'Основни умения за управление на лодка и знания за безопасност',
    icon: 'Sailboat',
    color: '#0ea5e9',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
  },
  {
    type: 'big',
    title: 'Big Boat License',
    titleBg: 'Лиценз за голяма лодка',
    description: 'Advanced boat handling and navigation',
    descriptionBg: 'Разширено управление на лодка и навигация',
    icon: 'Ship',
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  },
  {
    type: 'yacht',
    title: 'Yacht License (Up to 50 Tons)',
    titleBg: 'Лиценз за яхта (до 50 тона)',
    description: 'Professional yacht operation and maritime law',
    descriptionBg: 'Професионално управление на яхта и морско право',
    icon: 'Anchor',
    color: '#6366f1',
    image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800',
  },
  {
    type: 'navigation',
    title: 'Navigation Device Exam',
    titleBg: 'Изпит за навигационно устройство',
    description: 'Electronic navigation systems and equipment',
    descriptionBg: 'Електронни навигационни системи и оборудване',
    icon: 'Compass',
    color: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
];

async function seedCategories() {
  console.log('🌱 Seeding default exam categories...\n');

  for (const category of defaultCategories) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/categories`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(category),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created: ${category.title} (${category.type})`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create ${category.title}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error creating ${category.title}:`, error);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('Verify at: https://blackseabulgaria.com');
}

seedCategories();
