import { useState } from 'react';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';

const InvoiceForm = ({ projects = [], onSave, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        project_id: '',
        client: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        gst_percent: 18,
        status: 'pending',
    });
    const [items, setItems] = useState([{ description: '', amount: '' }]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addItem = () => setItems([...items, { description: '', amount: '' }]);
    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, value) => setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

    const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const gstAmount = Math.round(subtotal * (formData.gst_percent / 100));
    const total = subtotal + gstAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const sanitizedItems = items
            .filter((item) => item.description.trim())
            .map((item) => ({
                description: item.description.trim(),
                amount: Number(item.amount) || 0,
            }));
        await onSave({
            ...formData,
            gst_percent: Number(formData.gst_percent) || 18,
            subtotal,
            gst_amount: gstAmount,
            total_amount: total,
            items: sanitizedItems,
        });
        setSubmitting(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h2>New Invoice</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Invoice Number</label>
                            <input className="form-input" name="invoice_number" value={formData.invoice_number} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Project</label>
                            <select className="form-select" name="project_id" value={formData.project_id} onChange={handleChange}>
                                <option value="">Select project</option>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Client Name <span className="required">*</span></label>
                        <input className="form-input" name="client" value={formData.client} onChange={handleChange} required placeholder="Client/Company name" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Issue Date</label>
                            <input className="form-input" name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input className="form-input" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">GST %</label>
                            <input className="form-input" name="gst_percent" type="number" value={formData.gst_percent} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Line Items</label>
                            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><MdAdd /> Add Item</button>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                                <input className="form-input" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                                <input className="form-input" placeholder="Amount (₹)" type="number" value={item.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)} />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>
                                        <MdDelete />
                                    </button>
                                )}
                            </div>
                        ))}
                        <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Subtotal: ₹{subtotal.toLocaleString('en-IN')} | GST: ₹{gstAmount.toLocaleString('en-IN')} | <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Total: ₹{total.toLocaleString('en-IN')}</strong>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Creating…' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceForm;
