import 'dotenv/config';
import { supabase } from '../src/config/supabase.js';

async function testRpc() {
  console.log('Testing exec_sql RPC...');
  const sql = `SELECT 1;`;
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.log('exec_sql error:', error.message);
  } else {
    console.log('exec_sql works, data:', data);
  }
}

testRpc();
