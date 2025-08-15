# Xero OAuth Integration (Frontend Only)

This is a simple React + Vite application that demonstrates how to connect to Xero using OAuth 2.0 directly in the frontend (no backend required).

## Features

1. **Connection Status Indicator**
   - Visual indicator showing if you're connected to Xero
   - Green for connected, red for disconnected
   - Disconnect functionality to reset connection status

2. **OAuth 2.0 Flow**
   - Single sign-on with Xero
   - Request for specific payroll scopes:
     - `offline_access` - Allows refreshing access tokens
     - `payroll.employees.read` - Read access to employee payroll information
     - `payroll.timesheets` - Access to timesheet data for payroll processing

3. **Data Fetching and Display**
   - Fetch Employee Data button to retrieve actual employee information from Xero
   - Fetch Timesheets button to retrieve actual timesheet data from Xero
   - Tabular display of fetched data with appropriate styling
   - Error handling and loading states

4. **Token Management**
   - Automatic token refreshing when access tokens expire
   - Secure storage of tokens in localStorage
   - Proper cleanup when disconnecting

## Setup Instructions

See SETUP-INSTRUCTIONS.md for detailed setup instructions.

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Build

To build the application for production:

```bash
npm run build
```

## Security Considerations

⚠️ **Important**: This implementation stores the client secret in the frontend code, which is not recommended for production applications.

For production, you should:
1. Implement a backend server to handle token exchange
2. Store client secrets securely on the server
3. Never expose client secrets in frontend code

This approach is acceptable for test/development purposes only.
