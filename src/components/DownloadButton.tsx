'use client';

import React from 'react';

interface DownloadButtonProps {
  fileUrl: string;
  fileName: string;
  productName: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  fileUrl,
  fileName,
  productName,
}) => {
  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const finalUrl = getDownloadUrl(fileUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = fileName || 'plug-wa-notes-study-material';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={handleDownload}
        className="btn-buy btn-buy-teal"
        style={{ gap: '0.5rem' }}
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ flexShrink: 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Download {productName}</span>
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
        File saves directly to your device storage.
      </p>
    </div>
  );
};
