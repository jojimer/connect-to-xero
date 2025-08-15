// services/xeroService.js
const API_BASE_URL = '/api'

const xeroService = {
  getEmployees: async (accessToken, tenantId) => {
    const response = await fetch(`${API_BASE_URL}/payroll.xro/2.0/employees`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json'
      }
    })
    return response
  },

  getTimesheets: async (accessToken, tenantId) => {
    const response = await fetch(`${API_BASE_URL}/payroll.xro/2.0/timesheets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json'
      }
    })
    return response
  }
}

export default xeroService