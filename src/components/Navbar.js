import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/Images/logo/aazstore-logo.png" 
            alt="AAZ Store Logo" 
            className="navbar-logo-img"
            loading="eager"
          />
          <span className="navbar-logo-text">AAZ Store</span>
        </Link>
        <div className="navbar-right">
          <Link to="/cart" className="navbar-cart-link">
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{getTotalItems()}</span>
          </Link>
          <button className="navbar-toggle" aria-label="Toggle navigation" aria-expanded={isOpen} aria-controls="navbar-menu" onClick={() => setIsOpen(!isOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        <div 
          className={`navbar-menu-backdrop ${isOpen ? 'open' : ''}`}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        <ul id="navbar-menu" className={`navbar-menu ${isOpen ? 'open' : ''}`} role="menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={handleLinkClick}>
              Acceuil
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="navbar-link" onClick={handleLinkClick}>
              Articles
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/contact" className="navbar-link" onClick={handleLinkClick}>
              Contact
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link" onClick={handleLinkClick}>
              A propos
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/nouvelle-collection" className="navbar-link" onClick={handleLinkClick}>
              Nouvelle collection
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/signin" className="navbar-link" onClick={handleLinkClick}>
              Mon compte
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
