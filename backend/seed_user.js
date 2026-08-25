import { supabase } from './supabaseClient.js';

// One-time local setup script — creates the first admin user. Reads
// credentials from environment variables instead of hardcoding them, since
// this file lives in a public repo. Run locally as:
//   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=<strong password> node seed_user.js

async function createAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables before running this script.');
    process.exit(1);
  }

  console.log('Creating admin user from the backend...');
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name: 'Super Admin' },
    email_confirm: true
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  // Insert into our users table
  if (data?.user) {
    const { error: dbError } = await supabase.from('users').insert([
      { id: data.user.id, email: data.user.email, name: 'Super Admin', role: 'admin' }
    ]);

    if (dbError) {
      console.error('Error adding to database table (did you run the SQL script?):', dbError.message);
    } else {
      console.log(`\n✅ Admin user created successfully: ${email}`);
    }
  }
}

createAdminUser();
