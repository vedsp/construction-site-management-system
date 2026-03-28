import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { MdEmail } from 'react-icons/md';
import nirmanLogo from '../../assets/nirman-logo.png';
import './LoginPage.css';

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword, isDemo } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError(t('forgot_password.enter_email_prompt'));
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message || t('forgot_password.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-branding">
                <div className="login-logo">
                    <img src={nirmanLogo} alt="Nirman Logo" />
                </div>
                <h1>{t('sidebar.brand')}</h1>
                <p>{t('sidebar.tagline')}</p>
            </div>

            <div className="login-card">
                <h2>{t('forgot_password.title')}</h2>

                {error && <div className="login-error">{error}</div>}

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            {isDemo
                                ? t('forgot_password.demo_success')
                                : t('forgot_password.success_msg')}
                        </p>
                        <Link to="/login" className="login-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            {t('forgot_password.back_to_login')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            {t('forgot_password.instruction')}
                        </p>

                        <div className="form-group">
                            <label className="form-label">
                                {t('forgot_password.email')} <span className="required">*</span>
                            </label>
                            <div className="input-icon-wrapper">
                                <MdEmail className="input-icon" />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={t('forgot_password.enter_email')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? t('forgot_password.sending') : t('forgot_password.send_link')}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="login-links" style={{ justifyContent: 'center' }}>
                        <Link to="/login">{t('forgot_password.back_to_login')}</Link>
                    </div>
                )}
            </div>

            <p className="login-footer">{t('login.footer')}</p>
        </div>
    );
};

export default ForgotPasswordPage;
