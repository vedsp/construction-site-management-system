import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { MdPerson, MdLock } from 'react-icons/md';
import nirmanLogo from '../../assets/nirman-logo.png';
import './LoginPage.css';

const LoginPage = () => {
    const { t } = useTranslation();
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
            setError(t('login.fill_all_fields'));
            return;
        }

        setLoading(true);
        try {
            await login(email, password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || t('login.login_failed'));
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

            {isDemo && (
                <div className="login-demo-badge">
                    {t('login.demo_mode')}
                </div>
            )}

            <div className="login-card">
                <h2>{t('login.title')}</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {t('login.username')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdPerson className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('login.enter_username')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            {t('login.password')} <span className="required">*</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <MdLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder={t('login.enter_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {t('login.role')} <span className="required">*</span>
                        </label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">{t('login.select_role')}</option>
                            <option value="admin">{t('roles.admin')}</option>
                            <option value="site_engineer">{t('roles.site_engineer')}</option>
                            <option value="contractor">{t('roles.contractor')}</option>
                            <option value="worker">{t('roles.worker')}</option>
                        </select>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? t('login.logging_in') : t('login.login_btn')}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">{t('login.forgot_password')}</Link>
                    <Link to="/register">{t('login.create_account')}</Link>
                </div>
            </div>

            <p className="login-footer">{t('login.footer')}</p>
        </div>
    );
};

export default LoginPage;
