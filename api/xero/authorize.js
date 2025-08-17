// api/xero/authorize.js
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  const scope = 'offline_access payroll.employees.read payroll.timesheets accounting.settings'; // Define your scopes        
    // Generate a secure random state
    const state = randomBytes(16).toString('hex');

  if (!clientId || !redirectUri) {
    console.error("Missing Xero OAuth configuration");
    return res.status(500).send('Missing Xero OAuth configuration.');
  }

  const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

   // Set a secure, HTTP-only cookie with the state
   res.setHeader('Set-Cookie', `xero_auth_state=${state}; Path=/; Secure; HttpOnly; SameSite=Strict`);

  res.redirect(authUrl);
}