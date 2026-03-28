import { useState, useEffect } from 'react';
import { getInvoices, getProjects, createInvoice } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdDownload, MdDescription } from 'react-icons/md';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './InvoicesPage.css';

const InvoicesPage = () => {
    const { t } = useTranslation();
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

    const downloadInvoicePDF = (invoice) => {
        const doc = new jsPDF();
        const projectName = getProjectName(invoice);
        const fmt = (amt) => 'Rs. ' + (amt || 0).toLocaleString('en-IN');
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

        // ── Header bar ──
        doc.setFillColor(220, 85, 20);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Nirman', 14, 12);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Site Management System', 14, 19);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 196, 16, { align: 'right' });

        // ── Invoice meta ──
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(invoice.invoice_number, 14, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Project: ' + projectName, 14, 47);

        // Right-side meta block
        const metaX = 130;
        doc.setTextColor(100, 100, 100);
        doc.text('Bill To:', metaX, 36);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(invoice.client || '—', metaX, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Issue Date: ' + fmtDate(invoice.issue_date), metaX, 52);
        doc.text('Due Date:   ' + fmtDate(invoice.due_date), metaX, 58);

        // Status badge
        const statusColor = invoice.status === 'paid' ? [34, 197, 94] : [234, 179, 8];
        doc.setFillColor(...statusColor);
        doc.roundedRect(163, 35, 33, 9, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(invoice.status.toUpperCase(), 179.5, 41, { align: 'center' });

        // ── Line items table ──
        const items = (invoice.items || []).map((it, i) => [
            i + 1,
            it.description || it.name || '—',
            fmt(it.amount),
        ]);

        autoTable(doc, {
            startY: 68,
            head: [['#', 'Description', 'Amount']],
            body: items.length > 0 ? items : [['1', 'Service charge', fmt(invoice.subtotal)]],
            headStyles: { fillColor: [220, 85, 20], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
            alternateRowStyles: { fillColor: [252, 248, 245] },
            columnStyles: { 0: { cellWidth: 12 }, 2: { halign: 'right', cellWidth: 40 } },
            margin: { left: 14, right: 14 },
        });

        // ── Totals ──
        const finalY = doc.lastAutoTable.finalY + 8;
        const totalsX = 130;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(totalsX, finalY, 196, finalY);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', totalsX, finalY + 7);
        doc.text(fmt(invoice.subtotal), 196, finalY + 7, { align: 'right' });
        doc.text(`GST (${invoice.gst_percent || 18}%):`, totalsX, finalY + 14);
        doc.text(fmt(invoice.gst_amount), 196, finalY + 14, { align: 'right' });

        doc.setDrawColor(220, 85, 20);
        doc.setLineWidth(0.5);
        doc.line(totalsX, finalY + 17, 196, finalY + 17);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 85, 20);
        doc.text('Total:', totalsX, finalY + 24);
        doc.text(fmt(invoice.total_amount), 196, finalY + 24, { align: 'right' });

        // ── Footer ──
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for your business.', 105, 285, { align: 'center' });
        doc.text('Nirman — Site Management System', 105, 290, { align: 'center' });

        doc.save(`${invoice.invoice_number}.pdf`);
    };


    return (
        <div className="invoices-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('invoices.title')}</h1>
                    <p>{t('invoices.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <MdAdd /> {t('invoices.new_invoice')}
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
                        {f === 'all' ? t('common.all') : f === 'pending' ? t('common.pending') : t('invoices.paid')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>{t('invoices.loading')}</div>
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
                                    <span className="invoice-detail-label">{t('invoices.client')}</span>
                                    <span className="invoice-detail-value">{invoice.client}</span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">{t('invoices.issue_date')}</span>
                                    <span className="invoice-detail-value">
                                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">{t('invoices.due_date')}</span>
                                    <span className="invoice-detail-value">
                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                                <div className="invoice-detail-item">
                                    <span className="invoice-detail-label">{t('invoices.total_amount')}</span>
                                    <span className="invoice-detail-value amount">{formatAmount(invoice.total_amount)}</span>
                                </div>
                            </div>

                            <div className="invoice-footer">
                                <span className="invoice-tax-info">
                                    {t('invoices.subtotal')}: {formatAmount(invoice.subtotal)} &nbsp; {t('invoices.gst')} ({invoice.gst_percent}%): {formatAmount(invoice.gst_amount)}
                                </span>
                                <button className="download-pdf-btn" onClick={() => downloadInvoicePDF(invoice)}>
                                    <MdDownload /> {t('invoices.download_pdf')}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <p>{t('invoices.no_invoices')}</p>
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
