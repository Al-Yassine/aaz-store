import React, { useEffect } from 'react';
import './ImageViewer.css';

const ImageViewer = ({ images, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        onNavigate(prevIndex);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % images.length;
        onNavigate(nextIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
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
      {images.length > 1 && (
        <>
          <button 
            className="image-viewer-nav image-viewer-prev" 
            onClick={handlePrev}
            aria-label="Image précédente"
          >
            ‹
          </button>
          <button 
            className="image-viewer-nav image-viewer-next" 
            onClick={handleNext}
            aria-label="Image suivante"
          >
            ›
          </button>
        </>
      )}
      <div className="image-viewer-content">
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="image-viewer-image"
          loading="eager"
        />
        {images.length > 1 && (
          <div className="image-viewer-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;

