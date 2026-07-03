import 'dotenv/config';

const isLocal = process.argv.includes('--local');
const localUrl = `http://localhost:${process.env.PORT || 5000}`;
const publicUrl = process.env.PUBLIC_URL;

const baseUrl = isLocal ? localUrl : (publicUrl || localUrl);
const endpoint = `${baseUrl}/ai/run-scheduler`;

console.log(`Triggering scheduler at: ${endpoint}`);

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text();

  if (response.ok) {
    console.log('✅ Scheduler triggered successfully:');
    try {
      console.log(JSON.parse(text));
    } catch {
      console.log(text);
    }
  } else {
    console.error(`❌ Failed to trigger scheduler (Status: ${response.status}):`);
    console.error(text);
  }
} catch (error) {
  console.error('❌ Error triggering scheduler:');
  console.error(error.message);
  console.log('\nMake sure the server is running and the URL is correct.');
}
