const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure storage directory exists
const STORAGE_DIR = path.join(__dirname, '../../storage');
const VIDEOS_DIR = path.join(STORAGE_DIR, 'videos');
const ARTICLES_DIR = path.join(STORAGE_DIR, 'articles');

[VIDEOS_DIR, ARTICLES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const articleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ARTICLES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filters
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mkv|mov|wmv/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

const articleFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (ext) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed'));
  }
};

// Upload instances
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit
  fileFilter: videoFilter,
}).single('video');

const uploadArticle = multer({
  storage: articleStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: articleFilter,
}).single('article');

module.exports = {
  uploadVideo,
  uploadArticle,
  VIDEOS_DIR,
  ARTICLES_DIR,
};