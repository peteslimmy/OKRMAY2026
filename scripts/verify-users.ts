import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://pvzecbcpuhmfytfdonfc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2emVjYmNwdWhtZnl0ZmRvbmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNTM2OSwiZXhwIjoyMDg5NDkxMzY5fQ.FH2vffqQoNjQSod2AWI_amNxn-X9XwpFX4o9ziYmlew'
);

async function check() {
  const { data } = await supabaseAdmin.from('profiles').select('id, email, name, role, department, status');
  console.log('✅ All users in database:');
  data?.forEach(u => console.log(`  - ${u.email}: ${u.name} | ${u.role} | ${u.department} | ${u.status}`));
}

check();