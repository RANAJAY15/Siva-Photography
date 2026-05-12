import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPhoto, getCategories } from '../services/api';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './UploadPhoto.css';

const DEFAULT_CATS = ['Nature','Portrait','Urban','Architecture','Wildlife','Travel','Abstract','Sports','Food','Street','Aerial','Other'];

function centerAspectCrop(mediaWidth, mediaHeight) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, undefined, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export default function UploadPhoto() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Nature', tags: '', photographer: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATS);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSrc, setRawSrc] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(r => { if (r.data.length > 0) setCategories(r.data.map(c => c.name)); })
      .catch(() => {});
  }, []);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setRawFile(f);
    setRawSrc(URL.createObjectURL(f));
    setCrop(undefined);
    setCompletedCrop(null);
    setCropModalOpen(true);
  };

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setCrop(centerAspectCrop(w, h));
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const getCroppedBlob = () =>
    new Promise((resolve) => {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const c = completedCrop;
      canvas.width = Math.floor(c.width * scaleX);
      canvas.height = Math.floor(c.height * scaleY);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        c.x * scaleX, c.y * scaleY,
        c.width * scaleX, c.height * scaleY,
        0, 0,
        canvas.width, canvas.height,
      );
      canvas.toBlob(resolve, rawFile.type || 'image/jpeg', 0.95);
    });

  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      // No crop drawn — use original
      setFile(rawFile);
      setPreview(rawSrc);
      setCropModalOpen(false);
      return;
    }
    const blob = await getCroppedBlob();
    const croppedFile = new File([blob], rawFile.name, { type: rawFile.type });
    setFile(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setCropModalOpen(false);
  };

  const cancelCrop = () => {
    setCropModalOpen(false);
    if (!file) { setRawSrc(null); setRawFile(null); }
  };

  const openCropAgain = () => {
    setRawSrc(URL.createObjectURL(file));
    setCrop(undefined);
    setCompletedCrop(null);
    setCropModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await uploadPhoto(fd);
      toast.success('Photo uploaded successfully! 🎉');
      navigate('/photos');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="upload-page page-enter">
      <div className="page-header">
        <p className="page-eyebrow">Content Management</p>
        <h1 className="page-title">Upload <span>Photo</span></h1>
        <p className="page-sub">Add a new photo to the gallery collection</p>
      </div>

      <form className="upload-form" onSubmit={onSubmit}>
        <div className="upload-grid">
          {/* Left: drop zone */}
          <div className="upload-left">
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="drop-preview" />
              ) : (
                <div className="drop-placeholder">
                  <span className="drop-icon">📷</span>
                  <p>Drag &amp; drop your image here</p>
                  <p className="drop-sub">or click to browse · JPG, PNG, WEBP up to 15MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
            </div>
            {preview && (
              <div className="image-action-btns">
                <button type="button" className="btn btn-ghost change-btn" onClick={() => fileRef.current.click()}>
                  ↺ Change Image
                </button>
                <button type="button" className="btn btn-ghost crop-btn" onClick={openCropAgain}>
                  ✂ Crop / Adjust
                </button>
              </div>
            )}
          </div>

          {/* Right: fields */}
          <div className="upload-right">
            <div className="field">
              <label>Title *</label>
              <input type="text" placeholder="Give your photo a title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Photographer</label>
              <input type="text" placeholder="Photographer name" value={form.photographer}
                onChange={e => setForm({ ...form, photographer: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tags <span className="field-hint">(comma-separated)</span></label>
              <input type="text" placeholder="e.g. sunset, landscape, golden" value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea placeholder="Describe your photo…" rows={4} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="upload-actions">
              <button type="submit" className="btn btn-primary upload-submit" disabled={uploading}>
                {uploading ? 'Uploading…' : '✦ Upload Photo'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/photos')}>Cancel</button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Crop Modal ── */}
      {cropModalOpen && (
        <div className="crop-overlay" onClick={cancelCrop}>
          <div className="crop-modal" onClick={e => e.stopPropagation()}>
            <div className="crop-modal-header">
              <h2>✂ Crop Image</h2>
              <p>Drag to select the area you want to keep</p>
            </div>
            <div className="crop-canvas-wrap">
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={rawSrc}
                  alt="Crop source"
                  className="crop-source-img"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            <div className="crop-modal-actions">
              <button className="btn btn-ghost" onClick={cancelCrop}>Cancel</button>
              <button className="btn btn-primary" onClick={applyCrop}>✔ Apply Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
