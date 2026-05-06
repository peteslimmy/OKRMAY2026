import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvzecbcpuhmfytfdonfc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2emVjYmNwdWhtZnl0ZmRvbmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNTM2OSwiZXhwIjoyMDg5NDkxMzY5fQ.FH2vffqQoNjQSod2AWI_amNxn-X9XwpFX4o9ziYmlew';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function check() {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(10);
    
  console.log('Current profiles:', JSON.stringify(profiles, null, 2));
}

check();