import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
  secure: true,
});

async function main() {
  const filePath = path.resolve(process.cwd(), 'Wesonga_optimized.mp4');
  console.log('Uploading optimized video to Cloudinary...');

  try {
    const res = await cloudinary.uploader.upload(filePath, {
      public_id: 'units/common/wesonga-strike',
      resource_type: 'video',
      overwrite: true,
    });
    console.log('Upload successful!');
    console.log('Cloudinary Video URL:', res.secure_url);
  } catch (err) {
    console.error('Cloudinary upload error:', err);
  }
}

main();
