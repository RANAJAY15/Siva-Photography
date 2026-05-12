import { useState, useEffect, useCallback, useRef } from 'react';
import { getPhotos, deletePhoto } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { photoSrc } from '../utils/photoSrc';
import './ManagePhotos.css';

export default function ManagePhotos() {
  const [photos, setPhotos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [deleting, setDeleting]       = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null); // for custom modal
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // lightbox
  const [viewMode, setViewMode]       = useState('grid'); // 'grid' | 'list'
  const [selectedCat, setSelectedCat] = useState('All');
  const [categories, setCategories]   = useState(['All']);
  const searchRef = useRef();
  const LIMIT = 12;

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (search) params.search = search;
      const r = await getPhotos(params);
      const all = r.data.photos;
      setPhotos(all);
      setTotal(r.data.total);
      // derive unique categories from results
      const cats = ['All', ...new Set(all.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch { toast.error('Failed to load photos'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setLightboxPhoto(null); setConfirmPhoto(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch(''); setSearchInput(''); setPage(1);
    searchRef.current?.focus();
  };

  const confirmDelete = (photo) => setConfirmPhoto(photo);

  const handleDelete = async () => {
    if (!confirmPhoto) return;
    setDeleting(confirmPhoto._id);
    setConfirmPhoto(null);
    try {
      await deletePhoto(confirmPhoto._id);
      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const filtered = selectedCat === 'All'
    ? photos
    : photos.filter(p => p.category === selectedCat);

  return (
    <div className="manage-photos page-enter">

      {/* ── Header ── */}
      <div className="mp-header">
        <div className="mp-header-left">
          <p className="page-eyebrow">Content Management</p>
          <h1 className="page-title">Manage <span>Photos</span></h1>
          <div className="mp-stats-row">
            <span className="mp-stat-pill">
              <span className="mp-stat-dot photos" />
              {total} Photo{total !== 1 ? 's' : ''}
            </span>
            {search && (
              <span className="mp-stat-pill accent">
                Filtered · "{search}"
              </span>
            )}
          </div>
        </div>
        <Link to="/upload" className="btn btn-primary mp-upload-btn">
          <span className="mp-upload-icon">✦</span>
          Upload New
        </Link>
      </div>

      {/* ── Toolbar ── */}
      <div className="mp-toolbar">
        <form className="mp-search-form" onSubmit={handleSearch}>
          <div className="mp-search-wrap">
            <span className="mp-search-icon">⌕</span>
            <input
              ref={searchRef}
              type="text"
              className="mp-search-input"
              placeholder="Search by title, photographer, or tag…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="mp-clear-btn" onClick={clearSearch}>✕</button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="mp-toolbar-right">
          {/* View toggle */}
          <div className="mp-view-toggle">
            <button
              className={`mp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >⊞</button>
            <button
              className={`mp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >☰</button>
          </div>
        </div>
      </div>

      {/* ── Category chips ── */}
      {categories.length > 1 && (
        <div className="mp-cat-row">
          {categories.map(cat => (
            <button
              key={cat}
              className={`mp-cat-chip ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >{cat}</button>
          ))}
        </div>
      )}

      {/* ── Grid / List ── */}
      {loading ? (
        <div className="mp-loading-state">
          <div className="mp-spinner" />
          <p>Loading photos…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mp-empty-state">
          <div className="mp-empty-icon">📷</div>
          <h3>No photos found</h3>
          <p>{search ? 'Try a different search term.' : 'Upload your first photo to get started.'}</p>
          {!search && (
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: '1rem' }}>✦ Upload Now</Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="mp-grid">
          {filtered.map(photo => (
            <div key={photo._id} className={`mp-card ${deleting === photo._id ? 'mp-card-deleting' : ''}`}>
              <div
                className="mp-img-wrap"
                onClick={() => setLightboxPhoto(photo)}
                style={{ cursor: 'zoom-in' }}
              >
                <img
                  src={photoSrc(photo)}
                  alt={photo.title}
                  className="mp-img"
                  onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
                />
                {/* Gradient overlay always */}
                <div className="mp-gradient" />
                {/* Hover action overlay */}
                <div className="mp-overlay">
                  <button
                    className="mp-action-btn mp-view-icon-btn"
                    onClick={e => { e.stopPropagation(); setLightboxPhoto(photo); }}
                  >🔍 <span>View</span></button>
                  <button
                    className="mp-action-btn mp-delete-btn"
                    onClick={e => { e.stopPropagation(); confirmDelete(photo); }}
                    disabled={deleting === photo._id}
                  >
                    {deleting === photo._id ? <span className="mp-btn-spinner" /> : '🗑'}
                    <span>{deleting === photo._id ? 'Deleting…' : 'Delete'}</span>
                  </button>
                </div>
                {/* Category badge */}
                {photo.category && (
                  <span className="mp-cat-badge">{photo.category}</span>
                )}
              </div>
              <div className="mp-info">
                <p className="mp-title">{photo.title}</p>
                <p className="mp-meta">
                  <span className="mp-meta-icon">📸</span>
                  {photo.photographer || 'Unknown'}
                </p>
                {photo.tags?.length > 0 && (
                  <div className="mp-tags">
                    {photo.tags.slice(0, 3).map(t => (
                      <span key={t} className="mp-tag">{t}</span>
                    ))}
                    {photo.tags.length > 3 && (
                      <span className="mp-tag mp-tag-more">+{photo.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List view ── */
        <div className="mp-list">
          {filtered.map(photo => (
            <div key={photo._id} className={`mp-list-row ${deleting === photo._id ? 'mp-card-deleting' : ''}`}>
              <div
                className="mp-list-thumb"
                onClick={() => setLightboxPhoto(photo)}
                style={{ cursor: 'zoom-in' }}
              >
                <img
                  src={photoSrc(photo)}
                  alt={photo.title}
                  className="mp-list-img"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="mp-list-info">
                <p className="mp-list-title">{photo.title}</p>
                <p className="mp-list-meta">{photo.category} · {photo.photographer || 'Unknown'}</p>
                {photo.tags?.length > 0 && (
                  <div className="mp-tags">
                    {photo.tags.slice(0, 5).map(t => (
                      <span key={t} className="mp-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="btn btn-danger mp-list-delete"
                onClick={() => confirmDelete(photo)}
                disabled={deleting === photo._id}
              >
                {deleting === photo._id ? '…' : '🗑 Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mp-pagination">
          <button className="mp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Prev
          </button>
          <div className="mp-page-dots">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`mp-page-dot ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
          </div>
          <button className="mp-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {lightboxPhoto && (
        <div className="mp-lightbox-overlay" onClick={() => setLightboxPhoto(null)}>
          <div className="mp-lightbox" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button className="mp-lb-close" onClick={() => setLightboxPhoto(null)}>✕</button>

            {/* Image */}
            <div className="mp-lb-img-wrap">
              <img
                src={photoSrc(lightboxPhoto)}
                alt={lightboxPhoto.title}
                className="mp-lb-img"
              />
            </div>

            {/* Info panel */}
            <div className="mp-lb-info">
              <div className="mp-lb-info-top">
                {lightboxPhoto.category && (
                  <span className="mp-cat-badge" style={{ position: 'static' }}>{lightboxPhoto.category}</span>
                )}
                <h2 className="mp-lb-title">{lightboxPhoto.title}</h2>
                {lightboxPhoto.photographer && (
                  <p className="mp-lb-photographer">📸 {lightboxPhoto.photographer}</p>
                )}
                {lightboxPhoto.description && (
                  <p className="mp-lb-desc">{lightboxPhoto.description}</p>
                )}
                {lightboxPhoto.tags?.length > 0 && (
                  <div className="mp-tags" style={{ marginTop: '0.75rem' }}>
                    {lightboxPhoto.tags.map(t => (
                      <span key={t} className="mp-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mp-lb-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => { setLightboxPhoto(null); confirmDelete(lightboxPhoto); }}
                >🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmPhoto && (
        <div className="mp-modal-overlay" onClick={() => setConfirmPhoto(null)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-thumb">
              <img src={photoSrc(confirmPhoto)} alt={confirmPhoto.title} />
            </div>
            <div className="mp-modal-body">
              <div className="mp-modal-icon">🗑</div>
              <h3>Delete Photo?</h3>
              <p>
                <strong>"{confirmPhoto.title}"</strong> will be permanently removed from the gallery.
                This action cannot be undone.
              </p>
              <div className="mp-modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmPhoto(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
