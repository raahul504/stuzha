const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const contentRoutes = require('./routes/contentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const videoRoutes = require('./routes/videoRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ========== MIDDLEWARE ==========
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Allow cookies
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== ROUTES ==========
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS API is running' });
});

// TODO: Add route imports here
// app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes);
// etc.

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', moduleRoutes);
app.use('/api', contentRoutes);
app.use('/api', progressRoutes);
app.use('/api', videoRoutes);
app.use('/api', certificateRoutes);
app.use('/api/user', userRoutes);

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: { message: 'Route not found' }
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LMS API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});