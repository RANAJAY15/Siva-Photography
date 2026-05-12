import './CategoryFilter.css';

export default function CategoryFilter({ categories, selected, onSelect }) {
  const all = ['All', ...categories];
  return (
    <div className="cat-filter">
      {all.map(cat => (
        <button
          key={cat}
          className={`cat-btn ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
