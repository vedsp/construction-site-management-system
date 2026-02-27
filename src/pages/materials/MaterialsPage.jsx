import { useState } from 'react';
import { demoMaterialRequests, demoProjects } from '../../services/demoData';
import { MdAdd, MdEdit, MdCheckCircle, MdCancel, MdDownload, MdInventory } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import MaterialRequestForm from '../../components/materials/MaterialRequestForm';
import { useAuth } from '../../contexts/AuthContext';
import './MaterialsPage.css';

const MaterialsPage = () => {
    const { isDemo } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState(demoMaterialRequests);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'approved', 'rejected'];

    const filteredRequests = activeFilter === 'all'
        ? requests
        : requests.filter((r) => r.status === activeFilter);

    const getProjectName = (projectId) => {
        const project = demoProjects.find((p) => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    const handleApprove = (id) => {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
    };

    const handleReject = (id) => {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
    };

    const handleSaveRequest = (data) => {
        setRequests((prev) => [...prev, { ...data, id: `mr-${Date.now()}` }]);
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'badge-warning',
            approved: 'badge-success',
            rejected: 'badge-danger',
        };
        return map[status] || 'badge-info';
    };

    return (
        <div className="materials-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Material Requests</h1>
                    <p>Manage material procurement requests</p>
                </div>
                <div className="materials-header-actions">
                    {isDemo && <span className="demo-badge">Demo Data</span>}
                    <button className="btn btn-outline" onClick={() => navigate('/inventory')}>
                        <MdInventory /> Current Inventory
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <MdAdd /> New Request
                    </button>
                </div>
            </div>

            <div className="filter-tabs">
                {filters.map((f) => (
                    <button
                        key={f}
                        className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {filteredRequests.map((request) => (
                <div key={request.id} className="request-card">
                    <div className="request-card-header">
                        <div>
                            <p className="request-card-title">{getProjectName(request.project_id)}</p>
                            <p className="request-card-meta">
                                Requested by {request.requested_by} • {new Date(request.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                    </div>

                    <table className="request-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Rate (₹)</th>
                                <th>Amount (₹)</th>
                                <th>Urgency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {request.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td>₹{item.rate.toLocaleString('en-IN')}</td>
                                    <td>₹{item.amount.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className={`urgency-badge ${item.urgency}`}>{item.urgency}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="request-card-footer">
                        <div className="request-footer-info">
                            <div className="request-footer-item">
                                <span className="request-footer-label">Estimated Cost</span>
                                <span className="request-footer-value">₹{request.estimated_cost.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="request-footer-item">
                                <span className="request-footer-label">Required By</span>
                                <span className="request-footer-value">{new Date(request.required_by).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {request.remarks && (
                        <div className="request-remarks">
                            <p className="request-remarks-label">Remarks</p>
                            <p className="request-remarks-text">{request.remarks}</p>
                        </div>
                    )}

                    <button className="download-po-btn">
                        <MdDownload /> Download Purchase Order
                    </button>

                    {request.status === 'pending' && (
                        <div className="request-card-buttons">
                            <button className="btn btn-outline btn-sm"><MdEdit /> Edit</button>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(request.id)}>
                                <MdCheckCircle /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(request.id)}>
                                <MdCancel /> Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {filteredRequests.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <p>No {activeFilter !== 'all' ? activeFilter : ''} material requests found.</p>
                </div>
            )}

            {showForm && (
                <MaterialRequestForm
                    onSave={handleSaveRequest}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default MaterialsPage;
