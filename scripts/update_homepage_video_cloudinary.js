const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
  secure: true,
});

async function main() {
  const publicId = 'plug-wa-notes/media/video-overview';
  const localVideoPath = path.join(__dirname, '..', 'public', 'media', 'video-overview.mp4');

  if (!fs.existsSync(localVideoPath)) {
    console.error(`Local video not found at: ${localVideoPath}`);
    process.exit(1);
  }

  console.log(`1. Deleting old video from Cloudinary: ${publicId}...`);
  try {
    const delRes = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log('Delete result:', delRes);
  } catch (err) {
    console.log('Old video delete notice:', err.message);
  }

  console.log(`\n2. Uploading new vertical homepage video (${(fs.statSync(localVideoPath).size / 1024 / 1024).toFixed(2)} MB)...`);
  try {
    const uploadRes = await cloudinary.uploader.upload(localVideoPath, {
      public_id: publicId,
      resource_type: 'video',
      overwrite: true,
    });
    console.log('Upload successful!');
    console.log('Secure URL:', uploadRes.secure_url);
    console.log('Bytes:', uploadRes.bytes);
    console.log('Duration:', uploadRes.duration);
    console.log('Width x Height:', uploadRes.width, 'x', uploadRes.height);
  } catch (err) {
    console.error('Upload failed:', err);
    process.exit(1);
  }
}

main();
