import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import xeroService from './services/xeroService';
import './App.css';
import Cookies from 'js-cookie';

function ConnectButton() {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Checking connection...');
    const [employees, setEmployees] = useState([]);
    const [timesheets, setTimesheets] = useState([]);
    const [showEmployees, setShowEmployees] = useState(false);
    const [showTimesheets, setShowTimesheets] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper function to get cookies
    const getCookie = (name) => {
        return Cookies.get(name);
    };

    // Helper function to set cookies
    const setCookie = (name, value, options = {}) => {
        Cookies.set(name, value, options);
    };

    // Helper function to remove cookies
    const removeCookie = (name) => {
        Cookies.remove(name);
    };

    useEffect(() => {
        const checkConnection = () => {
            const storedAccessToken = getCookie('xero_access_token');
            const tokenExpiry = getCookie('xero_token_expiry');

            if (storedAccessToken && tokenExpiry) {
                const now = new Date().getTime();
                const expiry = parseInt(tokenExpiry);

                if (now < expiry) {
                    setIsConnected(true);
                    setConnectionStatus('Connected to Xero');
                } else {
                    const refreshToken = getCookie('xero_refresh_token');
                    if (refreshToken) {
                        refreshAccessToken(refreshToken);
                    } else {
                        setIsConnected(false);
                        setConnectionStatus('Not connected to Xero');
                    }
                }
            } else {
                setIsConnected(false);
                setConnectionStatus('Not connected to Xero');
            }
        };
        checkConnection();
    }, []);

    const refreshAccessToken = async (refreshToken) => {
        try {
            // Call the Vercel function
            const response = await fetch('/api/xero/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }), // Send refresh token in the body
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Store new tokens
            const expiryTime = new Date().getTime() + (data.expires_in * 1000);
            setCookie('xero_access_token', data.access_token, { secure: true, sameSite: 'strict' });
            setCookie('xero_refresh_token', data.refresh_token, { secure: true, sameSite: 'strict' });
            setCookie('xero_token_expiry', expiryTime.toString(), { secure: true, sameSite: 'strict' });
            setIsConnected(true);
            setConnectionStatus('Connected to Xero');
        } catch (err) {
            console.error('Error refreshing token:', err);
            removeCookie('xero_access_token');
            removeCookie('xero_refresh_token');
            removeCookie('xero_token_expiry');
            setIsConnected(false);
            setConnectionStatus('Not connected to Xero');
        }
    };

    const generateAuthUrl = () => {
        window.location.href = '/api/xero/authorize'; // Redirect to the Vercel function
    };

    const handleDisconnect = () => {
        const accessToken = getCookie('xero_access_token');
        if (accessToken) {

        }

        removeCookie('xero_access_token');
        removeCookie('xero_refresh_token');
        removeCookie('xero_token_expiry');
        removeCookie('xero_tenant_id');

        setIsConnected(false);
        setConnectionStatus('Not connected to Xero');
        setEmployees([]);
        setTimesheets([]);
        setShowEmployees(false);
        setShowTimesheets(false);
        setError('');
    };

    const getAccessToken = () => {
        const storedAccessToken = getCookie('xero_access_token');
        const tokenExpiry = getCookie('xero_token_expiry');

        if (storedAccessToken && tokenExpiry) {
            const now = new Date().getTime();
            const expiry = parseInt(tokenExpiry);

            if (now >= expiry) {
                const refreshToken = getCookie('xero_refresh_token');
                if (refreshToken) {
                    refreshAccessToken(refreshToken);
                    return null; // Will retry after refresh
                }
            }
        }

        return storedAccessToken;
    };

    const getTenantId = async (accessToken) => {
        const cachedTenantId = getCookie('xero_tenant_id');
        if (cachedTenantId) {
            console.log('Using cached tenant ID:', cachedTenantId);
            return cachedTenantId;
        }
        try {
            console.log('Fetching tenant ID with access token:', accessToken);
            const response = await fetch('/api/getTenantId', { // Call the Vercel function
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json', // Add content type
            },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch tenant ID: ${response.status}`);
            }
            const data = await response.json();
            console.log('Tenant data received:', data);
            if (data && data.tenantId) {
                const tenantId = data.tenantId;
                setCookie('xero_tenant_id', tenantId, { secure: true, sameSite: 'strict' });
                console.log('Tenant ID saved to cookie:', tenantId);
                return tenantId;
            } else {
                throw new Error('No tenants found');
            }
        } catch (err) {
            console.error('Error fetching tenant ID:', err);
            throw err;
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');

        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            const tenantId = await getTenantId(accessToken);
            if (!tenantId) {
                throw new Error('No tenant ID available');
            }

            console.log('Fetching employees with:', { accessToken: !!accessToken, tenantId });
            const response = await xeroService.getEmployees(accessToken, tenantId);
            console.log('Employee API response status:', response.status);
            console.log('Employee API response headers:', [...response.headers.entries()]);
            const data = await response.json();
            console.log('Employee data received:', data);

            if (data.employees) {
                setEmployees(data.employees);
                setShowEmployees(true);
            } else {
                setEmployees([]);
                setError('No employee data found in response');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError(`Error fetching employees: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimesheets = async () => {
        setLoading(true);
        setError('');

        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            const tenantId = await getTenantId(accessToken);
            if (!tenantId) {
                throw new Error('No tenant ID available');
            }

            console.log('Fetching timesheets with:', { accessToken: !!accessToken, tenantId });
            const response = await xeroService.getTimesheets(accessToken, tenantId);
            console.log('Timesheet API response status:', response.status);
            console.log('Timesheet API response headers:', [...response.headers.entries()]);
            const data = await response.json();
            console.log('Timesheet data received:', data);

            if (data.timesheets) {
                setTimesheets(data.timesheets);
                setShowTimesheets(true);
            } else {
                setTimesheets([]);
                setError('No timesheet data found in response');
            }
        } catch (error) {
            console.error('Error fetching timesheets:', error);
            setError(`Error fetching timesheets: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Xero OAuth Integration</h1>

            {/* Connection Status Indicator */}
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-indicator"></span>
                <span className="status-text">{connectionStatus}</span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="loading">
                    Fetching data...
                </div>
            )}

            <div className="card">
                {!isConnected ? (
                    <button onClick={generateAuthUrl} className="connect-button">
                        Connect to Xero
                    </button>
                ) : (
                    <div className="connected-actions">
                        <button onClick={handleDisconnect} className="disconnect-button">
                            Disconnect from Xero
                        </button>
                        <div className="action-buttons">
                            <button onClick={fetchEmployees} className="action-button" disabled={loading}>
                                Fetch Employee Data
                            </button>
                            <button onClick={fetchTimesheets} className="action-button" disabled={loading}>
                                Fetch Timesheets
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Display Section */}
            {showEmployees && (
                <div className="data-section">
                    <h2>Employee Data</h2>
                    {employees.length > 0 ? (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(employee => (
                                        <tr key={employee.employeeID}>
                                            <td>{employee.employeeID}</td>
                                            <td>{employee.firstName}</td>
                                            <td>{employee.lastName}</td>
                                            <td>{employee.email || 'N/A'}</td>
                                            <td>{employee.status || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No employees found.</p>
                    )}
                </div>
            )}

            {showTimesheets && (
                <div className="data-section">
                    <h2>Timesheet Data</h2>
                    {timesheets.length > 0 ? (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Employee ID</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timesheets.map(timesheet => (
                                        <tr key={timesheet.timesheetID}>
                                            <td>{timesheet.timesheetID}</td>
                                            <td>{timesheet.employeeID}</td>
                                            <td>{timesheet.startDate}</td>
                                            <td>{timesheet.endDate}</td>
                                            <td>{timesheet.totalHours}</td>
                                            <td>
                                                <span className={`status-badge ${timesheet.status?.toLowerCase()}`}>
                                                    {timesheet.status || 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No timesheets found.</p>
                    )}
                </div>
            )}

            <div className="instructions">
                <h2>Instructions:</h2>
                <ol>
                    <li>Click the "Connect to Xero" button above</li>
                    <li>You'll be redirected to Xero to authenticate</li>
                    <li>The application will request access to payroll data (employees and timesheets)</li>
                    <li>After authentication, you'll be redirected back to this app</li>
                    <li>The authorization code will be processed automatically</li>
                    <li>Use the "Fetch Employee Data" and "Fetch Timesheets" buttons to view actual Xero data</li>
                </ol>
            </div>
        </div>
    );
}


function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<ConnectButton />} />
            </Routes>
        </div>
    );
}

export default App;