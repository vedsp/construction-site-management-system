import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdBusiness, MdEmail } from 'react-icons/md';
import './LoginPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword, isDemo } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset link.');
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
                <h2>Reset Password</h2>

                {error && <div className="login-error">{error}</div>}

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            {isDemo
                                ? 'In demo mode, password reset is simulated.'
                                : 'A password reset link has been sent to your email.'}
                        </p>
                        <Link to="/login" className="login-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

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

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="login-links" style={{ justifyContent: 'center' }}>
                        <Link to="/login">Back to Login</Link>
                    </div>
                )}
            </div>

            <p className="login-footer">© 2026 Construction Site Management System</p>
        </div>
    );
};

export default ForgotPasswordPage;
