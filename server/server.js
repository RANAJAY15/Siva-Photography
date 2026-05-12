const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const photosRouter     = require('./routes/photos');
const categoriesRouter = require('./routes/categories');
const authRouter       = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,   // e.g. https://siva-photography-zeta.vercel.app
  process.env.ADMIN_URL,    // e.g. https://siva-photography-admin.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, Postman, same-origin)
    if (!origin) return cb(null, true);
    // allow any vercel.app subdomain (covers all preview + production deployments)
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    // allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/photos',     photosRouter);
app.use('/api/categories', categoriesRouter);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'Photography Gallery API is running 🚀' })
);

// ── Connect to MongoDB & Start ─────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
