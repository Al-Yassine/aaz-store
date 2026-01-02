import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PhotoSlider.css';

// Multi-image gallery with thumbnails and next/prev controls.
const PhotoSlider = ({ images = [], productName, compact = false }) => {
  const unique = Array.from(new Set(images.map(i => i.replace(/^\/images\//i, '/Images/'))));
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const sliderRef = useRef(null);

  const prev = useCallback((e) => {
    if (e) e.stopPropagation();
    setIndex(i => (i - 1 + unique.length) % unique.length);
  }, [unique.length]);
  
  const next = useCallback((e) => {
    if (e) e.stopPropagation();
    setIndex(i => (i + 1) % unique.length);
  }, [unique.length]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    const dragDuration = Date.now() - dragStartTime;
    const wasDragging = hasMoved && (Math.abs(translateX) > 10 || dragDuration > 200);
    
    setIsDragging(false);
    
    // Only change slides if it was actually a drag (moved more than 10px or took more than 200ms)
    if (wasDragging) {
      // Swipe threshold: 50px
      if (translateX > 50) {
        prev();
      } else if (translateX < -50) {
        next();
      }
    }
    
    setTranslateX(0);
    setHasMoved(false);
  }, [isDragging, translateX, dragStartTime, hasMoved, prev, next]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 5) {
      setHasMoved(true);
    }
    setTranslateX(diff);
  }, [isDragging, startX]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch/Mouse drag handlers
  const handleStart = (clientX, e) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
    setDragStartTime(Date.now());
    setHasMoved(false);
  };

  const handleMouseDown = (e) => handleStart(e.clientX, e);
  
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    e.stopPropagation();
    handleStart(e.touches[0].clientX, e);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 5) {
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
                />
              </div>
            ))}
          </div>
        </div>
        
        {unique.length > 1 && (
          <>
            <button 
              className="slider-arrow slider-arrow-left" 
              onClick={prev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button 
              className="slider-arrow slider-arrow-right" 
              onClick={next}
              aria-label="Next image"
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
                />
              </div>
            ))}
          </div>
        </div>
        
        {unique.length > 1 && (
          <>
            <button className="slider-btn prev-btn" onClick={prev} aria-label="Previous image">❮</button>
            <button className="slider-btn next-btn" onClick={next} aria-label="Next image">❯</button>
            <div className="image-counter">{index + 1}/{unique.length}</div>
          </>
        )}
      </div>

      {unique.length > 1 && (
        <div className="thumbnails">
          {unique.map((src, i) => (
            <button key={src} className={`thumb-btn ${i===index? 'active':''}`} onClick={() => setIndex(i)} aria-label={`Show image ${i+1}`}>
              <img src={src} alt={`thumb-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoSlider;
