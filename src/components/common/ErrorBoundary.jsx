import React, { Component } from 'react';
import { MdErrorOutline, MdRefresh } from 'react-icons/md';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Here you would typically log the error to Sentry or another service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <MdErrorOutline style={styles.icon} />
                        <h2 style={styles.title}>Oops, something went wrong</h2>
                        <p style={styles.subtitle}>
                            An unexpected error occurred in this view. We've logged the issue.
                        </p>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <div style={styles.devError}>
                                <code>{this.state.error?.message}</code>
                            </div>
                        )}
                        
                        <button onClick={this.handleReset} style={styles.button}>
                            <MdRefresh style={{ fontSize: '1.2rem' }} /> Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-primary)',
        padding: '24px'
    },
    card: {
        backgroundColor: 'var(--bg-card)',
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '480px',
        borderTop: '4px solid var(--danger)'
    },
    icon: {
        fontSize: '4rem',
        color: 'var(--danger)',
        marginBottom: '16px'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        marginTop: 0
    },
    subtitle: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '24px'
    },
    devError: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        textAlign: 'left',
        width: '100%',
        overflowX: 'auto'
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: 'var(--border-radius-md)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, background 0.2s'
    }
};

export default ErrorBoundary;
