# Xero OAuth Setup Instructions

Since we're implementing the OAuth flow directly in the frontend for this test project (without a backend), you'll need to set up your environment variables.

## Step 1: Register Your Application with Xero

1. Go to https://developer.xero.com/app/manage
2. Create a new app or use an existing one
3. Note down your Client ID and Client Secret

## Step 2: Configure Your Redirect URI

In your Xero app settings, add this redirect URI:
```
http://localhost:5173/callback
```

## Step 3: Create Environment Variables

Create a file named `.env` in the `xero-auth` directory with the following content:

```
VITE_XERO_CLIENT_ID=your_actual_client_id_here
VITE_XERO_CLIENT_SECRET=your_actual_client_secret_here
VITE_XERO_REDIRECT_URI=http://localhost:5173/callback
```

Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with your actual Xero credentials.

## Step 4: Install Dependencies and Start the Application

```bash
npm install
npm run dev
```

## Important Security Note

This implementation stores the client secret in the frontend code, which is not recommended for production applications. For production, you should:
1. Implement a backend server to handle token exchange
2. Store client secrets securely on the server
3. Never expose client secrets in frontend code

For this test project, this approach is acceptable.
