import { useState, useEffect } from 'react';
import { getMaterialRequests, getProjects, createMaterialRequest, updateMaterialRequestStatus } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MdAdd, MdEdit, MdCheckCircle, MdCancel, MdDownload, MdInventory } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import MaterialRequestForm from '../../components/materials/MaterialRequestForm';
import { toast } from 'react-toastify';
import './MaterialsPage.css';

const MaterialsPage = () => {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'approved', 'rejected'];

    const fetchData = () => {
        setLoading(true);
        Promise.all([getMaterialRequests(), getProjects()])
            .then(([r, p]) => { setRequests(r); setProjects(p); })
            .catch((e) => toast.error('Failed to load: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const filteredRequests = activeFilter === 'all'
        ? requests
        : requests.filter((r) => r.status === activeFilter);

    const getProjectName = (projectId) => {
        const p = projects.find((p) => p.id === projectId);
        return p ? p.name : 'Unknown Project';
    };

    const handleApprove = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'approved', user?.id);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
            toast.success('Request approved!');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const handleReject = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'rejected', user?.id);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
            toast.success('Request rejected.');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const handleSaveRequest = async (data) => {
        try {
            const { items, ...requestData } = data;
            await createMaterialRequest(requestData, items);
            toast.success('Material request submitted!');
            fetchData(); // Refresh to get the full nested data
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading requests…</div>
            ) : (
                <>
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="request-card">
                            <div className="request-card-header">
                                <div>
                                    <p className="request-card-title">
                                        {request.project?.name || getProjectName(request.project_id)}
                                    </p>
                                    <p className="request-card-meta">
                                        Requested by {request.requested_by} • {request.date ? new Date(request.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
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
                                        <th>Urgency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(request.items || []).map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td><span className={`urgency-badge ${item.urgency}`}>{item.urgency}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="request-card-footer">
                                <div className="request-footer-info">
                                    <div className="request-footer-item">
                                        <span className="request-footer-label">Required By</span>
                                        <span className="request-footer-value">
                                            {request.required_by ? new Date(request.required_by).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                        </span>
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
                                    {userRole === 'admin' && (
                                        <>
                                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(request.id)}>
                                                <MdCheckCircle /> Approve
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(request.id)}>
                                                <MdCancel /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <p>No {activeFilter !== 'all' ? activeFilter : ''} material requests found.</p>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <MaterialRequestForm
                    projects={projects}
                    onSave={handleSaveRequest}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default MaterialsPage;
