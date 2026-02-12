import React, { useEffect, useRef } from 'react';
import './SharePopup.css';

const SharePopup = ({ productName, productUrl, productImage, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const shareText = `Découvrez ${productName} sur AAZ Store! ${productUrl}`;

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the link
    copyToClipboard();
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productName)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async (e) => {
    try {
      await navigator.clipboard.writeText(productUrl);
      // Show a temporary success message
      const button = e?.target?.closest('.share-option');
      if (button) {
        const span = button.querySelector('span:last-child');
        if (span) {
          const originalText = span.textContent;
          span.textContent = '✓ Copié!';
          setTimeout(() => {
            span.textContent = originalText;
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="share-popup-overlay">
      <div className="share-popup" ref={popupRef}>
        <button className="share-popup-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <h3 className="share-popup-title">Partager ce produit</h3>
        <div className="share-options">
          <button className="share-option" onClick={shareToWhatsApp}>
            <div className="share-icon whatsapp">
              <img src="/Images/icons/icons8-whatsapp-logo-94.png" alt="WhatsApp" />
            </div>
            <span>WhatsApp</span>
          </button>
          <button className="share-option" onClick={shareToFacebook}>
            <div className="share-icon facebook">
              <img src="/Images/icons/icons8-facebook-48.png" alt="Facebook" />
            </div>
            <span>Facebook</span>
          </button>
          <button className="share-option" onClick={shareToInstagram}>
            <div className="share-icon instagram">
              <img src="/Images/icons/icons8-instagram-48.png" alt="Instagram" />
            </div>
            <span>Instagram</span>
          </button>
          <button className="share-option" onClick={shareToTelegram}>
            <div className="share-icon telegram">
              <img src="/Images/icons/icons8-telegram-94.png" alt="Telegram" />
            </div>
            <span>Telegram</span>
          </button>
          <button className="share-option" onClick={copyToClipboard}>
            <div className="share-icon copy">🔗</div>
            <span>Copier le lien</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;

