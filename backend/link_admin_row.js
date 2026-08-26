import { supabase } from './supabaseClient.js';

// One-time fix — recreates the missing `users` table row for an existing
// Supabase Auth user, linked by the exact auth id (not email, since that's
// what requireAdmin looks up by). Use this when diagnose_admin_login.js
// reports "NO ROW FOUND for id ...".
//
// Run as:
//   LINK_USER_ID=<auth id from diagnose_admin_login.js> LINK_EMAIL=admin@typingteacher.com node link_admin_row.js

async function linkAdminRow() {
  const id = process.env.LINK_USER_ID;
  const email = process.env.LINK_EMAIL;
  if (!id || !email) {
    console.error('Set LINK_USER_ID and LINK_EMAIL environment variables before running this script.');
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('users')
    .upsert({ id, email, name: 'Super Admin', role: 'admin' }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Failed to create/update the row:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ users row is now linked: ${JSON.stringify(data[0])}`);
  console.log('Log in again at /admin — this account should now pass the role check.');
}

linkAdminRow();
