import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { MdLock, MdEmail, MdBadge, MdCheckCircle } from 'react-icons/md';
import nirmanLogo from '../../assets/nirman-logo.png';
import './LoginPage.css';

const RegisterPage = () => {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { register, user } = useAuth();

    // If perfectly logged in, bounce to dashboard explicitly
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !role) {
            setError(t('register.fill_all_fields'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('register.password_mismatch'));
            return;
        }
        if (password.length < 6) {
            setError(t('register.password_min'));
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName, role);
            setSuccess(true);
        } catch (err) {
            setError(err.message || t('register.registration_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                    <div className="registration-success">
                        <MdCheckCircle className="success-icon" />
                        <h2>{t('register.account_created')}</h2>
                        <p className="success-message">
                            {t('register.account_created_msg')}
                        </p>
                        <Link to="/login" className="login-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '20px' }}>
                            {t('register.back_to_login')}
                        </Link>
                    </div>
                </div>

                <p className="login-footer">{t('login.footer')}</p>
            </div>
        );
    }

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
                <h2>{t('register.title')}</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {t('register.full_name')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdBadge className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('register.enter_name')}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {t('register.email')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdEmail className="input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder={t('register.enter_email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {t('register.password')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder={t('register.create_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {t('register.confirm_password')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder={t('register.confirm_your_password')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {t('register.role')} <span className="required">*</span>
                        </label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">{t('register.select_role')}</option>
                            <option value="site_engineer">{t('roles.site_engineer')}</option>
                            <option value="contractor">{t('roles.contractor')}</option>
                            <option value="worker">{t('roles.worker')}</option>
                        </select>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? t('register.creating') : t('register.register_btn')}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/login">{t('register.already_have_account')}</Link>
                </div>
            </div>

            <p className="login-footer">{t('login.footer')}</p>
        </div>
    );
};

export default RegisterPage;
