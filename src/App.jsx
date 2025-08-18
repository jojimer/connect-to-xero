import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

    // Helper function to remove cookies
    const removeCookie = (name) => {
        Cookies.remove(name);
    };

    useEffect(() => {
        const checkConnection = () => {
            const tokenExpiry = getCookie('xero_token_expiry');

            if (tokenExpiry) {
                const now = new Date().getTime();
                const expiry = parseInt(tokenExpiry);

                if (now < expiry) {
                    setIsConnected(true);
                    setConnectionStatus('Connected to Xero');
                } else {
                    refreshAccessToken();
                }
            } else {
                setIsConnected(false);
                setConnectionStatus('Not connected to Xero');
            }
        };
        checkConnection();
    }, []);

    const refreshAccessToken = async () => {
        try {
            // Call the Vercel function
            const response = await fetch('/api/xero/refresh');

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            // Store new tokens
            setIsConnected(true);
            setConnectionStatus('Connected to Xero');
        } catch (err) {
            console.error('Error refreshing token:', err);
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

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await xeroService.getEmployees();
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
            const response = await xeroService.getTimesheets();
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