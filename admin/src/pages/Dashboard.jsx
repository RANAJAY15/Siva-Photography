import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPhotos, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { photoSrc } from '../utils/photoSrc';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ photos: 0, categories: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [photosRes, catsRes] = await Promise.all([
          getPhotos({ limit: 6 }),
          getCategories(),
        ]);
        setStats({ photos: photosRes.data.total, categories: catsRes.data.length });
        setRecent(photosRes.data.photos);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard page-enter">
      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <p className="page-eyebrow">Admin Dashboard</p>
          <h1 className="page-title">{greeting()}, <span>{user?.name}</span> 👑</h1>
          <p className="page-sub">Here's an overview of your photography gallery.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">✦ Upload New Photo</Link>
      </div>

      {/* Stat cards */}
      <div className="dash-stats">
        <div className="stat-card">
          <div className="stat-card-icon photos">◈</div>
          <div className="stat-card-body">
            <p className="stat-card-label">Total Photos</p>
            <p className="stat-card-value">{loading ? '—' : stats.photos}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon cats">⊞</div>
          <div className="stat-card-body">
            <p className="stat-card-label">Categories</p>
            <p className="stat-card-value">{loading ? '—' : stats.categories}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon access">🔒</div>
          <div className="stat-card-body">
            <p className="stat-card-label">Portal Access</p>
            <p className="stat-card-value stat-card-badge">Admin Only</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dash-actions">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-action-grid">
          <Link to="/upload" className="action-card">
            <span className="action-icon">✦</span>
            <span className="action-label">Upload Photo</span>
            <span className="action-arrow">→</span>
          </Link>
          <Link to="/photos" className="action-card">
            <span className="action-icon">◈</span>
            <span className="action-label">Manage Photos</span>
            <span className="action-arrow">→</span>
          </Link>
          <Link to="/categories" className="action-card">
            <span className="action-icon">⊞</span>
            <span className="action-label">Categories</span>
            <span className="action-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Recent uploads */}
      <div className="dash-recent">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Uploads</h2>
          <Link to="/photos" className="btn btn-ghost">View All →</Link>
        </div>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Start by uploading your first photo.</p>
          </div>
        ) : (
          <div className="dash-photo-grid">
            {recent.map(photo => (
              <div key={photo._id} className="dash-photo-card">
                <div className="dash-photo-img-wrap">
                  <img
                    src={photoSrc(photo)}
                    alt={photo.title}
                    className="dash-photo-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="dash-photo-info">
                  <p className="dash-photo-title">{photo.title}</p>
                  <p className="dash-photo-meta">{photo.category} · {photo.photographer || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
