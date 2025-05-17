const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dcqyuixqu',
  api_key: '676924389238424',
  api_secret: 'cHNDZTOmPjR-6lh5KoCnrlLsW14'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'your_folder_name', // Tên folder trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

module.exports = { cloudinary, storage };
