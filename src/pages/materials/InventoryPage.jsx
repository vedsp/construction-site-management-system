import { useState, useEffect } from 'react';
import { getMaterials } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdWarning } from 'react-icons/md';
import { toast } from 'react-toastify';
import './MaterialsPage.css';

const InventoryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMaterials()
            .then(setInventory)
            .catch((e) => toast.error('Failed to load inventory: ' + e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="materials-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('inventory.title')}</h1>
                    <p>{t('inventory.subtitle')}</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/materials')}>
                    <MdArrowBack /> {t('inventory.back_to_requests')}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>{t('inventory.loading')}</div>
            ) : (
                <div className="inventory-grid">
                    {inventory.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                            <p>{t('inventory.no_items')}</p>
                        </div>
                    )}
                    {inventory.map((item) => {
                        const stockPercent = Math.min((item.quantity / (item.min_stock * 3)) * 100, 100);
                        const isLow = item.quantity <= item.min_stock;
                        const barColor = isLow ? 'var(--danger)' : stockPercent < 50 ? 'var(--warning)' : 'var(--success)';

                        return (
                            <div key={item.id} className="inventory-card">
                                <div className="inventory-card-header">
                                    <span className="inventory-item-name">{item.name}</span>
                                    <span className="inventory-category">{item.category}</span>
                                </div>
                                <div className="inventory-stock">
                                    <span className="inventory-stock-value">{item.quantity}</span>
                                    <span className="inventory-stock-unit">{item.unit}</span>
                                </div>
                                <div className="inventory-progress">
                                    <div className="inventory-progress-bar" style={{ width: `${stockPercent}%`, background: barColor }}></div>
                                </div>
                                <div className="inventory-meta">
                                    <span>Min Stock: {item.min_stock} {item.unit}</span>
                                    <span>Updated: {new Date(item.last_updated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                {isLow && (
                                    <div className="low-stock-warning">
                                        <MdWarning /> Low Stock Alert
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
