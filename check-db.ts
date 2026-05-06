import { supabase } from './src/lib/supabase';

(async () => {
  console.log('Checking database content...');
  
  const { data: bus, error: buErr } = await supabase.from('business_units').select('*');
  console.log(`Business Units: ${bus?.length || 0} found. Error: ${buErr?.message || 'none'}`);

  const { data: users, error: uErr } = await supabase.from('profiles').select('*');
  console.log(`Users: ${users?.length || 0} found. Error: ${uErr?.message || 'none'}`);

  const { data: acts, error: aErr } = await supabase.from('activities').select('*');
  console.log(`Activities: ${acts?.length || 0} found. Error: ${aErr?.message || 'none'}`);
})();