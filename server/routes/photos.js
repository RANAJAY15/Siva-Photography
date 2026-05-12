const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const { upload, cloudinary } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/photos — public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title:        { $regex: search, $options: 'i' } },
        { tags:         { $regex: search, $options: 'i' } },
        { photographer: { $regex: search, $options: 'i' } },
      ];
    }
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Photo.countDocuments(query);
    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ photos, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/:id — public
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photos — admin only
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });
    const { title, description, category, tags, photographer } = req.body;

    const photo = new Photo({
      title:        title || 'Untitled',
      description:  description || '',
      // Cloudinary fields
      imageUrl:     req.file.path,          // full CDN URL
      publicId:     req.file.filename,      // cloudinary public_id
      filename:     req.file.filename,      // kept for compat
      originalName: req.file.originalname || '',
      category:     category || 'Uncategorized',
      tags:         tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      photographer: photographer || 'Unknown',
    });
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/photos/:id/like — any logged-in user
router.patch('/:id/like', protect, async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/photos/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Remove from Cloudinary if publicId exists
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId).catch(() => {});
    }

    await photo.deleteOne();
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
