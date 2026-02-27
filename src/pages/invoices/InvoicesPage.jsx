import { useState } from 'react';
import { demoInvoices, demoProjects } from '../../services/demoData';
import { MdAdd, MdDownload, MdDescription } from 'react-icons/md';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { useAuth } from '../../contexts/AuthContext';
import './InvoicesPage.css';

const InvoicesPage = () => {
    const { isDemo } = useAuth();
    const [invoices, setInvoices] = useState(demoInvoices);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'paid'];

    const filtered = filter === 'all' ? invoices : invoices.filter((inv) => inv.status === filter);

    const getProjectName = (id) => demoProjects.find((p) => p.id === id)?.name || 'N/A';

    const getStatusBadge = (status) => {
        return status === 'paid' ? 'badge-success' : 'badge-warning';
    };

    const formatAmount = (amount) => {
        return '₹' + amount.toLocaleString('en-IN');
    };

    const handleSaveInvoice = (data) => {
        setInvoices((prev) => [...prev, { ...data, id: `inv-${Date.now()}` }]);
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
                    {isDemo && <span className="demo-badge">Demo Data</span>}
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

            {filtered.map((invoice) => (
                <div key={invoice.id} className="invoice-card">
                    <div className="invoice-card-header">
                        <div className="invoice-number">
                            <MdDescription className="invoice-icon" />
                            <div>
                                <p className="invoice-id">{invoice.invoice_number}</p>
                                <p className="invoice-project">{getProjectName(invoice.project_id)}</p>
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
                            <span className="invoice-detail-value">{new Date(invoice.issue_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="invoice-detail-item">
                            <span className="invoice-detail-label">Due Date</span>
                            <span className="invoice-detail-value">{new Date(invoice.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

            {showForm && <InvoiceForm onSave={handleSaveInvoice} onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default InvoicesPage;
