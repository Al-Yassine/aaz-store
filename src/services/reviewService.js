import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { firestore } from '../firebase';

const PRODUCT_REVIEWS_COLLECTION = 'productReviews';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeText = (value) => (value || '').toString().trim();

const formatReviewDate = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return '';
  }

  return dateValue.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const mapFirestoreError = (error, fallbackMessage) => {
  if (error?.code === 'permission-denied') {
    return 'Permissions Firestore insuffisantes. Verifiez les regles Firestore puis redeployez-les.';
  }

  if (error?.code === 'unavailable') {
    return 'Service temporairement indisponible. Veuillez reessayer dans un instant.';
  }

  return fallbackMessage;
};

const getCreatedAtDate = (createdAt) => {
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    return createdAt.toDate();
  }

  if (createdAt instanceof Date) {
    return createdAt;
  }

  return null;
};

const reviewToSortableMillis = (review) => {
  if (!(review.createdAt instanceof Date)) {
    return 0;
  }

  return review.createdAt.getTime();
};

const normalizeReview = (id, data) => {
  const createdAtDate = getCreatedAtDate(data?.createdAt);
  const parsedRating = Number(data?.rating);

  return {
    id,
    productId: sanitizeText(data?.productId),
    name: sanitizeText(data?.name),
    email: sanitizeText(data?.email).toLowerCase(),
    comment: sanitizeText(data?.comment),
    rating: Number.isFinite(parsedRating) ? Math.min(5, Math.max(1, Math.round(parsedRating))) : 0,
    createdAt: createdAtDate,
    date: formatReviewDate(createdAtDate)
  };
};

export const getProductReviews = async (productId) => {
  try {
    const normalizedProductId = sanitizeText(productId);

    if (!normalizedProductId) {
      return {
        success: true,
        data: []
      };
    }

    const reviewsRef = collection(firestore, PRODUCT_REVIEWS_COLLECTION);
    const reviewsQuery = query(reviewsRef, where('productId', '==', normalizedProductId));
    const querySnapshot = await getDocs(reviewsQuery);

    const reviews = [];
    querySnapshot.forEach((reviewDoc) => {
      const normalizedReview = normalizeReview(reviewDoc.id, reviewDoc.data());
      reviews.push(normalizedReview);
    });

    reviews.sort((a, b) => reviewToSortableMillis(b) - reviewToSortableMillis(a));

    return {
      success: true,
      data: reviews
    };
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return {
      success: false,
      error: mapFirestoreError(error, 'Impossible de charger les avis pour le moment.')
    };
  }
};

export const getAllProductReviews = async () => {
  try {
    const reviewsRef = collection(firestore, PRODUCT_REVIEWS_COLLECTION);
    const querySnapshot = await getDocs(reviewsRef);

    const reviews = [];
    querySnapshot.forEach((reviewDoc) => {
      const normalizedReview = normalizeReview(reviewDoc.id, reviewDoc.data());
      reviews.push(normalizedReview);
    });

    reviews.sort((a, b) => reviewToSortableMillis(b) - reviewToSortableMillis(a));

    return {
      success: true,
      data: reviews
    };
  } catch (error) {
    console.error('Error getting all product reviews:', error);
    return {
      success: false,
      error: mapFirestoreError(error, 'Impossible de charger les avis produits pour le moment.')
    };
  }
};

export const deleteProductReview = async (reviewId) => {
  try {
    const normalizedReviewId = sanitizeText(reviewId);

    if (!normalizedReviewId) {
      return {
        success: false,
        error: 'Identifiant avis invalide.'
      };
    }

    const reviewRef = doc(firestore, PRODUCT_REVIEWS_COLLECTION, normalizedReviewId);
    await deleteDoc(reviewRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting product review:', error);

    if (error?.code === 'permission-denied') {
      return {
        success: false,
        error: 'Suppression refusee: seuls les administrateurs peuvent supprimer un avis.'
      };
    }

    return {
      success: false,
      error: mapFirestoreError(error, 'Impossible de supprimer cet avis pour le moment.')
    };
  }
};

export const createProductReview = async ({ productId, name, email, comment, rating }) => {
  try {
    const normalizedProductId = sanitizeText(productId);
    const normalizedName = sanitizeText(name);
    const normalizedEmail = sanitizeText(email).toLowerCase();
    const normalizedComment = sanitizeText(comment);
    const normalizedRating = Number(rating);

    if (!normalizedProductId) {
      return {
        success: false,
        error: 'Produit invalide pour cet avis.'
      };
    }

    if (!normalizedName) {
      return {
        success: false,
        error: 'Le nom est requis.'
      };
    }

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return {
        success: false,
        error: 'Adresse email invalide.'
      };
    }

    if (!normalizedComment) {
      return {
        success: false,
        error: 'Le commentaire est requis.'
      };
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return {
        success: false,
        error: 'La note doit etre comprise entre 1 et 5.'
      };
    }

    const payload = {
      productId: normalizedProductId,
      name: normalizedName,
      email: normalizedEmail,
      comment: normalizedComment,
      rating: normalizedRating,
      createdAt: serverTimestamp()
    };

    const reviewRef = collection(firestore, PRODUCT_REVIEWS_COLLECTION);
    const docRef = await addDoc(reviewRef, payload);

    const now = new Date();

    return {
      success: true,
      data: {
        id: docRef.id,
        productId: normalizedProductId,
        name: normalizedName,
        email: normalizedEmail,
        comment: normalizedComment,
        rating: normalizedRating,
        createdAt: now,
        date: formatReviewDate(now)
      }
    };
  } catch (error) {
    console.error('Error creating product review:', error);
    return {
      success: false,
      error: mapFirestoreError(error, 'Impossible de publier votre avis pour le moment.')
    };
  }
};

const reviewService = {
  getProductReviews,
  getAllProductReviews,
  createProductReview,
  deleteProductReview
};

export default reviewService;
