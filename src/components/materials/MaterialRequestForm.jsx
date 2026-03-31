import { useState } from 'react';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';

const MaterialRequestForm = ({ projects = [], onSave, onClose, initialRequestedBy = '' }) => {
    const [projectId, setProjectId] = useState('');
    const [requestedBy, setRequestedBy] = useState(initialRequestedBy);
    const [requiredBy, setRequiredBy] = useState('');
    const [remarks, setRemarks] = useState('');
    const [items, setItems] = useState([
        { name: '', quantity: '', unit: '', rate: 0, amount: 0, urgency: 'medium' },
    ]);

    const addItem = () => {
        setItems([...items, { name: '', quantity: '', unit: '', rate: 0, amount: 0, urgency: 'medium' }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const estimatedCost = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
        onSave({
            project_id: projectId,
            requested_by: requestedBy,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            estimated_cost: estimatedCost,
            required_by: requiredBy,
            remarks,
            items,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>New Material Request</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Project <span className="required">*</span></label>
                            <select className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                                <option value="">Select project</option>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Requested By <span className="required">*</span></label>
                            <input className="form-input" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Your name" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Required By</label>
                        <input className="form-input" type="date" value={requiredBy} onChange={(e) => setRequiredBy(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Items</label>
                            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><MdAdd /> Add Item</button>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                                <input className="form-input" placeholder="Item name" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} />
                                <input className="form-input" placeholder="Qty" type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                                <input className="form-input" placeholder="Unit" value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} />
                                <select className="form-select" value={item.urgency} onChange={(e) => updateItem(idx, 'urgency', e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>
                                        <MdDelete />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks</label>
                        <textarea className="form-input" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Additional notes..." />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaterialRequestForm;
