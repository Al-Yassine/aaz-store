import React, { useEffect } from 'react';
import './ImageViewer.css';

const ImageViewer = ({ images, currentIndex, onClose, onNavigate }) => {
  const hasMultipleImages = images.length > 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canGoPrev) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && canGoNext) {
        onNavigate(currentIndex + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [canGoNext, canGoPrev, currentIndex, onClose, onNavigate]);

  const handlePrev = () => {
    if (!canGoPrev) {
      return;
    }

    onNavigate(currentIndex - 1);
  };

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    onNavigate(currentIndex + 1);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-viewer-overlay" onClick={handleBackdropClick}>
      <button className="image-viewer-close" onClick={onClose} aria-label="Fermer">
        ×
      </button>
      {hasMultipleImages && (
        <>
          <button 
            className={`image-viewer-nav image-viewer-prev ${canGoPrev ? '' : 'disabled'}`}
            onClick={handlePrev}
            aria-label="Image précédente"
            disabled={!canGoPrev}
          >
            ‹
          </button>
          <button 
            className={`image-viewer-nav image-viewer-next ${canGoNext ? '' : 'disabled'}`}
            onClick={handleNext}
            aria-label="Image suivante"
            disabled={!canGoNext}
          >
            ›
          </button>
        </>
      )}
      <div className="image-viewer-content">
        <img 
          src={images[currentIndex]} 
          alt={`${currentIndex + 1}`}
          className="image-viewer-image"
          loading="eager"
        />
        {hasMultipleImages && (
          <div className="image-viewer-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;

