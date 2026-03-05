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

<<<<<<< HEAD
    // ─── Render ───────────────────────────────────────────────────────────────
=======
    const getStatusBadge = (status) => {
        const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
        return map[status] || 'badge-info';
    };

    const downloadPurchaseOrder = (request) => {
        const projectName = request.project?.name || getProjectName(request.project_id);
        const poNumber = `PO-${String(request.id).slice(0, 8).toUpperCase()}`;
        const requestDate = request.date ? new Date(request.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
        const requiredBy = request.required_by ? new Date(request.required_by).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
        const items = request.items || [];
        const totalEstimated = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate || 0)), 0);

        const itemRows = items.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item.name || '—'}</td>
                <td>${item.quantity || '—'}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.rate ? '₹' + Number(item.rate).toLocaleString('en-IN') : '—'}</td>
                <td>${item.rate && item.quantity ? '₹' + (Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN') : '—'}</td>
                <td><span style="text-transform:capitalize;font-weight:600;color:${item.urgency === 'high' ? '#e53e3e' : item.urgency === 'low' ? '#38a169' : '#d69e2e'}">${item.urgency || 'medium'}</span></td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Purchase Order – ${poNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a202c; background: #fff; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #e8650a; }
    .company-name { font-size: 22px; font-weight: 800; color: #e8650a; letter-spacing: 0.5px; }
    .company-sub { font-size: 11px; color: #718096; margin-top: 2px; }
    .po-badge { text-align: right; }
    .po-title { font-size: 20px; font-weight: 700; color: #1a202c; text-transform: uppercase; letter-spacing: 2px; }
    .po-number { font-size: 13px; color: #e8650a; font-weight: 600; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .meta-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .meta-box h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #718096; margin-bottom: 10px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .meta-label { color: #718096; }
    .meta-value { font-weight: 600; color: #1a202c; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #e8650a; color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody tr:nth-child(even) { background: #f7fafc; }
    tbody tr:hover { background: #fff5eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .total-row { background: #fff5eb !important; font-weight: 700; }
    .total-row td { border-top: 2px solid #e8650a; color: #e8650a; font-size: 14px; }
    .remarks-box { background: #fffbf5; border: 1px solid #fbd38d; border-radius: 8px; padding: 14px; margin-bottom: 28px; }
    .remarks-box h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9c6522; margin-bottom: 6px; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 40px; }
    .sig-box { text-align: center; }
    .sig-line { border-top: 1px solid #a0aec0; padding-top: 8px; font-size: 11px; color: #718096; margin-top: 40px; }
    .status-stamp { display: inline-block; border: 3px solid; border-radius: 6px; padding: 4px 14px; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; rotation: -15deg; }
    .stamp-approved { color: #38a169; border-color: #38a169; }
    .stamp-pending { color: #d69e2e; border-color: #d69e2e; }
    .stamp-rejected { color: #e53e3e; border-color: #e53e3e; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #a0aec0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">⬡ CSMS</div>
      <div class="company-sub">Construction Site Management System</div>
    </div>
    <div class="po-badge">
      <div class="po-title">Purchase Order</div>
      <div class="po-number"># ${poNumber}</div>
      <div style="margin-top:8px">
        <span class="status-stamp stamp-${request.status}">${request.status}</span>
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Order Details</h4>
      <div class="meta-row"><span class="meta-label">PO Number</span><span class="meta-value">${poNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Request Date</span><span class="meta-value">${requestDate}</span></div>
      <div class="meta-row"><span class="meta-label">Required By</span><span class="meta-value">${requiredBy}</span></div>
      <div class="meta-row"><span class="meta-label">Status</span><span class="meta-value" style="text-transform:capitalize">${request.status}</span></div>
    </div>
    <div class="meta-box">
      <h4>Project Info</h4>
      <div class="meta-row"><span class="meta-label">Project</span><span class="meta-value">${projectName}</span></div>
      <div class="meta-row"><span class="meta-label">Requested By</span><span class="meta-value">${request.requested_by || '—'}</span></div>
      <div class="meta-row"><span class="meta-label">Generated On</span><span class="meta-value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Rate</th>
        <th>Amount</th>
        <th>Urgency</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${totalEstimated > 0 ? `<tr class="total-row"><td colspan="5" style="text-align:right">Estimated Total</td><td>₹${totalEstimated.toLocaleString('en-IN')}</td><td></td></tr>` : ''}
    </tbody>
  </table>

  ${request.remarks ? `<div class="remarks-box"><h4>Remarks / Notes</h4><p>${request.remarks}</p></div>` : ''}

  <div class="sig-grid">
    <div class="sig-box"><div class="sig-line">Requested By</div></div>
    <div class="sig-box"><div class="sig-line">Approved By</div></div>
    <div class="sig-box"><div class="sig-line">Authorized Signature</div></div>
  </div>

  <div class="footer">
    This is a system-generated Purchase Order from CSMS. For queries contact the site manager. | Generated: ${new Date().toLocaleString('en-IN')}
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        if (!win) { toast.error('Please allow popups to download the Purchase Order.'); return; }
        win.document.write(html);
        win.document.close();
    };

>>>>>>> 6570d65 (made changes in update project ,workers)
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
<<<<<<< HEAD
                        );
                    })}
=======

                            {request.remarks && (
                                <div className="request-remarks">
                                    <p className="request-remarks-label">Remarks</p>
                                    <p className="request-remarks-text">{request.remarks}</p>
                                </div>
                            )}

                            <button className="download-po-btn" onClick={() => downloadPurchaseOrder(request)}>
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
>>>>>>> 6570d65 (made changes in update project ,workers)

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
