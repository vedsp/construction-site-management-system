import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdBusiness, MdPerson, MdLock } from 'react-icons/md';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isDemo } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !role) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-branding">
                <div className="login-logo">
                    <MdBusiness />
                </div>
                <h1>Construction SMS</h1>
                <p>Site Management System</p>
            </div>

            {isDemo && (
                <div className="login-demo-badge">
                    ⚡ Demo Mode — Enter any credentials to continue
                </div>
            )}

            <div className="login-card">
                <h2>Login</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Username <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdPerson className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Password <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Role <span className="required">*</span>
                        </label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">Select your role</option>
                            <option value="admin">Admin</option>
                            <option value="site_engineer">Site Engineer</option>
                            <option value="contractor">Contractor</option>
                            <option value="worker">Worker</option>
                        </select>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Forgot Password?</Link>
                    <Link to="/register">Create Account</Link>
                </div>
            </div>

            <p className="login-footer">© 2026 Construction Site Management System</p>
        </div>
    );
};

export default LoginPage;
