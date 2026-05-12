import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPhotos } from '../services/api';
import PhotoCard from '../components/PhotoCard';
import Lightbox from '../components/Lightbox';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selIdx, setSelIdx] = useState(0);

  useEffect(() => {
    getPhotos({ limit: 6 })
      .then(r => setFeatured(r.data.photos))
      .catch(() => { });
  }, []);

  const openPhoto = (photo) => {
    setSelected(photo);
    setSelIdx(featured.indexOf(photo));
  };
  const closeLightbox = () => setSelected(null);
  const prevPhoto = () => {
    const i = (selIdx - 1 + featured.length) % featured.length;
    setSelIdx(i); setSelected(featured[i]);
  };
  const nextPhoto = () => {
    const i = (selIdx + 1) % featured.length;
    setSelIdx(i); setSelected(featured[i]);
  };

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content container">
          <p className="hero-eyebrow">Welcome to Siva's Photography</p>
          <h1 className="section-title hero-title">
            Where <span className="accent">Every Frame</span><br />Tells a Story
          </h1>
          <p className="hero-sub">
            A curated space for photographers to share their vision,<br />
            explore stunning imagery, and inspire the world.
          </p>
          <div className="hero-actions">
            <Link to="/gallery" className="btn btn-primary">Explore Gallery</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">∞</span><span className="stat-label">Photos</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">HD</span><span className="stat-label">Quality</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">Free</span><span className="stat-label">Upload</span></div>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Featured */}
      <section className="featured-section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">Recent Uploads</p>
            <h2 className="section-title">Featured <span className="accent">Gallery</span></h2>
          </div>
          <Link to="/gallery" className="btn btn-outline">View All →</Link>
        </div>

        {featured.length === 0 ? (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Be the first to <Link to="/upload" style={{ color: 'var(--accent)' }}>upload a photo</Link>!</p>
          </div>
        ) : (
          <div className="featured-grid">
            {featured.map(photo => (
              <PhotoCard key={photo._id} photo={photo} onClick={openPhoto} />
            ))}
          </div>
        )}
      </section>


      {selected && (
        <Lightbox photo={selected} onClose={closeLightbox} onPrev={prevPhoto} onNext={nextPhoto} />
      )}
    </div>
  );
}
