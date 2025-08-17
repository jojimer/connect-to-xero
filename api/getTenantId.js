// api/getTenantId.js
export default async function handler(req, res) {
  const accessToken = req.headers.authorization.split(' ')[1]; // Extract from authorization header

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const response = await fetch('https://api.xero.com/connections', { // Use the direct Xero API URL
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("Connections API error:", response.status, response.statusText);
      return res.status(response.status).json({ error: 'Failed to fetch connections' });
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const tenantId = data[0].tenantId;
      res.status(200).json({ tenantId }); // Return the tenant ID
    } else {
      return res.status(404).json({ error: 'No tenants found' });
    }

  } catch (error) {
    console.error("Error in getTenantId function:", error);
    res.status(500).json({ error: 'Failed to fetch tenant ID' });
  }
}