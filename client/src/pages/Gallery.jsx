import { useState, useEffect, useCallback } from 'react';
import { getPhotos, getCategories } from '../services/api';
import PhotoCard from '../components/PhotoCard';
import Lightbox from '../components/Lightbox';
import CategoryFilter from '../components/CategoryFilter';
import toast from 'react-hot-toast';
import './Gallery.css';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selIdx, setSelIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (activeCategory !== 'All') params.category = activeCategory;
      if (search) params.search = search;
      const r = await getPhotos(params);
      setPhotos(r.data.photos);
      setTotal(r.data.total);
    } catch { toast.error('Failed to load photos'); }
    finally { setLoading(false); }
  }, [activeCategory, search, page]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);
  useEffect(() => {
    getCategories().then(r => setCategories(r.data.map(c => c.name))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };
  const handleCategory = (cat) => { setActiveCategory(cat); setPage(1); };

  const openPhoto = (photo) => { setSelected(photo); setSelIdx(photos.indexOf(photo)); };
  const closeLightbox = () => setSelected(null);
  const prevPhoto = () => { const i = (selIdx - 1 + photos.length) % photos.length; setSelIdx(i); setSelected(photos[i]); };
  const nextPhoto = () => { const i = (selIdx + 1) % photos.length; setSelIdx(i); setSelected(photos[i]); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="gallery-page page-enter">
      <div className="gallery-header container">
        <div>
          <p className="eyebrow">All Photos</p>
          <h1 className="section-title">The <span className="accent">Gallery</span></h1>
          <p className="gallery-count">{total} photo{total !== 1 ? 's' : ''} in collection</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, tag, photographer…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="gallery-filters container">
        <CategoryFilter categories={categories} selected={activeCategory} onSelect={handleCategory} />
      </div>

      <div className="gallery-grid-wrap container">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <h3>No photos found</h3>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map(photo => (
              <div key={photo._id} className="gallery-item">
                <PhotoCard photo={photo} onClick={openPhoto} />
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination container">
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {selected && (
        <Lightbox photo={selected} onClose={closeLightbox} onPrev={prevPhoto} onNext={nextPhoto} />
      )}
    </div>
  );
}
