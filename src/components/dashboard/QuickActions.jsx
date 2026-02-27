import { useNavigate } from 'react-router-dom';
import { MdInventory2, MdFolder } from 'react-icons/md';
import './QuickActions.css';

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => navigate('/materials')}>
                    <MdInventory2 className="qa-icon" />
                    <span>Request Material</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/projects')}>
                    <MdFolder className="qa-icon" />
                    <span>View Projects</span>
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
