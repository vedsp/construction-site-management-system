import { useState } from 'react';
import { demoProjects, demoWorkers } from '../../services/demoData';
import { MdClose } from 'react-icons/md';

const TaskForm = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: '', project_id: '', assigned_to: '',
        priority: 'medium', status: 'pending', deadline: '',
    });

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
                    <h2>Create Task</h2>
                    <button className="modal-close" onClick={onClose}><MdClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title <span className="required">*</span></label>
                        <input className="form-input" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Project</label>
                            <select className="form-select" name="project_id" value={formData.project_id} onChange={handleChange}>
                                <option value="">Select project</option>
                                {demoProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assign To</label>
                            <select className="form-select" name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                                <option value="">Select worker</option>
                                {demoWorkers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-select" name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input className="form-input" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;
