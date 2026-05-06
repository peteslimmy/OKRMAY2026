import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvzecbcpuhmfytfdonfc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2emVjYmNwdWhtZnl0ZmRvbmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNTM2OSwiZXhwIjoyMDg5NDkxMzY5fQ.FH2vffqQoNjQSod2AWI_amNxn-X9XwpFX4o9ziYmlew';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const users = [
  { id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60', email: 'hnb@fcis.com' },
  { id: '28297fd3-1927-48cc-8efd-2b40eef5232d', email: 'vreg@fcis.com' },
  { id: '9c2556ba-fa53-42c3-843b-6bab1420b49b', email: 'idec@fcis.com' },
  { id: '930023fe-833b-49fe-8e6d-126e1c4c0789', email: 'c4h@fcis.com' }
];

async function createProfiles() {
  console.log('Creating profiles...\n');
  
  for (const user of users) {
    const nameParts = user.email.split('@')[0].match(/[a-zA-Z]+|[0-9]+/g) || [];
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User';
    const lastName = nameParts.slice(1).join(' ');
    const lastNameCap = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : 'User';
    const name = user.email.split('@')[0];
    
    const { error } = await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      auth_id: user.id,
      email: user.email,
      firstName: firstName,
      lastName: lastNameCap,
      name: name,
      role: 'Manager',
      department: 'Strategic Planning',
      status: 'Active'
    }, { onConflict: 'id' });
    
    if (error) {
      console.log(`❌ ${user.email}: ${error.message}`);
    } else {
      console.log(`✅ ${user.email}: Profile created`);
    }
  }
  
  console.log('\nValidating profiles...');
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, status, firstName, lastName, department')
    .in('email', users.map(u => u.email));
    
  console.log('\n✅ All users validated:');
  profiles?.forEach(p => {
    console.log(`  - ${p.email}: ${p.firstName} ${p.lastName}, role=${p.role}, dept=${p.department}, status=${p.status}`);
  });
}

createProfiles();