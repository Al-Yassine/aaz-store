import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setOverflowOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/Images/logo/aazstore-logo.png" 
            alt="AAZ Store Logo" 
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">AAZ Store</span>
        </Link>
        <button className="navbar-toggle" aria-label="Toggle navigation" aria-expanded={isOpen} aria-controls="navbar-menu" onClick={() => setIsOpen(!isOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <ul id="navbar-menu" className={`navbar-menu ${isOpen ? 'open' : ''}`} role="menu" onClick={() => setIsOpen(false)}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              Accueil
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="navbar-link">
              Produits
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">
              À Propos
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cart" className="navbar-link cart-link">
              <span className="cart-icon">🛒</span>
              <span className="cart-count">{getTotalItems()}</span>
            </Link>
          </li>
        </ul>
        <div className="navbar-overflow-wrap" ref={overflowRef}>
          <button
            className="navbar-overflow"
            aria-label="More options"
            aria-expanded={overflowOpen}
            onClick={(e) => {
              e.stopPropagation();
              setOverflowOpen(!overflowOpen);
            }}
          >
            <span className="overflow-dot"></span>
            <span className="overflow-dot"></span>
            <span className="overflow-dot"></span>
          </button>
          <div className={`overflow-menu ${overflowOpen ? 'open' : ''}`} role="menu">
            <Link to="/cgu" className="overflow-link" onClick={() => setOverflowOpen(false)}>CGU</Link>
            <Link to="/cgv" className="overflow-link" onClick={() => setOverflowOpen(false)}>CGV</Link>
            <Link to="/confidentialite" className="overflow-link" onClick={() => setOverflowOpen(false)}>Confidentialité</Link>
            <Link to="/confidentialite" className="overflow-link" onClick={() => setOverflowOpen(false)}>Legal</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
