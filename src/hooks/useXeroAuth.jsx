import { useState, useEffect } from 'react';

const useXeroAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  // Check if we have valid tokens on component mount
  useEffect(() => {
    const token = localStorage.getItem('xero_access_token');
    const tenant = localStorage.getItem('xero_tenant_id');
    
    if (token && tenant) {
      setAccessToken(token);
      setTenantId(tenant);
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    // Redirect to your backend auth endpoint
    window.location.href = '/api/xero/auth';
  };

  const logout = () => {
    localStorage.removeItem('xero_access_token');
    localStorage.removeItem('xero_tenant_id');
    setAccessToken(null);
    setTenantId(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    accessToken,
    tenantId,
    login,
    logout
  };
};

export default useXeroAuth;