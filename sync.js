// Netlify serverless function — proxies JSONbin requests
// Your API key stays here on the server, never exposed to the browser

const JB_KEY = process.env.JSONBIN_API_KEY;
const JB_BASE = 'https://api.jsonbin.io/v3/b';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!JB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { method, binId } = JSON.parse(event.body || '{}');

    // GET — load data
    if (method === 'GET' && binId) {
      const res = await fetch(`${JB_BASE}/${binId}/latest`, {
        headers: { 'X-Master-Key': JB_KEY }
      });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    // POST — create new bin
    if (method === 'POST') {
      const { payload } = JSON.parse(event.body);
      const res = await fetch(JB_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JB_KEY,
          'X-Bin-Name': 'GEP8 Class Data',
          'X-Bin-Private': 'true'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    // PUT — update existing bin
    if (method === 'PUT' && binId) {
      const { payload } = JSON.parse(event.body);
      const res = await fetch(`${JB_BASE}/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JB_KEY
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
