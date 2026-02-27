import { useState } from 'react';
import { demoInventory } from '../../services/demoData';
import { MdWarning, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './MaterialsPage.css';

const InventoryPage = () => {
    const navigate = useNavigate();
    const [inventory] = useState(demoInventory);

    return (
        <div className="materials-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Current Inventory</h1>
                    <p>Track material stock levels across all sites</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/materials')}>
                    <MdArrowBack /> Back to Requests
                </button>
            </div>

            <div className="inventory-grid">
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
        </div>
    );
};

export default InventoryPage;
