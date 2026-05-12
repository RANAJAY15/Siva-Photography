import { useEffect, useCallback } from 'react';
import { photoSrc } from '../utils/photoSrc';
import './Lightbox.css';

export default function Lightbox({ photo, onClose, onPrev, onNext }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!photo) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>
        <button className="lb-nav lb-prev" onClick={onPrev}>‹</button>
        <button className="lb-nav lb-next" onClick={onNext}>›</button>

        <div className="lb-img-wrap">
          <img src={photoSrc(photo)} alt={photo.title} />
        </div>

        <div className="lb-info">
          <div className="lb-info-header">
            <h2>{photo.title}</h2>
            <span className="photo-category">{photo.category}</span>
          </div>
          {photo.description && <p className="lb-desc">{photo.description}</p>}
          <div className="lb-meta">
            <span>📷 {photo.photographer}</span>
            <span>♥ {photo.likes} likes</span>
            <span>👁 {photo.views} views</span>
          </div>
          {photo.tags?.length > 0 && (
            <div className="lb-tags">
              {photo.tags.map(t => <span key={t} className="tag">#{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
