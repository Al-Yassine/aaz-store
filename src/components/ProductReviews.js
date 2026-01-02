import React, { useState, useEffect } from 'react';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedReviews = localStorage.getItem(`product_reviews_${productId}`);
    if (storedReviews) {
      try {
        setReviews(JSON.parse(storedReviews));
      } catch (error) {}
    }
  }, [productId]);

  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem(`product_reviews_${productId}`, JSON.stringify(reviews));
    }
  }, [reviews, productId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Le commentaire est requis';
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Veuillez sélectionner une note';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newReview = {
      id: Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(), // Stored but not displayed
      comment: formData.comment.trim(),
      rating: formData.rating,
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    setReviews([newReview, ...reviews]);
    setFormData({ name: '', email: '', comment: '', rating: 0 });
    setShowSuccess(true);
    setErrors({});
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleStarClick = (rating) => {
    setFormData({ ...formData, rating });
    if (errors.rating) {
      setErrors({ ...errors, rating: '' });
    }
  };

  const renderStar = (starNumber) => {
    const isFilled = (hoveredStar || formData.rating) >= starNumber;
    return (
      <button
        type="button"
        key={starNumber}
        className={`star-btn ${isFilled ? 'filled' : ''}`}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => setHoveredStar(starNumber)}
        onMouseLeave={() => setHoveredStar(0)}
        aria-label={`Noter ${starNumber} étoile${starNumber > 1 ? 's' : ''}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    );
  };

  const renderDisplayStar = (starNumber, rating) => {
    const isFilled = rating >= starNumber;
    return (
      <span
        key={starNumber}
        className={`display-star ${isFilled ? 'filled' : ''}`}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    );
  };

  return (
    <div className="product-reviews">
      <h2 className="reviews-title">Avis clients</h2>

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Merci pour votre avis !
        </div>
      )}

      {/* Review Form */}
      <form className="review-form" onSubmit={handleSubmit}>
        <h3 className="form-title">Laisser un avis</h3>

        {/* Star Rating */}
        <div className="form-group">
          <label className="form-label">Note *</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => renderStar(star))}
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="review-name" className="form-label">Nom *</label>
          <input
            id="review-name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Votre nom"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Email (hidden but required) */}
        <div className="form-group">
          <label htmlFor="review-email" className="form-label">Email *</label>
          <input
            id="review-email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="votre@email.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {/* Comment */}
        <div className="form-group">
          <label htmlFor="review-comment" className="form-label">Commentaire *</label>
          <textarea
            id="review-comment"
            className={`form-textarea ${errors.comment ? 'error' : ''}`}
            value={formData.comment}
            onChange={(e) => {
              setFormData({ ...formData, comment: e.target.value });
              if (errors.comment) setErrors({ ...errors, comment: '' });
            }}
            placeholder="Partagez votre expérience avec ce produit..."
            rows="5"
          />
          {errors.comment && <span className="error-message">{errors.comment}</span>}
        </div>

        <button type="submit" className="submit-review-btn">
          Publier l'avis
        </button>
      </form>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">Aucun avis pour le moment. Soyez le premier à laisser un avis !</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-author">
                  <span className="review-name">{review.name}</span>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map(star => renderDisplayStar(star, review.rating))}
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
