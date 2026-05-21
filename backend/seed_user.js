import { supabase } from './supabaseClient.js';

async function createAdminUser() {
  console.log('Creating user from the backend...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@typingteacher.com',
    password: 'password123',
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
      console.log('\n✅ User created successfully!');
      console.log('Email: admin@typingteacher.com');
      console.log('Password: password123');
    }
  }
}

createAdminUser();
