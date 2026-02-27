import { demoProjects } from '../../services/demoData';
import './ActiveProjects.css';

const ActiveProjects = () => {
    const projects = demoProjects;

    return (
        <div className="active-projects">
            <h3>Active Projects</h3>
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
