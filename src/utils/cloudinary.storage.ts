// src/utils/cloudinary.storage.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.config';


cloudinary.config({
  cloud_name: 'dvz57udmk',
  api_key: '892544714195496',
  api_secret: 'CcVIN__7rElqYQrRo5tvMh7TCeU',
});

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'profile-images', // ✅ Valid key now because it’s inside a function
      format: file.mimetype.split('/')[1], // dynamically resolve format (e.g., 'png', 'jpeg')
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});