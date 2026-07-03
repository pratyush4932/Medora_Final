import 'dotenv/config';
import { supabase } from '../src/config/supabase.js';

async function testTables() {
  const { data, error } = await supabase.from('patient_ai_summaries').select('*').limit(1);
  if (error) {
    console.log('patient_ai_summaries error:', error.message);
  } else {
    console.log('patient_ai_summaries exists, data:', data);
  }
}

testTables();
