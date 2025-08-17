// api/getEmployees.js
export default async function handler(req, res) {
  try {
    // console.log("getEmployees function called request: ", req.headers);
    const accessToken = req.headers.authorization.split(' ')[1]; // Extract from authorization header
    const tenantId = req.headers['xero-tenant-id'];
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
    console.log("getEmployees response data: ", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getEmployees Vercel function:", error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}