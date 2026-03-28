import { useState, useEffect } from 'react';
import { MdClose, MdEmail, MdLock, MdBadge, MdPhone, MdWork, MdAttachMoney, MdPerson } from 'react-icons/md';

const WorkerForm = ({ worker, projects = [], onSave, onClose }) => {
    const isEditing = !!worker;

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        phone: '',
        project_id: '',
        daily_wage: '',
        status: 'active',
        // Account creation fields (add-only)
        email: '',
        password: '',
        confirmPassword: '',
        createAccount: false,
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (worker) {
            setFormData({
                name: worker.name || '',
                role: worker.role || '',
                phone: worker.phone || '',
                project_id: worker.project_id || '',
                daily_wage: worker.daily_wage || '',
                status: worker.status || 'active',
                email: '',
                password: '',
                confirmPassword: '',
                createAccount: false,
            });
        }
    }, [worker]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'phone') {
            const digits = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, phone: digits }));
            return;
        }
        if (type === 'checkbox') {
            setFormData((prev) => ({ ...prev, [name]: checked }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate account creation fields if opted in
        if (!isEditing && formData.createAccount) {
            if (!formData.email) {
                setError('Please enter an email address.');
                return;
            }
            if (!formData.password) {
                setError('Please enter a password.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        const { confirmPassword, createAccount, ...saveData } = formData;
        // If not creating account, strip auth fields
        if (!createAccount || isEditing) {
            delete saveData.email;
            delete saveData.password;
        }

        onSave({ ...saveData, createAccount: !isEditing && createAccount });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content worker-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Worker' : 'Add Worker'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>

                {error && <div className="worker-form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="worker-form-body">

                    {/* ── Basic Info Section ──────────────────── */}
                    <div className="worker-form-section-label">Basic Information</div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label className="form-label">
                                <MdBadge className="field-icon" /> Full Name <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <MdWork className="field-icon" /> Trade / Role <span className="required">*</span>
                            </label>
                            <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                                <option value="">Select trade</option>
                                <option value="mason">Mason</option>
                                <option value="electrician">Electrician</option>
                                <option value="plumber">Plumber</option>
                                <option value="carpenter">Carpenter</option>
                                <option value="helper">Helper</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="welder">Welder</option>
                                <option value="painter">Painter</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label className="form-label">
                                <MdPhone className="field-icon" /> Phone
                            </label>
                            <input
                                className="form-input"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone number"
                                maxLength={10}
                                type="tel"
                                pattern="[0-9]{10}"
                                title="Enter a valid 10-digit phone number"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <MdAttachMoney className="field-icon" /> Daily Wage (₹)
                            </label>
                            <input
                                className="form-input"
                                name="daily_wage"
                                type="number"
                                value={formData.daily_wage}
                                onChange={handleChange}
                                placeholder="e.g. 650"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label className="form-label">Assigned Project</label>
                            <select className="form-select" name="project_id" value={formData.project_id} onChange={handleChange}>
                                <option value="">Unassigned</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Account Creation Section (add-only) ── */}
                    {!isEditing && (
                        <>
                            <div className="worker-form-divider" />
                            <div className="worker-form-section-label">
                                <MdPerson className="field-icon" /> App Account
                            </div>

                            <label className="worker-form-toggle">
                                <input
                                    type="checkbox"
                                    name="createAccount"
                                    checked={formData.createAccount}
                                    onChange={handleChange}
                                />
                                <span className="worker-form-toggle-track" />
                                <span className="worker-form-toggle-label">
                                    Create a login account for this worker
                                </span>
                            </label>

                            {formData.createAccount && (
                                <div className="worker-account-fields">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MdEmail className="field-icon" /> Email Address <span className="required">*</span>
                                        </label>
                                        <input
                                            className="form-input"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="worker@example.com"
                                        />
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <MdLock className="field-icon" /> Password <span className="required">*</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Min. 6 characters"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <MdLock className="field-icon" /> Confirm Password <span className="required">*</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter password"
                                            />
                                        </div>
                                    </div>
                                    <p className="worker-form-hint">
                                        The worker will be able to log in with these credentials right away — no approval needed.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving…' : isEditing ? 'Update Worker' : 'Add Worker'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerForm;
