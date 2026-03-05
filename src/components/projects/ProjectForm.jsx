import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const ProjectForm = ({ project, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '', location: '', client: '', description: '',
        status: 'not_started', progress: 0, budget: '',
        start_date: '', deadline: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                location: project.location || '',
                client: project.client || '',
                description: project.description || '',
                status: project.status || 'not_started',
                progress: project.progress || 0,
                budget: project.budget || '',
                start_date: project.start_date || '',
                deadline: project.deadline || '',
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === 'budget' || name === 'progress' ? Number(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            budget: formData.budget === '' || formData.budget === undefined ? 0 : Number(formData.budget),
            progress: formData.progress === '' || formData.progress === undefined ? 0 : Number(formData.progress),
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{project ? 'Edit Project' : 'Create Project'}</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Name <span className="required">*</span></label>
                        <input className="form-input" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter project name" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Client</label>
                            <input className="form-input" name="client" value={formData.client} onChange={handleChange} placeholder="Client name" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Project description..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Budget (₹)</label>
                            <input className="form-input" name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="Total budget" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input className="form-input" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input className="form-input" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Progress ({formData.progress}%)</label>
                        <input type="range" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{project ? 'Update Project' : 'Create Project'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
