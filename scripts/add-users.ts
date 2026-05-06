import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvzecbcpuhmfytfdonfc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2emVjYmNwdWhtZnl0ZmRvbmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNTM2OSwiZXhwIjoyMDg5NDkxMzY5fQ.FH2vffqQoNjQSod2AWI_amNxn-X9XwpFX4o9ziYmlew';

if (!supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_SERVICE_KEY not set');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const users = [
  { email: 'hnb@fcis.com', password: 'TempPass123!' },
  { email: 'vreg@fcis.com', password: 'TempPass123!' },
  { email: 'idec@fcis.com', password: 'TempPass123!' },
  { email: 'c4h@fcis.com', password: 'TempPass123!' }
];

async function createUsers() {
  console.log('Creating users in Supabase...\n');
  
  for (const user of users) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.email.split('@')[0] }
      });
      
      if (error) {
        console.log(`❌ ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ ${user.email}: Created (ID: ${data.user?.id})`);
      }
    } catch (err) {
      console.log(`❌ ${user.email}: ${err}`);
    }
  }
  
  console.log('\nValidating users...');
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, status')
    .in('email', users.map(u => u.email));
    
  console.log('\nUsers in profiles table:');
  if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      console.log(`  - ${p.email}: role=${p.role || 'N/A'}, status=${p.status || 'N/A'}`);
    });
  } else {
    console.log('  No profiles found (users may need to log in first to trigger profile creation)');
  }
}

createUsers();