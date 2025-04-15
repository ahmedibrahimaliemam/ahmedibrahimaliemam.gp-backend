// src/middleware/upload.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // adjust the path as needed
  },
  filename: (req, file, cb) => {
    // Create a unique file name based on Date.now()
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });
