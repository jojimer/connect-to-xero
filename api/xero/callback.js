// api/xero/callback.js
export default async function handler(req, res) {
    console.log(req.url)
    const url = req.url;
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const code = urlParams.get('code')
    // const error = urlParams.get('error')
    // const state = urlParams.get('state')

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  console.log('Making token exchange request with:', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      });

  try {
    const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    // console.log("Token exchange response raw:", tokenResponse);

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenResponse.status, tokenResponse.statusText);
      return res.status(tokenResponse.status).send('Failed to exchange token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in, id_token, refresh_token } = tokenData;

    console.log("Token data:", tokenData);

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
    const expiryTime = new Date().getTime() + (expires_in * 1000)

    
    res.setHeader('Set-Cookie', [
        `xero_access_token=${access_token}; Path=/; Secure; SameSite=Strict`,
        `xero_refresh_token=${refresh_token}; Path=/; Secure; SameSite=Strict`,
        `xero_tenant_id=${tenantId}; Path=/; Secure; SameSite=Strict`,
        `xero_token_expiry=${expiryTime.toString()}; Path=/; Secure; SameSite=Strict`,
    ]);    // Clear the state cookie
    // res.setHeader('Set-Cookie', `xero_auth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`);

    // Respond to the client
    return res.redirect('/');

  } catch (error) {
    console.error("Error in callback function:", error);
    res.status(500).send('Authentication failed');
  }
}