import React, { useEffect, useMemo, useState } from 'react';
import { createProductReview, getProductReviews } from '../services/reviewService';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isCancelled = false;

    setStatusMessage('');
    setStatusType('');

    const loadReviews = async () => {
      setLoadingReviews(true);

      const result = await getProductReviews(String(productId));

      if (isCancelled) {
        return;
      }

      if (result.success) {
        setReviews(result.data || []);
      } else {
        setReviews([]);
        setStatusType('error');
        setStatusMessage(result.error || 'Impossible de charger les avis pour le moment.');
      }

      setLoadingReviews(false);
    };

    loadReviews();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const ratingSummary = useMemo(() => {
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        average: 0,
        averageText: '0.0',
        starText: '☆☆☆☆☆',
        totalReviews: 0
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    const average = totalRating / totalReviews;
    const roundedToOneDecimal = Math.round(average * 10) / 10;
    const roundedStars = Math.max(0, Math.min(5, Math.round(average)));
    const starText = `${'★'.repeat(roundedStars)}${'☆'.repeat(5 - roundedStars)}`;

    return {
      average,
      averageText: roundedToOneDecimal.toFixed(1),
      starText,
      totalReviews
    };
  }, [reviews]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    setStatusType('');

    const result = await createProductReview({
      productId: String(productId),
      name: formData.name,
      email: formData.email,
      comment: formData.comment,
      rating: formData.rating
    });

    if (result.success && result.data) {
      setReviews((currentReviews) => [result.data, ...currentReviews]);
      setFormData({ name: '', email: '', comment: '', rating: 0 });
      setErrors({});
      setStatusType('success');
      setStatusMessage('Merci pour votre avis ! Votre commentaire a ete enregistre.');
    } else {
      setStatusType('error');
      setStatusMessage(result.error || 'Impossible de publier votre avis pour le moment.');
    }

    setSubmitting(false);
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

        <button type="submit" className="submit-review-btn" disabled={submitting}>
          {submitting ? 'Publication...' : "Publier l'avis"}
        </button>

        {statusMessage && (
          <p
            className={`review-status review-status-${statusType || 'info'}`}
            role={statusType === 'error' ? 'alert' : 'status'}
          >
            {statusMessage}
          </p>
        )}
      </form>

      <div className="reviews-summary" aria-live="polite">
        <p className="summary-rating-line">
          <span className="summary-stars" aria-hidden="true">{ratingSummary.starText}</span>{' '}
          <strong>{ratingSummary.averageText} / 5</strong>
        </p>
        <p className="summary-count-line">Base sur {ratingSummary.totalReviews} avis</p>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {loadingReviews ? (
          <p className="no-reviews">Chargement des avis...</p>
        ) : reviews.length === 0 ? (
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
