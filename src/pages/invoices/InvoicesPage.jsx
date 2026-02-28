import { useState, useEffect } from 'react';
import { getInvoices, getProjects, createInvoice } from '../../services/api';
import { MdAdd, MdDownload, MdDescription } from 'react-icons/md';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { toast } from 'react-toastify';
import './InvoicesPage.css';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'paid'];

    const fetchData = () => {
        setLoading(true);
        Promise.all([getInvoices(), getProjects()])
            .then(([inv, projs]) => { setInvoices(inv); setProjects(projs); })
            .catch((e) => toast.error('Failed to load invoices: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = filter === 'all' ? invoices : invoices.filter((inv) => inv.status === filter);

    const getProjectName = (invoice) => invoice.project?.name || projects.find((p) => p.id === invoice.project_id)?.name || 'N/A';

    const getStatusBadge = (status) => status === 'paid' ? 'badge-success' : 'badge-warning';

    const formatAmount = (amount) => '₹' + (amount || 0).toLocaleString('en-IN');

    const handleSaveInvoice = async (data) => {
        try {
            const { items, ...invoiceData } = data;
            await createInvoice(invoiceData, items);
            toast.success('Invoice created!');
            fetchData();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setShowForm(false);
    };

    return (
        <div className="invoices-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Invoices & Billing</h1>
                    <p>Manage project invoices and payments</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <MdAdd /> New Invoice
                    </button>
                </div>
            </div>

            <div className="filter-tabs">
                {filters.map((f) => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading invoices…</div>
            ) : (
                <>
                    {filtered.map((invoice) => (
                        <div key={invoice.id} className="invoice-card">
                            <div className="invoice-card-header">
                                <div className="invoice-number">
                                    <MdDescription className="invoice-icon" />
                                    <div>
                                        <p className="invoice-id">{invoice.invoice_number}</p>
                                        <p className="invoice-project">{getProjectName(invoice)}</p>
                                    </div>
                                </div>
                                <span className={`badge ${getStatusBadge(invoice.status)}`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                            </div>

                            <div className="invoice-details-grid">
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">Client</span>
                                    <span className="invoice-detail-value">{invoice.client}</span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">Issue Date</span>
                                    <span className="invoice-detail-value">
                                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">Due Date</span>
                                    <span className="invoice-detail-value">
                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">Total Amount</span>
                                    <span className="invoice-detail-value amount">{formatAmount(invoice.total_amount)}</span>
                                </div>
                            </div>

                            <div className="invoice-footer">
                                <span className="invoice-tax-info">
                                    Subtotal: {formatAmount(invoice.subtotal)} &nbsp; GST ({invoice.gst_percent}%): {formatAmount(invoice.gst_amount)}
                                </span>
                                <button className="download-pdf-btn">
                                    <MdDownload /> Download PDF
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <p>No {filter !== 'all' ? filter : ''} invoices found.</p>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <InvoiceForm
                    projects={projects}
                    onSave={handleSaveInvoice}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default InvoicesPage;
