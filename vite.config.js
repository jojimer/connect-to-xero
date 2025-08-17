import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
    'import.meta.env.VITE_XERO_CLIENT_ID': JSON.stringify(process.env.XERO_CLIENT_ID),
        'import.meta.env.VITE_XERO_CLIENT_SECRET': JSON.stringify(process.env.XERO_CLIENT_SECRET),
        'import.meta.env.VITE_XERO_REDIRECT_URI': JSON.stringify(process.env.XERO_REDIRECT_URI)
  }
});