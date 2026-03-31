import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { getProjectsWithCoordinates, getTodayCheckInLocations, getProjects } from '../../services/api';
import { MdRefresh, MdLocationOn, MdPeople, MdFolder, MdMap, MdOpenInNew, MdMyLocation, MdLayers } from 'react-icons/md';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './SiteMapPage.css';

// Fix default Leaflet marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createProjectIcon = (status) => {
    const colors = {
        in_progress: '#22C55E',
        on_hold: '#F59E0B',
        not_started: '#9CA3AF',
        completed: '#3B82F6',
    };
    const color = colors[status] || '#E8651A';

    return L.divIcon({
        className: 'site-map-marker-project',
        html: `<div class="marker-pin" style="background:${color}; box-shadow: 0 2px 8px ${color}66">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/></svg>
        </div>`,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
    });
};

const workerIcon = L.divIcon({
    className: 'site-map-marker-worker',
    html: `<div class="marker-pin-worker">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    </div>`,
    iconSize: [22, 26],
    iconAnchor: [11, 26],
    popupAnchor: [0, -26],
});

// Auto-fit map to markers
const FitBounds = ({ positions }) => {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [positions, map]);
    return null;
};

const statusConfig = {
    in_progress: { label: 'In Progress', color: '#22C55E', bg: '#DCFCE7' },
    on_hold: { label: 'On Hold', color: '#F59E0B', bg: '#FEF3C7' },
    not_started: { label: 'Not Started', color: '#9CA3AF', bg: '#F3F4F6' },
    completed: { label: 'Completed', color: '#3B82F6', bg: '#DBEAFE' },
};

const SiteMapPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [checkIns, setCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWorkers, setShowWorkers] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [mappedProjects, checkinData, allProj] = await Promise.all([
                getProjectsWithCoordinates(),
                getTodayCheckInLocations(),
                getProjects(),
            ]);
            setProjects(mappedProjects);
            setCheckIns(checkinData);
            setAllProjects(allProj);
        } catch (e) {
            toast.error('Failed to load map data: ' + e.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredProjects = useMemo(() => {
        if (selectedStatus === 'all') return projects;
        return projects.filter((p) => p.status === selectedStatus);
    }, [projects, selectedStatus]);

    const allPositions = useMemo(() => {
        const projectPos = filteredProjects.map((p) => [p.site_lat, p.site_lng]);
        const workerPos = showWorkers ? checkIns.map((c) => [c.check_in_lat, c.check_in_lng]) : [];
        return [...projectPos, ...workerPos];
    }, [filteredProjects, checkIns, showWorkers]);

    const unmappedCount = allProjects.length - projects.length;

    // Default center: India
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    return (
        <div className="sitemap-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1><MdMap style={{ verticalAlign: 'middle', marginRight: 8 }} />{t('site_map.title', 'Project Site Map')}</h1>
                    <p>{t('site_map.subtitle', 'Interactive map of all construction sites and workforce check-ins')}</p>
                </div>
                <div className="sitemap-header-actions">
                    <button className="btn btn-outline btn-sm" onClick={fetchData}>
                        <MdRefresh /> {t('common.refresh', 'Refresh')}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="sitemap-stats-bar">
                <div className="sitemap-stat">
                    <MdFolder className="sitemap-stat-icon" style={{ color: 'var(--primary)' }} />
                    <span className="sitemap-stat-value">{projects.length}</span>
                    <span className="sitemap-stat-label">{t('site_map.sites_mapped', 'Sites Mapped')}</span>
                </div>
                <div className="sitemap-stat">
                    <MdPeople className="sitemap-stat-icon" style={{ color: 'var(--info)' }} />
                    <span className="sitemap-stat-value">{checkIns.length}</span>
                    <span className="sitemap-stat-label">{t('site_map.checkins_today', 'Check-ins Today')}</span>
                </div>
                {unmappedCount > 0 && (
                    <div className="sitemap-stat sitemap-stat-warning">
                        <MdLocationOn className="sitemap-stat-icon" style={{ color: 'var(--warning)' }} />
                        <span className="sitemap-stat-value">{unmappedCount}</span>
                        <span className="sitemap-stat-label">{t('site_map.unmapped', 'Unmapped Projects')}</span>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="sitemap-controls">
                <div className="sitemap-filters">
                    <button
                        className={`filter-tab ${selectedStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('all')}
                    >
                        {t('common.all', 'All')} ({projects.length})
                    </button>
                    {Object.entries(statusConfig).map(([key, cfg]) => {
                        const count = projects.filter((p) => p.status === key).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={key}
                                className={`filter-tab ${selectedStatus === key ? 'active' : ''}`}
                                onClick={() => setSelectedStatus(key)}
                            >
                                <span className="filter-dot" style={{ background: cfg.color }}></span>
                                {cfg.label} ({count})
                            </button>
                        );
                    })}
                </div>
                <div className="sitemap-toggles">
                    <label className="sitemap-toggle">
                        <input type="checkbox" checked={showWorkers} onChange={(e) => setShowWorkers(e.target.checked)} />
                        <span className="sitemap-toggle-track"></span>
                        <MdPeople /> {t('site_map.show_workers', 'Workers')}
                    </label>
                    <label className="sitemap-toggle">
                        <input type="checkbox" checked={showGeofences} onChange={(e) => setShowGeofences(e.target.checked)} />
                        <span className="sitemap-toggle-track"></span>
                        <MdMyLocation /> {t('site_map.show_geofences', 'Geofences')}
                    </label>
                </div>
            </div>

            {/* Map Container */}
            <div className="sitemap-map-wrapper">
                {loading ? (
                    <div className="sitemap-loading">
                        <div className="loading-spinner"></div>
                        <p>{t('common.loading', 'Loading…')}</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="sitemap-empty">
                        <MdMap style={{ fontSize: '3rem', opacity: 0.3 }} />
                        <h3>{t('site_map.no_sites', 'No Project Sites Mapped')}</h3>
                        <p>{t('site_map.no_sites_hint', 'Add GPS coordinates (site_lat, site_lng) to your projects in the database to see them on the map.')}</p>
                    </div>
                ) : (
                    <MapContainer
                        center={allPositions.length > 0 ? allPositions[0] : defaultCenter}
                        zoom={defaultZoom}
                        className="sitemap-leaflet"
                        scrollWheelZoom={true}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {allPositions.length > 0 && <FitBounds positions={allPositions} />}

                        {/* Project Markers */}
                        {filteredProjects.map((project) => {
                            const cfg = statusConfig[project.status] || statusConfig.not_started;
                            return (
                                <Marker
                                    key={`project-${project.id}`}
                                    position={[project.site_lat, project.site_lng]}
                                    icon={createProjectIcon(project.status)}
                                >
                                    <Popup className="sitemap-popup">
                                        <div className="sitemap-popup-content">
                                            <h4>{project.name}</h4>
                                            <span
                                                className="sitemap-popup-badge"
                                                style={{ background: cfg.bg, color: cfg.color }}
                                            >
                                                {cfg.label}
                                            </span>
                                            {project.progress != null && (
                                                <div className="sitemap-popup-progress">
                                                    <div className="sitemap-progress-bar">
                                                        <div
                                                            className="sitemap-progress-fill"
                                                            style={{ width: `${project.progress || 0}%`, background: cfg.color }}
                                                        ></div>
                                                    </div>
                                                    <span>{project.progress || 0}%</span>
                                                </div>
                                            )}
                                            {project.location && (
                                                <p className="sitemap-popup-location">
                                                    <MdLocationOn /> {project.location}
                                                </p>
                                            )}
                                            {project.budget && (
                                                <p className="sitemap-popup-budget">
                                                    Budget: ₹{Number(project.budget).toLocaleString('en-IN')}
                                                </p>
                                            )}
                                            <button
                                                className="btn btn-primary btn-sm sitemap-popup-btn"
                                                onClick={() => navigate('/projects')}
                                            >
                                                <MdOpenInNew /> {t('site_map.view_project', 'View Project')}
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* Geofence Circles */}
                        {showGeofences && filteredProjects.map((project) => (
                            <Circle
                                key={`geofence-${project.id}`}
                                center={[project.site_lat, project.site_lng]}
                                radius={project.geofence_radius || 300}
                                pathOptions={{
                                    color: '#E8651A',
                                    fillColor: '#E8651A',
                                    fillOpacity: 0.08,
                                    weight: 1.5,
                                    dashArray: '6 4',
                                }}
                            />
                        ))}

                        {/* Worker Check-in Pins */}
                        {showWorkers && checkIns.map((checkin) => (
                            <Marker
                                key={`checkin-${checkin.id}`}
                                position={[checkin.check_in_lat, checkin.check_in_lng]}
                                icon={workerIcon}
                            >
                                <Popup className="sitemap-popup">
                                    <div className="sitemap-popup-content">
                                        <h4>{checkin.worker?.name || 'Worker'}</h4>
                                        <p className="sitemap-popup-time">
                                            Checked in: {new Date(checkin.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                        <span className={`sitemap-popup-badge ${checkin.location_verified ? 'verified' : 'unverified'}`}>
                                            {checkin.location_verified ? '✅ Location Verified' : '⚠️ Not Verified'}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Legend */}
            <div className="sitemap-legend">
                <div className="sitemap-legend-title">
                    <MdLayers /> {t('site_map.legend', 'Legend')}
                </div>
                <div className="sitemap-legend-items">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                        <div key={key} className="sitemap-legend-item">
                            <span className="sitemap-legend-dot" style={{ background: cfg.color }}></span>
                            {cfg.label}
                        </div>
                    ))}
                    <div className="sitemap-legend-item">
                        <span className="sitemap-legend-dot" style={{ background: '#3B82F6', width: 10, height: 10 }}></span>
                        Worker Check-in
                    </div>
                    <div className="sitemap-legend-item">
                        <span className="sitemap-legend-circle"></span>
                        Geofence (300m)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteMapPage;
