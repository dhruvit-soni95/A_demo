const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const testEmail = 'test@calgaryopera.com';
  const testPassword = 'TestPassword123!';

  console.log('Creating test user account...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    return;
  }

  console.log('✓ Auth user created:', authData.user?.id);

  const { error: patronError } = await supabase
    .from('patrons')
    .update({
      id: authData.user?.id,
      tessitura_id: 'TEST001',
      first_name: 'John',
      last_name: 'Patron',
      phone: '+1-403-555-0123',
      address_line1: '123 Opera Lane',
      city: 'Calgary',
      province: 'Alberta',
      postal_code: 'T2P 1J9',
      country: 'Canada',
    })
    .eq('email', testEmail);

  if (patronError) {
    console.error('Error updating patron:', patronError);
  } else {
    console.log('✓ Patron profile updated');
  }

  console.log('\n=================================');
  console.log('Test Account Created Successfully');
  console.log('=================================');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('=================================\n');
}

createTestUser();
