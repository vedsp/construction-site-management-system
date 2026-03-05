import { useState, useEffect } from 'react';
import { getMaterialRequests, getProjects, createMaterialRequest, updateMaterialRequestStatus } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MdAdd, MdEdit, MdCheckCircle, MdCancel, MdDownload, MdInventory, MdForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import MaterialRequestForm from '../../components/materials/MaterialRequestForm';
import { toast } from 'react-toastify';
import './MaterialsPage.css';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: 'Pending', badge: 'badge-warning' },
    engineer_approved: { label: 'Forwarded to Admin', badge: 'badge-info' },
    engineer_rejected: { label: 'Rejected by Engineer', badge: 'badge-danger' },
    approved: { label: 'Approved', badge: 'badge-success' },
    rejected: { label: 'Rejected', badge: 'badge-danger' },
};

const MaterialsPage = () => {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    // ─── Filter tabs per role ──────────────────────────────────────────────────
    const filtersByRole = {
        contractor: ['all', 'pending', 'engineer_approved', 'engineer_rejected', 'approved', 'rejected'],
        site_engineer: ['all', 'pending', 'engineer_approved', 'engineer_rejected'],
        admin: ['all', 'pending', 'engineer_approved', 'approved', 'rejected'],
    };
    const filters = filtersByRole[userRole] || ['all', 'pending', 'engineer_approved', 'approved', 'rejected'];

    const filterLabel = (f) => {
        if (f === 'all') return 'All';
        return STATUS_CONFIG[f]?.label || f;
    };

    // ─── Default filter per role ───────────────────────────────────────────────
    useEffect(() => {
        if (userRole === 'admin') setActiveFilter('engineer_approved');
        else if (userRole === 'site_engineer') setActiveFilter('pending');
        else setActiveFilter('all');
    }, [userRole]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getMaterialRequests(), getProjects()])
            .then(([r, p]) => { setRequests(r); setProjects(p); })
            .catch((e) => toast.error('Failed to load: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    // ─── Filter requests based on role ────────────────────────────────────────
    const visibleRequests = requests.filter((r) => {
        // Contractors only see their own requests
        // (requested_by is a text field matching their name; best effort filter)
        return true; // All roles see all requests, filtered further by tab
    });

    const filteredRequests = activeFilter === 'all'
        ? visibleRequests
        : visibleRequests.filter((r) => r.status === activeFilter);

    const getProjectName = (projectId) => {
        const p = projects.find((p) => p.id === projectId);
        return p ? p.name : 'Unknown Project';
    };

    // ─── Actions ──────────────────────────────────────────────────────────────

    // Site engineer: forward to admin
    const handleEngineerApprove = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'engineer_approved', null, user?.id);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'engineer_approved' } : r));
            toast.success('Request forwarded to Admin for final approval.');
        } catch (e) { toast.error('Error: ' + e.message); }
    };

    // Site engineer: reject outright
    const handleEngineerReject = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'engineer_rejected', null, user?.id);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'engineer_rejected' } : r));
            toast.success('Request rejected.');
        } catch (e) { toast.error('Error: ' + e.message); }
    };

    // Admin: final approve
    const handleAdminApprove = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'approved', user?.id, null);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
            toast.success('Request finally approved!');
        } catch (e) { toast.error('Error: ' + e.message); }
    };

    // Admin: final reject
    const handleAdminReject = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'rejected', user?.id, null);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
            toast.success('Request rejected.');
        } catch (e) { toast.error('Error: ' + e.message); }
    };

    const handleSaveRequest = async (data) => {
        try {
            const { items, ...requestData } = data;
            await createMaterialRequest(requestData, items);
            toast.success('Material request submitted!');
            fetchData();
        } catch (e) { toast.error('Error: ' + e.message); }
        setShowForm(false);
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="materials-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Material Requests</h1>
                    <p>
                        {userRole === 'contractor' && 'Submit and track your material requests'}
                        {userRole === 'site_engineer' && 'Review and forward contractor material requests'}
                        {userRole === 'admin' && 'Give final approval on engineer-reviewed requests'}
                        {!['contractor', 'site_engineer', 'admin'].includes(userRole) && 'Manage material procurement requests'}
                    </p>
                </div>
                <div className="materials-header-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/inventory')}>
                        <MdInventory /> Current Inventory
                    </button>
                    {/* Only contractors can create new requests */}
                    {userRole === 'contractor' && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <MdAdd /> New Request
                        </button>
                    )}
                </div>
            </div>

            {/* Role badge hint */}
            {userRole === 'site_engineer' && (
                <div className="role-hint-banner" style={{ marginBottom: 12, padding: '8px 14px', background: 'var(--primary-light, #fff3ec)', borderLeft: '3px solid var(--primary)', borderRadius: 6, fontSize: 13, color: 'var(--primary)' }}>
                    You see <strong>pending</strong> requests. Approve to forward to Admin, or reject outright.
                </div>
            )}
            {userRole === 'admin' && (
                <div className="role-hint-banner" style={{ marginBottom: 12, padding: '8px 14px', background: 'var(--primary-light, #fff3ec)', borderLeft: '3px solid var(--primary)', borderRadius: 6, fontSize: 13, color: 'var(--primary)' }}>
                    You see requests <strong>forwarded by Site Engineers</strong>. You can also view and override <strong>pending</strong> requests. Give final approval or rejection.
                </div>
            )}

            <div className="filter-tabs">
                {filters.map((f) => (
                    <button
                        key={f}
                        className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {filterLabel(f)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading requests…</div>
            ) : (
                <>
                    {filteredRequests.map((request) => {
                        const sc = STATUS_CONFIG[request.status] || { label: request.status, badge: 'badge-info' };
                        return (
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
                                    <span className={`badge ${sc.badge}`}>{sc.label}</span>
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

                                {/* Site Engineer actions — only on pending requests */}
                                {userRole === 'site_engineer' && request.status === 'pending' && (
                                    <div className="request-card-buttons">
                                        <button className="btn btn-outline btn-sm"><MdEdit /> Edit</button>
                                        <button className="btn btn-success btn-sm" onClick={() => handleEngineerApprove(request.id)}>
                                            <MdForward /> Forward to Admin
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleEngineerReject(request.id)}>
                                            <MdCancel /> Reject
                                        </button>
                                    </div>
                                )}

                                {/* Admin actions — on engineer_approved OR pending requests (Admin Override) */}
                                {userRole === 'admin' && (request.status === 'engineer_approved' || request.status === 'pending') && (
                                    <div className="request-card-buttons">
                                        <button className="btn btn-success btn-sm" onClick={() => handleAdminApprove(request.id)}>
                                            <MdCheckCircle /> {request.status === 'pending' ? 'Direct Approve (Override)' : 'Final Approve'}
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleAdminReject(request.id)}>
                                            <MdCancel /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredRequests.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <p>
                                {activeFilter === 'all'
                                    ? 'No material requests found.'
                                    : userRole === 'admin' && activeFilter === 'engineer_approved'
                                        ? 'No requests awaiting final approval. Site Engineers haven\'t forwarded any yet.'
                                        : `No ${filterLabel(activeFilter).toLowerCase()} requests found.`}
                            </p>
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
