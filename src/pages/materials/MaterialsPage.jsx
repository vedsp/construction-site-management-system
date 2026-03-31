import { useState, useEffect } from 'react';
import {
    getMaterialRequests,
    getProjects,
    createMaterialRequest,
    updateMaterialRequestStatus
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    MdAdd,
    MdCheckCircle,
    MdCancel,
    MdDownload,
    MdInventory,
    MdForward
} from 'react-icons/md';
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
    rejected: { label: 'Rejected', badge: 'badge-danger' }
};

const MaterialsPage = () => {
    const { user, userRole } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filtersByRole = {
        contractor: ['all', 'pending', 'engineer_approved', 'engineer_rejected', 'approved', 'rejected'],
        site_engineer: ['all', 'pending', 'engineer_approved', 'engineer_rejected'],
        admin: ['all', 'pending', 'engineer_approved', 'approved', 'rejected']
    };

    const filters =
        filtersByRole[userRole] || ['all', 'pending', 'engineer_approved', 'approved', 'rejected'];

    const filterLabel = (f) => {
        if (f === 'all') return 'All';
        return STATUS_CONFIG[f]?.label || f;
    };

    useEffect(() => {
        if (userRole === 'admin') setActiveFilter('engineer_approved');
        else if (userRole === 'site_engineer') setActiveFilter('pending');
        else setActiveFilter('all');
    }, [userRole]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getMaterialRequests(), getProjects()])
            .then(([r, p]) => {
                setRequests(r);
                setProjects(p);
            })
            .catch((e) => toast.error('Failed to load: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRequests =
        activeFilter === 'all'
            ? requests
            : requests.filter((r) => r.status === activeFilter);

    const getProjectName = (projectId) => {
        const p = projects.find((p) => p.id === projectId);
        return p ? p.name : 'Unknown Project';
    };

    // ─── Actions ──────────────────────────────────────────────────────────────

    const handleEngineerApprove = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'engineer_approved', null, user?.id);
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: 'engineer_approved' } : r
                )
            );
            toast.success('Request forwarded to Admin.');
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleEngineerReject = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'engineer_rejected', null, user?.id);
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: 'engineer_rejected' } : r
                )
            );
            toast.success('Request rejected.');
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleAdminApprove = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'approved', user?.id, null);
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
            );
            toast.success('Request approved.');
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleAdminReject = async (id) => {
        try {
            await updateMaterialRequestStatus(id, 'rejected', user?.id, null);
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
            );
            toast.success('Request rejected.');
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSaveRequest = async (data) => {
        try {
            const { items, ...requestData } = data;
            await createMaterialRequest(requestData, items);
            toast.success('Material request submitted!');
            fetchData();
        } catch (e) {
            toast.error(e.message);
        }
        setShowForm(false);
    };

    const downloadPurchaseOrder = (request) => {
        const projectName =
            request.project?.name || getProjectName(request.project_id);
        const poNumber = `PO-${String(request.id).slice(0, 8).toUpperCase()}`;

        const html = `
            <html>
                <body style="font-family: Arial; padding:40px">
                    <h2>Purchase Order - ${poNumber}</h2>
                    <p><strong>Project:</strong> ${projectName}</p>
                    <p><strong>Status:</strong> ${request.status}</p>
                    <hr/>
                    ${(request.items || [])
                .map(
                    (i) =>
                        `<p>${i.name} - ${i.quantity} (${i.urgency})</p>`
                )
                .join('')}
                </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    return (
        <div className="materials-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('materials.title')}</h1>
                </div>

                <div className="materials-header-actions">
                    {userRole === 'contractor' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                        >
                            <MdAdd /> {t('materials.new_request')}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter pills */}
            <div className="materials-filter-bar">
                {filters.map((f) => (
                    <button
                        key={f}
                        className={`filter-pill${activeFilter === f ? ' active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {filterLabel(f)}
                        <span className="filter-pill-count">
                            {f === 'all'
                                ? requests.length
                                : requests.filter((r) => r.status === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Body */}
            {loading ? (
                <div className="materials-empty-state">
                    <div className="materials-spinner" />
                    <p>Loading requests…</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="materials-empty-state">
                    <MdInventory size={48} style={{ opacity: 0.25 }} />
                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                        {activeFilter === 'all'
                            ? 'No material requests found.'
                            : `No requests with status "${filterLabel(activeFilter)}".`}
                    </p>
                    {userRole === 'contractor' && (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '16px' }}
                            onClick={() => setShowForm(true)}
                        >
                            <MdAdd /> New Request
                        </button>
                    )}
                </div>
            ) : (
                filteredRequests.map((request) => {
                    const sc = STATUS_CONFIG[request.status] || {
                        label: request.status,
                        badge: 'badge-info',
                    };

                    return (
                        <div key={request.id} className="request-card">
                            <div className="request-card-header">
                                <div>
                                    <p className="request-card-title">
                                        {request.project?.name || getProjectName(request.project_id)}
                                    </p>
                                    <p className="request-card-meta">
                                        Requested by <strong>{request.requested_by}</strong>
                                        {request.date && (
                                            <> &nbsp;·&nbsp; {new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                        )}
                                        {request.items?.length > 0 && (
                                            <> &nbsp;·&nbsp; {request.items.length} item{request.items.length !== 1 ? 's' : ''}</>
                                        )}
                                    </p>
                                </div>
                                <span className={`badge ${sc.badge}`}>{sc.label}</span>
                            </div>

                            {/* Items table */}
                            {request.items && request.items.length > 0 && (
                                <table className="request-items-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Unit</th>
                                            <th>Urgency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {request.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.unit || '—'}</td>
                                                <td>
                                                    <span className={`urgency-badge ${item.urgency}`}>
                                                        {item.urgency}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div className="request-card-footer">
                                <div className="request-footer-info">
                                    {request.required_by && (
                                        <div className="request-footer-item">
                                            <span className="request-footer-label">Required By</span>
                                            <span className="request-footer-value">
                                                {new Date(request.required_by).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    )}
                                    {request.estimated_cost > 0 && (
                                        <div className="request-footer-item">
                                            <span className="request-footer-label">Est. Cost</span>
                                            <span className="request-footer-value">
                                                ₹{Number(request.estimated_cost).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="download-po-btn"
                                    onClick={() => downloadPurchaseOrder(request)}
                                >
                                    <MdDownload /> Download PO
                                </button>
                            </div>

                            {request.remarks && (
                                <div className="request-remarks">
                                    <p className="request-remarks-label">Remarks</p>
                                    <p className="request-remarks-text">{request.remarks}</p>
                                </div>
                            )}

                            {userRole === 'site_engineer' && request.status === 'pending' && (
                                <div className="request-card-buttons">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleEngineerApprove(request.id)}
                                    >
                                        <MdForward /> Forward to Admin
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleEngineerReject(request.id)}
                                    >
                                        <MdCancel /> Reject
                                    </button>
                                </div>
                            )}

                            {userRole === 'admin' &&
                                (request.status === 'engineer_approved' || request.status === 'pending') && (
                                    <div className="request-card-buttons">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleAdminApprove(request.id)}
                                        >
                                            <MdCheckCircle /> Approve
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleAdminReject(request.id)}
                                        >
                                            <MdCancel /> Reject
                                        </button>
                                    </div>
                                )}
                        </div>
                    );
                })
            )}

            {showForm && (
                <MaterialRequestForm
                    projects={projects}
                    initialRequestedBy={user?.user_metadata?.full_name || ''}
                    onSave={handleSaveRequest}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default MaterialsPage;