// services/xeroService.js

const xeroService = {
  getEmployees: async (accessToken, tenantId) => {
    const response = await fetch(`/api/getEmployees`, { // Vercel function URL
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
      } //Removed Accept:application/json because you can only set this on the server side
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },

  getTimesheets: async (accessToken, tenantId) => {
    const response = await fetch(`/api/getTimesheets`, { // Vercel function URL
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
      } //Removed Accept:application/json because you can only set this on the server side
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  },
};

export default xeroService;