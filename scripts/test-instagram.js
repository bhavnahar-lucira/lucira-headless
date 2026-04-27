const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

async function testConnection() {
  const env = loadEnv();
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = '17841474216178936';

  console.log('--- Instagram Connection Test ---');
  console.log('Token exists:', !!token);
  
  if (!token) {
    console.error('Error: INSTAGRAM_ACCESS_TOKEN not found in .env.local');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${instagramId}/media?fields=id,caption,media_url,permalink,media_type&access_token=${token}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', data.error.message);
      if (data.error.message.includes('expired')) {
        console.log('\nTip: Use the /api/instagram/refresh endpoint to refresh your token.');
      }
    } else {
      console.log('Success! Connection established.');
      console.log('Latest post ID:', data.data?.[0]?.id);
      console.log('Sample Caption:', data.data?.[0]?.caption?.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  }
}

testConnection();
