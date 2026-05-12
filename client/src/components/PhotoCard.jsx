import { useState } from 'react';
import { likePhoto } from '../services/api';
import { photoSrc } from '../utils/photoSrc';
import './PhotoCard.css';

export default function PhotoCard({ photo, onClick }) {
  const [likes, setLikes] = useState(photo.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    try {
      const res = await likePhoto(photo._id);
      setLikes(res.data.likes);
      setLiked(true);
    } catch {}
  };

  return (
    <div className="photo-card" onClick={() => onClick(photo)}>
      <div className="photo-card-img-wrap">
        <img
          src={photoSrc(photo)}
          alt={photo.title}
          loading="lazy"
        />
        <div className="photo-card-overlay">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike} title="Like">
            ♥ {likes}
          </button>
          <span className="view-btn">View ↗</span>
        </div>
      </div>
      <div className="photo-card-info">
        <h3 className="photo-card-title">{photo.title}</h3>
        <div className="photo-card-meta">
          <span className="photo-category">{photo.category}</span>
          <span className="photo-views">👁 {photo.views || 0}</span>
        </div>
        {photo.tags?.length > 0 && (
          <div className="photo-tags">
            {photo.tags.slice(0, 3).map(t => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
