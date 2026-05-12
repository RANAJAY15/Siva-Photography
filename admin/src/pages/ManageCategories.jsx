import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import toast from 'react-hot-toast';
import './ManageCategories.css';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await getCategories();
      setCategories(r.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createCategory({ name: newName.trim() });
      toast.success(`Category "${newName.trim()}" added`);
      setNewName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add category');
    } finally { setAdding(false); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setDeleting(cat._id);
    try {
      await deleteCategory(cat._id);
      toast.success(`Category "${cat.name}" deleted`);
      fetchCategories();
    } catch { toast.error('Failed to delete category'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="manage-cats page-enter">
      <div className="page-header">
        <p className="page-eyebrow">Content Management</p>
        <h1 className="page-title">Manage <span>Categories</span></h1>
        <p className="page-sub">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} available</p>
      </div>

      {/* Add form */}
      <div className="mc-add-card card">
        <h3 className="mc-add-title">Add New Category</h3>
        <form className="mc-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Category name (e.g. Macro, Street Art)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="mc-add-input"
            maxLength={40}
          />
          <button type="submit" className="btn btn-primary" disabled={adding || !newName.trim()}>
            {adding ? 'Adding…' : '+ Add Category'}
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories yet</h3>
          <p>Add your first category above.</p>
        </div>
      ) : (
        <div className="mc-list">
          {categories.map((cat, i) => (
            <div key={cat._id} className="mc-item">
              <div className="mc-item-left">
                <span className="mc-item-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mc-item-name">{cat.name}</span>
              </div>
              <button
                className="btn btn-danger mc-delete"
                onClick={() => handleDelete(cat)}
                disabled={deleting === cat._id}
              >
                {deleting === cat._id ? '…' : '🗑 Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
