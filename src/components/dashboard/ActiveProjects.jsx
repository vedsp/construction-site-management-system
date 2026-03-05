import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getProjects } from '../../services/api';
import './ActiveProjects.css';

const ActiveProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const fetchProjects = useCallback(() => {
        setLoading(true);
        getProjects()
            .then((data) => setProjects(data.filter((p) => p.status === 'in_progress')))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [location.pathname, fetchProjects]);

    return (
        <div className="active-projects">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Active Projects</h3>
                <button
                    onClick={fetchProjects}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, padding: '4px 8px', borderRadius: '6px' }}
                    title="Refresh"
                >
                    ↻ Refresh
                </button>
            </div>

            {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}

            {!loading && projects.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active projects.</p>
            )}

            {projects.map((project) => (
                <div key={project.id} className="project-item">
                    <div className="project-item-info">
                        <div className="project-item-bar"></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p className="project-item-name">{project.name}</p>
                                <span className="project-item-progress">{project.progress ?? 0}%</span>
                            </div>
                            <p className="project-item-location">{project.location}</p>
                            <div style={{ marginTop: '6px', background: 'var(--border-light)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${project.progress ?? 0}%`,
                                    height: '100%',
                                    background: 'var(--primary)',
                                    borderRadius: '99px',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveProjects;

