import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PhotoSlider.css';

const DRAG_INTENT_THRESHOLD = 12;
const SWIPE_COMMIT_THRESHOLD = 60;
const CLICK_SUPPRESS_MS = 280;
const POST_DRAG_CLICK_GUARD_MS = 220;

const PhotoSlider = ({ images = [], productName, compact = false, onImageClick }) => {
  const unique = Array.from(new Set(images.map(i => i.replace(/^\/images\//i, '/Images/'))));
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const sliderRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimeoutRef = useRef(null);
  const lastInteractionRef = useRef({
    dragged: false,
    endedAt: 0
  });

  const clearSuppressClickTimeout = useCallback(() => {
    if (suppressClickTimeoutRef.current) {
      clearTimeout(suppressClickTimeoutRef.current);
      suppressClickTimeoutRef.current = null;
    }
  }, []);

  const temporarilySuppressClick = useCallback(() => {
    suppressClickRef.current = true;
    clearSuppressClickTimeout();
    suppressClickTimeoutRef.current = setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimeoutRef.current = null;
    }, CLICK_SUPPRESS_MS);
  }, [clearSuppressClickTimeout]);

  const handleSliderImageClick = useCallback((e, imageIndex) => {
    e.stopPropagation();

    const elapsedSinceDrag = Date.now() - lastInteractionRef.current.endedAt;

    if (
      suppressClickRef.current ||
      isDragging ||
      hasMoved ||
      (lastInteractionRef.current.dragged && elapsedSinceDrag < POST_DRAG_CLICK_GUARD_MS)
    ) {
      return;
    }

    if (onImageClick) {
      onImageClick(imageIndex);
    }
  }, [hasMoved, isDragging, onImageClick]);

  const prev = useCallback((e) => {
    if (e) e.stopPropagation();
    setIndex(i => Math.max(0, i - 1));
  }, []);
  
  const next = useCallback((e) => {
    if (e) e.stopPropagation();
    setIndex(i => Math.min(unique.length - 1, i + 1));
  }, [unique.length]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    const dragDistance = Math.abs(translateX);
    const didDrag = hasMoved || dragDistance >= DRAG_INTENT_THRESHOLD;
    
    setIsDragging(false);
    lastInteractionRef.current.dragged = didDrag;
    lastInteractionRef.current.endedAt = Date.now();
    
    // Suppress click shortly after any drag-like gesture to avoid accidental opens.
    if (didDrag) {
      temporarilySuppressClick();

      // Move slide only if swipe distance is intentional.
      if (translateX > SWIPE_COMMIT_THRESHOLD) {
        prev();
      } else if (translateX < -SWIPE_COMMIT_THRESHOLD) {
        next();
      }
    }
    
    setTranslateX(0);
    setHasMoved(false);
  }, [hasMoved, isDragging, next, prev, translateX, temporarilySuppressClick]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > DRAG_INTENT_THRESHOLD) {
      setHasMoved(true);
    }
    setTranslateX(diff);
  }, [isDragging, startX]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch/Mouse drag handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
    setHasMoved(false);
    lastInteractionRef.current.dragged = false;
  };

  const handleMouseDown = (e) => handleStart(e.clientX);
  
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    e.stopPropagation();
    handleStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > DRAG_INTENT_THRESHOLD) {
      setHasMoved(true);
      e.stopPropagation();
    }
    setTranslateX(diff);
  };
  const handleTouchEnd = (e) => {
    e.stopPropagation();
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      clearSuppressClickTimeout();
    };
  }, [clearSuppressClickTimeout]);

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(unique.length - 1, 0)));
  }, [unique.length]);
  
  if (!unique || unique.length === 0) return null;

  // Compact mode for product cards
  if (compact) {
    return (
      <div 
        className="photo-slider-compact"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <div className="slider-track">
          <div 
            className="slider-images-container"
            style={{
              transform: `translateX(calc(-${index * 100}% + ${translateX}px))`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {unique.map((img, i) => (
              <div key={i} className="slider-image-wrapper">
                <img 
                  src={img} 
                  alt={`${productName} - ${i + 1}`} 
                  className="slider-image"
                  draggable="false"
                  onClick={(e) => handleSliderImageClick(e, i)}
                  style={{ cursor: onImageClick ? 'pointer' : 'default' }}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
        
        {unique.length > 1 && (
          <>
            <button 
              className={`slider-arrow slider-arrow-left ${index === 0 ? 'disabled' : ''}`}
              onClick={prev}
              aria-label="Previous image"
              disabled={index === 0}
            >
              ‹
            </button>
            <button 
              className={`slider-arrow slider-arrow-right ${index === unique.length - 1 ? 'disabled' : ''}`}
              onClick={next}
              aria-label="Next image"
              disabled={index === unique.length - 1}
            >
              ›
            </button>
            <div className="slider-dots">
              {unique.map((_, i) => (
                <button
                  key={i}
                  className={`slider-dot ${i === index ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full mode for product detail page with smooth sliding
  return (
    <div className="photo-slider">
      <div 
        className="single-image-container"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <div className="slider-track-full">
          <div 
            className="slider-images-container-full"
            style={{
              transform: `translateX(calc(-${index * 100}% + ${translateX}px))`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {unique.map((img, i) => (
              <div key={i} className="slider-image-wrapper-full">
                <img 
                  src={img} 
                  alt={`${productName} - ${i + 1}`} 
                  className="single-image"
                  draggable="false"
                  onClick={(e) => handleSliderImageClick(e, i)}
                  style={{ cursor: onImageClick ? 'pointer' : 'default' }}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
        
        {unique.length > 1 && (
          <>
            <button className={`slider-btn prev-btn ${index === 0 ? 'disabled' : ''}`} onClick={prev} aria-label="Previous image" disabled={index === 0}>❮</button>
            <button className={`slider-btn next-btn ${index === unique.length - 1 ? 'disabled' : ''}`} onClick={next} aria-label="Next image" disabled={index === unique.length - 1}>❯</button>
            <div className="image-counter">{index + 1}/{unique.length}</div>
          </>
        )}
      </div>

      {unique.length > 1 && (
        <div className="thumbnails">
          {unique.map((src, i) => (
            <button key={src} className={`thumb-btn ${i===index? 'active':''}`} onClick={() => setIndex(i)} aria-label={`Show image ${i+1}`}>
              <img src={src} alt={`thumb-${i}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoSlider;
