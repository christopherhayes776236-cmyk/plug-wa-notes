const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
  secure: true,
});

async function uploadMedia(filePath, publicId, resourceType = 'video') {
  console.log(`Uploading ${filePath} -> ${publicId} (${resourceType})...`);
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    });
    console.log(`✓ Uploaded: ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.error(`✗ Error uploading ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  const mediaDir = path.join(__dirname, '..', 'public', 'media');

  const notesPath = path.join(mediaDir, 'notes-overview.mp4');
  const videoPath = path.join(mediaDir, 'video-overview.mp4');
  const audioPath = path.join(mediaDir, 'audio-highlight.m4a');
  const audioMp3Path = path.join(mediaDir, 'audio-highlight.mp3');

  const results = {};

  if (fs.existsSync(notesPath)) {
    results.notes = await uploadMedia(notesPath, 'plug-wa-notes/media/notes-overview', 'video');
  }
  if (fs.existsSync(videoPath)) {
    results.video = await uploadMedia(videoPath, 'plug-wa-notes/media/video-overview', 'video');
  }
  if (fs.existsSync(audioPath)) {
    results.audio = await uploadMedia(audioPath, 'plug-wa-notes/media/audio-overview', 'video');
  }
  if (fs.existsSync(audioMp3Path)) {
    results.audioMp3 = await uploadMedia(audioMp3Path, 'plug-wa-notes/media/audio-overview-mp3', 'raw');
  }

  console.log('\n--- Upload Complete ---');
  console.log(JSON.stringify(results, null, 2));
}

main();
