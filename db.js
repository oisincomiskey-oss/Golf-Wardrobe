import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ymeuyzmwvivjfkrfuall.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_m099ZWTeqsS6_UObt5H3pw_z0TnQnmw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to query any table (replace 'products' or pass your table name)
export async function getTableData(tableName = 'products') {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching data from table "${tableName}":`, error.message);
    throw error;
  }
  return data;
}

export default supabase;
