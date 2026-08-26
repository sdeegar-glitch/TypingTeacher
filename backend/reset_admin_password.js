import { supabase } from './supabaseClient.js';

// One-time local script — resets an admin user's password directly via the
// Supabase Admin API, using the service role key already in your local .env.
// No email access needed (unlike Supabase's dashboard "send recovery email").
//
// Run locally as:
//   RESET_ADMIN_EMAIL=admin@typingteacher.com RESET_ADMIN_NEW_PASSWORD=<strong password> node reset_admin_password.js

async function resetAdminPassword() {
  const email = process.env.RESET_ADMIN_EMAIL;
  const newPassword = process.env.RESET_ADMIN_NEW_PASSWORD;
  if (!email || !newPassword) {
    console.error('Set RESET_ADMIN_EMAIL and RESET_ADMIN_NEW_PASSWORD environment variables before running this script.');
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const { data: profile, error: findErr } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (findErr || !profile) {
    console.error(`No user found with email ${email}:`, findErr?.message || 'not found');
    process.exit(1);
  }

  const { error: updateErr } = await supabase.auth.admin.updateUserById(profile.id, { password: newPassword });
  if (updateErr) {
    console.error('Failed to update password:', updateErr.message);
    process.exit(1);
  }

  console.log(`\n✅ Password updated for ${email} (role: ${profile.role}). Log in with the new password.`);
}

resetAdminPassword();
