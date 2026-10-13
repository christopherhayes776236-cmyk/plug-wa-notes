'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { PriceTag } from './PriceTag';
import { DownloadButton } from './DownloadButton';
import { PaymentModal } from './PaymentModal';
import { CelebrationOverlay } from './CelebrationOverlay';
import { StatusBanner } from './StatusBanner';
import { isFreeWeekend } from '@/lib/config';

interface ProductCardProps {
  product: Product;
  unitCode: string;
}

type CardState = 'idle' | 'paid';

export const ProductCard: React.FC<ProductCardProps> = ({ product, unitCode }) => {
  const freeWeekend = isFreeWeekend();
  const [state, setState] = useState<CardState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const isBlue = product.type === 'notes' || product.type === 'videoSlides';

  const handlePaymentSuccess = (url: string) => {
    setDownloadUrl(url);
    setShowModal(false);
    setShowCelebration(true);
    // State transitions to 'paid' after celebration fades
    // CelebrationOverlay calls onDone after 1500ms which triggers setState
  };

  const handleCelebrationDone = () => {
    setShowCelebration(false);
    setState('paid');
  };

  const getProductRealDownloadUrl = () => {
    if (product.fileUrl) return product.fileUrl;
    if (product.type === 'notes') return `/notes/${product.id}.pdf`;
    if (product.type === 'audio') return '/media/audio-highlight.mp3';
    if (product.type === 'video' || product.type === 'videoSlides') return '/media/video-overview.mp4';
    if (product.type === 'fullPack') {
      const cleanPrefix = product.id.replace('-full-pack', '');
      return `/notes/${cleanPrefix}-notes.pdf`;
    }
    return `/notes/${product.id}.pdf`;
  };

  const getProductFileName = () => {
    const cleanUnit = unitCode.toLowerCase().replace(/\s+/g, '-');
    if (product.type === 'audio') return `${cleanUnit}-audio-overview.mp3`;
    if (product.type === 'video') return `${cleanUnit}-explainer-video.mp4`;
    if (product.type === 'videoSlides') return `${cleanUnit}-video-slides.mp4`;
    if (product.type === 'fullPack') return `${cleanUnit}-complete-study-pack.pdf`;
    return `${product.id}.pdf`;
  };

  const renderDownloadButtons = () => {
    if (product.files && product.files.length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>
            Pack files ({product.files.length} items):
          </div>
          {product.files.map((file, idx) => (
            <DownloadButton
              key={idx}
              fileUrl={file.fileUrl}
              fileName={file.fileName}
              productName={file.name}
            />
          ))}
        </div>
      );
    }
    return (
      <DownloadButton
        fileUrl={downloadUrl || getProductRealDownloadUrl()}
        fileName={getProductFileName()}
        productName={product.name}
      />
    );
  };

  return (
    <>
      <div className="product-card">
        {product.type === 'fullPack' && product.collagePreviews && product.collagePreviews.length > 0 ? (
          <div className="product-card-thumb fullpack-collage">
            <div className={`fullpack-collage-grid ${product.collagePreviews.length === 2 ? 'grid-2' : 'grid-4'}`}>
              {product.collagePreviews.map((src, idx) => (
                <div key={idx} className="fullpack-collage-tile">
                  <img src={src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
            <span className="product-card-badge badge-fullPack">Complete Pack</span>
          </div>
        ) : (
          <div className={`product-card-thumb${product.type === 'notes' ? ' is-document' : ''}`}>
            <img
              src={product.thumbnailSrc}
              alt={`${product.name} cover`}
              width={640}
              height={360}
              loading="lazy"
            />
            <span className={`product-card-badge badge-${product.type}`}>
              {product.type === 'notes' ? 'Notes PDF' :
               product.type === 'video' ? 'Explainer Video' :
               product.type === 'videoSlides' ? 'Video + Slides' :
               product.type === 'audio' ? 'Audio Overview' : 'Resource'}
            </span>
          </div>
        )}

        <div className="product-card-body">
          <div className="product-card-top">
            <div>
              <p className="product-card-title">{product.name}</p>
              <p className="product-card-desc">{product.description}</p>
            </div>
            <PriceTag amount={product.price} variant={isBlue ? 'blue' : 'teal'} freeMode={freeWeekend} />
          </div>

          <div className="product-card-action">
            {state === 'idle' && (
              freeWeekend ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#15803d',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    width: 'fit-content',
                  }}>
                    <span>Free Weekend Pass</span>
                  </div>
                  {renderDownloadButtons()}
                </div>
              ) : (
                <button
                  className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                  onClick={() => setShowModal(true)}
                >
                  Buy — KSH {product.price}
                </button>
              )
            )}

            {state === 'paid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <StatusBanner status="paid" />
                {renderDownloadButtons()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment modal portal */}
      {showModal && (
        <PaymentModal
          product={product}
          unitCode={unitCode}
          onClose={() => setShowModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Celebration GIF portal */}
      {showCelebration && (
        <CelebrationOverlay onDone={handleCelebrationDone} />
      )}
    </>
  );
};
