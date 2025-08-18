// services/xeroService.js

const xeroService = {
  getEmployees: async () => {
    const response = await fetch(`/api/getEmployees`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },

  getTimesheets: async () => {
    const response = await fetch(`/api/getTimesheets`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  },
};

export default xeroService;