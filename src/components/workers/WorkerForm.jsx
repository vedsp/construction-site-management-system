import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const WorkerForm = ({ worker, projects = [], onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        role: '',
        phone: '',
        project_id: '',
        daily_wage: '',
        status: 'active',
    });

    useEffect(() => {
        if (worker) {
            setFormData({
                name: worker.name || '',
                username: worker.username || '',
                role: worker.role || '',
                phone: worker.phone || '',
                project_id: worker.project_id || '',
                daily_wage: worker.daily_wage || '',
                status: worker.status || 'active',
            });
        }
    }, [worker]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{worker ? 'Edit Worker' : 'Add Worker'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name <span className="required">*</span></label>
                        <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role <span className="required">*</span></label>
                        <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                            <option value="">Select role</option>
                            <option value="mason">Mason</option>
                            <option value="electrician">Electrician</option>
                            <option value="plumber">Plumber</option>
                            <option value="carpenter">Carpenter</option>
                            <option value="helper">Helper</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assigned Project</label>
                        <select className="form-select" name="project_id" value={formData.project_id} onChange={handleChange}>
                            <option value="">Select project</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Daily Wage (₹)</label>
                        <input className="form-input" name="daily_wage" type="number" value={formData.daily_wage} onChange={handleChange} placeholder="Enter daily wage" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{worker ? 'Update Worker' : 'Add Worker'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerForm;
