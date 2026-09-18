import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'nd4ofxfu';
const apiKey = process.env.CLOUDINARY_API_KEY || '223698155615789';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'sa7BZhiDrUw70XvSJl-CXh167n8';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

/**
 * Generates an instant forced-download URL for purchased study materials
 * Using Cloudinary's 'fl_attachment' transformation flag
 */
export function getProductDownloadUrl(unitCode: string, productType: string, customFileUrl?: string | null): string {
  if (customFileUrl) {
    if (customFileUrl.includes('cloudinary.com') && !customFileUrl.includes('fl_attachment')) {
      return customFileUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    return customFileUrl;
  }

  const cleanUnit = unitCode.toLowerCase().replace(/\s+/g, '');
  const extension = productType === 'video' ? 'mp4' : productType === 'videoSlides' ? 'zip' : 'pdf';
  const resourceType = productType === 'video' ? 'video' : 'raw';

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/v1/units/${cleanUnit}/${productType}.${extension}`;
}
