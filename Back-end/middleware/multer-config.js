const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (req.file) {
      const filename = `${req.file.originalname.split(' ').join('_').split('.')[0]}_${Date.now()}.webp`;
      const outputPath = path.join('images', filename);
      try {
        await sharp(req.file.buffer)
          .resize(450, 580) // Size // 
          .webp({ quality: 80 }) //  Qualité de l'image //
          .toFile(outputPath);

        
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);
        next();
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      next();
    }
  });
};


      