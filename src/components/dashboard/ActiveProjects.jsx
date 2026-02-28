import { useState, useEffect } from 'react';
import { getProjects } from '../../services/api';
import './ActiveProjects.css';

const ActiveProjects = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        getProjects()
            .then((data) => setProjects(data.filter((p) => p.status === 'in_progress')))
            .catch(console.error);
    }, []);

    return (
        <div className="active-projects">
            <h3>Active Projects</h3>
            {projects.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active projects.</p>
            )}
            {projects.map((project) => (
                <div key={project.id} className="project-item">
                    <div className="project-item-info">
                        <div className="project-item-bar"></div>
                        <div>
                            <p className="project-item-name">{project.name}</p>
                            <p className="project-item-location">{project.location}</p>
                        </div>
                    </div>
                    <span className="project-item-progress">{project.progress}%</span>
                </div>
            ))}
        </div>
    );
};

export default ActiveProjects;
