// api/xero/callback.js

export default async function handler(req, res) {
  const { code, state } = req.query;
      if (!req.cookies) {
        console.error("No cookies received");
        return res.status(400).send('State verification failed: No cookies received.');
      }
  const authStateCookie = req.cookies.xero_auth_state;
        if (!authStateCookie) {
            console.error("No state cookie found");
            return res.status(400).send('State verification failed: No state cookie found.');
        }

        if (state !== authStateCookie) {
            console.error("State mismatch:", state, authStateCookie);
            return res.status(400).send('State verification failed: State mismatch.');
        }
  if (!code) {
    console.error("No code received from Xero");
    return res.status(400).send('Authorization code missing');
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  try {
    const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenResponse.status, tokenResponse.statusText);
      return res.status(tokenResponse.status).send('Failed to exchange token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in, id_token, refresh_token } = tokenData;

    // **Get Tenant ID** (You'll need to call the Xero API to get tenant info)
    const connectionsResponse = await fetch("https://api.xero.com/connections", {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!connectionsResponse.ok) {
      console.error("Connections API error:", connectionsResponse.status, connectionsResponse.statusText);
      return res.status(connectionsResponse.status).send('Failed to fetch connections');
    }

    const connectionsData = await connectionsResponse.json();
    const tenantId = connectionsData[0].tenantId; // Assuming first connection is the relevant one

    // Set tokens as secure, HTTP-only cookies
      res.setHeader('Set-Cookie', [
        `xero_access_token=${access_token}; Path=/; Secure; HttpOnly; SameSite=Strict`,
        `xero_refresh_token=${refresh_token}; Path=/; Secure; HttpOnly; SameSite=Strict`,
        `xero_tenant_id=${tenantId}; Path=/; Secure; HttpOnly; SameSite=Strict`
    ]);    // Clear the state cookie
    res.setHeader('Set-Cookie', `xero_auth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`);

    // Respond to the client
    res.redirect('/');

  } catch (error) {
    console.error("Error in callback function:", error);
    res.status(500).send('Authentication failed');
  }
}