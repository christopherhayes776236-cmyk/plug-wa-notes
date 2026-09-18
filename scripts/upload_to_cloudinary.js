/**
 * Upload study materials from 'notes and lm' to Cloudinary
 * Usage: node scripts/upload_to_cloudinary.js
 */

const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu',
  api_key: process.env.CLOUDINARY_API_KEY || '223698155615789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8',
  secure: true,
});

async function uploadFile(filePath, publicId, resourceType = 'raw') {
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
  const soen220Dir = path.join(__dirname, '..', 'notes and lm', 'soen220');

  if (!fs.existsSync(soen220Dir)) {
    console.log('soen220 directory not found');
    return;
  }

  // 1. Upload Notes PDF
  const pdfPath = path.join(soen220Dir, 'SOEN220_Data_Communication_Weeks1-2_Notes.pdf');
  if (fs.existsSync(pdfPath)) {
    await uploadFile(pdfPath, 'units/soen220/notes', 'raw');
  }

  // 2. Upload Slides PPTX
  const pptxPath = path.join(soen220Dir, 'slide overview.pptx');
  if (fs.existsSync(pptxPath)) {
    await uploadFile(pptxPath, 'units/soen220/slides', 'raw');
  }

  // 3. Upload Explainer Video MP4
  const videoPath = path.join(soen220Dir, 'video overview.mp4');
  if (fs.existsSync(videoPath)) {
    await uploadFile(videoPath, 'units/soen220/video', 'video');
  }

  console.log('\nAll available files processed!');
}

main();
