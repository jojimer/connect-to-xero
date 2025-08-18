// api/getEmployees.js
export default async function handler(req, res) {
  try {
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
    // Extract access token and tenant ID from cookies
    const accessToken = cookies.xero_access_token; 
    const tenantId = cookies.xero_tenant_id;
    const apiUrl = `https://api.xero.com/payroll.xro/2.0/employees`; // Direct Xero API URL

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("Xero API error:", response.status, response.statusText);
      return res.status(response.status).json({ error: "Failed to fetch employees from Xero" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getEmployees Vercel function:", error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}