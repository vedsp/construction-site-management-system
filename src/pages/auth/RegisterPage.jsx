import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdBusiness, MdPerson, MdLock, MdEmail, MdBadge } from 'react-icons/md';
import './LoginPage.css';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !role) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed.');
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

            <div className="login-card">
                <h2>Create Account</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Full Name <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdBadge className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdEmail className="input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Confirm Password <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/login">Already have an account? Login</Link>
                </div>
            </div>

            <p className="login-footer">© 2026 Construction Site Management System</p>
        </div>
    );
};

export default RegisterPage;
