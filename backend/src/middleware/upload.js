const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create year/month folder structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadPath = path.join(uploadDir, year.toString(), month);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50);
    
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
    fieldSize: 100 * 1024 * 1024, // 100MB for field data
    fieldNameSize: 1000, // Field name size
    fields: 1000 // Number of non-file fields
  },
  fileFilter: imageFilter
});

// Middleware for single image upload
const uploadSingle = upload.single('image');

// Middleware for multiple image upload
const uploadMultiple = upload.array('images', 10);

// Middleware for post with images
const uploadPostImages = (req, res, next) => {
  console.log('🔍 Upload middleware - req.user BEFORE:', req.user ? 'Present' : 'Missing');
  
  const uploadHandler = upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'image', maxCount: 1 } // For article editor image uploads
  ]);
  
  uploadHandler(req, res, (err) => {
    console.log('🔍 Upload middleware - req.user AFTER:', req.user ? 'Present' : 'Missing');
    if (err) {
      return next(err);
    }
    next();
  });
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadPostImages,
  handleUploadError
};