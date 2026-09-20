const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
});

async function uploadGif() {
  console.log('Uploading to Cloudinary directly from Tenor URL...');
  const tenorUrl = 'https://media.tenor.com/DHfQs8BKUvIAAAAM/kid-study.gif';
  
  const res = await cloudinary.uploader.upload(tenorUrl, {
    folder: 'plug-wa-notes',
    public_id: 'kid-study',
    overwrite: true,
  });

  console.log('--- Upload Success ---');
  console.log('Secure URL:', res.secure_url);
  console.log('Format:', res.format);
  console.log('Bytes:', res.bytes);
  console.log('Width:', res.width, 'Height:', res.height);
}

uploadGif().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
