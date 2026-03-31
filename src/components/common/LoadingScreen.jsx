import React from 'react';
import { useTranslation } from 'react-i18next';
import nirmanLogo from '../../assets/nirman-logo.png';
import './LoadingScreen.css';

const LoadingScreen = ({ fullScreen = true, message }) => {
    const { t } = useTranslation();

    return (
        <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loading-content">
                <img src={nirmanLogo} alt="Nirman Logo" className="loading-logo" />
                <div className="loading-spinner-wrapper">
                    <div className="premium-spinner"></div>
                </div>
                <p className="loading-text">{message || t('common.loading', 'Loading...')}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
