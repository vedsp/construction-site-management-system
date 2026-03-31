import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline, MdArrowBack } from 'react-icons/md';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <MdErrorOutline style={styles.icon} />
                <h1 style={styles.title}>404</h1>
                <h2 style={styles.subtitle}>{t('common.page_not_found', 'Page Not Found')}</h2>
                <p style={styles.text}>
                    {t('common.page_not_found_msg', "The page you're looking for doesn't exist or has been moved.")}
                </p>
                <button style={styles.button} onClick={() => navigate('/')}>
                    <MdArrowBack /> {t('common.go_back', 'Go Back Home')}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '24px'
    },
    content: {
        textAlign: 'center',
        maxWidth: '500px',
        padding: '48px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)'
    },
    icon: {
        fontSize: '4rem',
        color: 'var(--text-muted)',
        marginBottom: '16px'
    },
    title: {
        fontSize: '6rem',
        fontWeight: '900',
        color: 'var(--primary)',
        lineHeight: 1,
        margin: '0 0 16px 0'
    },
    subtitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        margin: '0 0 12px 0'
    },
    text: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '32px'
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--border-radius-md)',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.2s'
    }
};

export default NotFoundPage;
