// api/getTimesheets.js
export default async function handler(req, res) {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; // Extract from authorization header
    const tenantId = req.headers['xero-tenant-id'];
        const apiUrl = `https://api.xero.com/payroll.xro/2.0/timesheets`; // Direct Xero API URL


    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json'
      }
    });

      if (!response.ok) {
      console.error("Xero API error:", response.status, response.statusText);
      return res.status(response.status).json({ error: "Failed to fetch timesheets from Xero" });
    }


    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getTimesheets Vercel function:", error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
}