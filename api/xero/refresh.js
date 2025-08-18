// api/xero/refresh.js
export default async function handler(req, res) {
  // Get the cookie string from the headers
  const cookieString = req.headers.cookie || '';

    // Parse the cookie string into an object
  const cookies = {};
  if (cookieString) {
        const cookiePairs = cookieString.split(';');
        cookiePairs.forEach(pair => {
        const [key, value] = pair.trim().split('=');
        cookies[key] = value;
    });
  }

  const { refreshToken } = cookies.xero_refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;

  try {
    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      console.error("Token refresh error:", response.status, response.statusText);
      return res.status(response.status).json({ error: 'Failed to refresh token' });
    }

    const data = await response.json();
    res.status(200).json(data); // Return the new tokens

  } catch (error) {
    console.error("Error in refresh function:", error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
}