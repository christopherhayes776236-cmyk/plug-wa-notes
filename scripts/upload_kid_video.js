const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
});

async function uploadVideo() {
  console.log('Uploading kid-study MP4 to Cloudinary...');
  const res = await cloudinary.uploader.upload('https://media.tenor.com/DHfQs8BKUvIAAAPo/kid-study.mp4', {
    resource_type: 'video',
    folder: 'plug-wa-notes',
    public_id: 'kid-study-loop',
    overwrite: true,
  });
  console.log('Upload success:');
  console.log('Secure URL:', res.secure_url);
  console.log('Bytes:', res.bytes);
  console.log('Duration:', res.duration);
}

uploadVideo().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
