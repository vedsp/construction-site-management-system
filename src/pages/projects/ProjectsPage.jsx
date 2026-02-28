import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject } from '../../services/api';
import { MdAdd, MdEdit, MdVisibility } from 'react-icons/md';
import ProjectForm from '../../components/projects/ProjectForm';
import { toast } from 'react-toastify';
import './ProjectsPage.css';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProject, setEditProject] = useState(null);

    const fetchProjects = () => {
        setLoading(true);
        getProjects()
            .then(setProjects)
            .catch((e) => toast.error('Failed to load projects: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProjects(); }, []);

    const getStatusBadge = (status) => {
        const map = {
            in_progress: { cls: 'badge-info', label: 'In Progress' },
            completed: { cls: 'badge-success', label: 'Completed' },
            on_hold: { cls: 'badge-warning', label: 'On Hold' },
            not_started: { cls: 'badge-danger', label: 'Not Started' },
        };
        return map[status] || { cls: 'badge-info', label: status };
    };

    const handleSave = async (data) => {
        try {
            if (editProject) {
                await updateProject(editProject.id, data);
                toast.success('Project updated!');
            } else {
                await createProject(data);
                toast.success('Project created!');
            }
            fetchProjects();
        } catch (e) {
            toast.error('Error saving project: ' + e.message);
        }
        setShowForm(false);
        setEditProject(null);
    };

    return (
        <div className="projects-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Project Management</h1>
                    <p>Manage and track all construction projects</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowForm(true); }}>
                    <MdAdd /> Create Project
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Total Projects</p>
                        <h3>{projects.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">In Progress</p>
                        <h3>{projects.filter((p) => p.status === 'in_progress').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Total Budget</p>
                        <h3>₹{(projects.reduce((s, p) => s + (p.budget || 0), 0) / 10000000).toFixed(1)}Cr</h3>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading projects…</div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => {
                        const { cls, label } = getStatusBadge(project.status);
                        return (
                            <div key={project.id} className="project-card">
                                <div className="project-card-top">
                                    <div>
                                        <p className="project-card-name">{project.name}</p>
                                        <p className="project-card-location">{project.location}</p>
                                        <p className="project-card-client">{project.client}</p>
                                    </div>
                                    <span className={`badge ${cls}`}>{label}</span>
                                </div>

                                <div className="project-progress-section">
                                    <div className="project-progress-header">
                                        <span className="project-progress-label">Progress</span>
                                        <span className="project-progress-value">{project.progress}%</span>
                                    </div>
                                    <div className="project-progress-bar">
                                        <div className="project-progress-fill" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="project-card-details">
                                    <div className="project-detail">
                                        <span className="project-detail-label">Start Date</span>
                                        <span className="project-detail-value">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                    <div className="project-detail">
                                        <span className="project-detail-label">Deadline</span>
                                        <span className="project-detail-value">
                                            {project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                    <div className="project-detail">
                                        <span className="project-detail-label">Budget</span>
                                        <span className="project-detail-value">₹{((project.budget || 0) / 100000).toFixed(1)}L</span>
                                    </div>
                                </div>

                                <div className="project-card-actions">
                                    <button className="btn btn-outline btn-sm" onClick={() => { setEditProject(project); setShowForm(true); }}>
                                        <MdEdit /> Edit
                                    </button>
                                    <button className="btn btn-primary btn-sm">
                                        <MdVisibility /> View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {projects.length === 0 && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <p>No projects yet. Create your first project!</p>
                </div>
            )}

            {showForm && (
                <ProjectForm
                    project={editProject}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditProject(null); }}
                />
            )}
        </div>
    );
};

export default ProjectsPage;
