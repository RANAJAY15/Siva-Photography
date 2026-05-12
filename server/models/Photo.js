const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    filename: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Uncategorized',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    photographer: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
