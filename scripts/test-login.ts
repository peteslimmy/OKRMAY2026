import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvzecbcpuhmfytfdonfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2emVjYmNwdWhtZnl0ZmRvbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTUzNjksImV4cCI6MjA4OTQ5MTM2OX0.cmp8xuWoUC6G3QSiOG3FhkA7DX1QqjNTJ58PC8F6Qzk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email: string, password: string) {
  console.log(`Testing login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.log('❌ Login failed:', error.message);
    return;
  }
  
  console.log('✅ Login successful!');
  console.log('  User ID:', data.user?.id);
  console.log('  Email:', data.user?.email);
  console.log('  Session:', data.session ? 'exists' : 'none');
  
  if (data.session) {
    console.log('  Expires at:', new Date(data.session.expires_at * 1000));
  }
}

testLogin('hnb@fcis.com', 'TempPass123!')
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });