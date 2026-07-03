import 'dotenv/config';
import { supabase } from '../src/config/supabase.js';

async function checkSchema() {
  console.log('--- Inspecting Database Schema ---');
  
  const tables = ['users', 'records', 'qr_tokens', 'ai_jobs', 'ai_summaries_cache'];
  
  for (const table of tables) {
    console.log(`\nTable: ${table}`);
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`Error querying ${table}:`, error.message);
      } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      } else {
        console.log('Table is empty, trying to get structure...');
        // Let's do a dummy insert that fails or check if we can get anything
        console.log('No rows returned.');
      }
    } catch (e) {
      console.error(`Exception querying ${table}:`, e.message);
    }
  }
}

checkSchema();
