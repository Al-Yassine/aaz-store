import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { menuCategories } from '../data/categories';
import { logOut } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'articles' or 'chaussures' or 'tshirts'
  const [viewStack, setViewStack] = useState(['main']); // Track navigation history
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (currentView !== 'main') {
          goBack();
        } else {
          setIsOpen(false);
        }
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
  }, [isOpen, currentView]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
    setCurrentView('main');
    setViewStack(['main']);
  };

  // Navigate to a new view (slide from right)
  const navigateToView = (view) => {
    setViewStack(prev => [...prev, view]);
    setCurrentView(view);
  };

  // Go back to previous view
  const goBack = () => {
    if (viewStack.length > 1) {
      const newStack = [...viewStack];
      newStack.pop();
      const previousView = newStack[newStack.length - 1];
      setViewStack(newStack);
      setCurrentView(previousView);
    }
  };

  // Handle category/subcategory click - navigates to products page with filter
  // eslint-disable-next-line no-unused-vars
  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If it's expandable, navigate to that view
    if (category.isExpandable) {
      navigateToView(category.id);
      return;
    }
    
    // Close menu
    setIsOpen(false);
    setCurrentView('main');
    setViewStack(['main']);
    
    // Build URL params for filtering
    const params = new URLSearchParams();
    
    if (category.filterValue) {
      params.set('category', category.filterValue);
      
      // If there's a sub-filter, add it
      if (category.subFilter) {
        params.set('subcategory', category.subFilter);
      }
    }
    
    // Navigate to products page with filters
    const queryString = params.toString();
    navigate(`/products${queryString ? '?' + queryString : ''}`);
  };

  // Handle "All Categories" click - resets filter
  const handleAllCategoriesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsOpen(false);
    setCurrentView('main');
    setViewStack(['main']);
    navigate('/products');
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      setShowUserMenu(false);
      navigate('/');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

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
          {/* Main Menu View */}
          <div className={`menu-view ${currentView === 'main' ? 'active' : ''}`}>
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={handleLinkClick}>
                Accueil
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/nouvelle-collection" className="navbar-link navbar-link-featured" onClick={handleLinkClick}>
                Nouvelle collection
              </Link>
            </li>
            
            {/* Articles - navigates to submenu */}
            <li className="navbar-item">
              <a 
                href="#" 
                className="navbar-link navbar-link-parent"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToView('articles');
                }}
              >
                <span className="nav-arrow">‹</span>
                Articles
              </a>
            </li>
            
            <li className="navbar-item">
              {currentUser ? (
                <div className="user-menu-container">
                  <button 
                    className="navbar-link user-menu-toggle"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'Mon compte'}
                    <span className="user-menu-arrow">▼</span>
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown-menu">
                      <div className="user-email">{currentUser.email}</div>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="dropdown-item admin-link"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLinkClick();
                          }}
                        >
                          👑 Tableau de bord Admin
                        </Link>
                      )}
                      <button 
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        🚪 Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/signin" className="navbar-link" onClick={handleLinkClick}>
                  Mon compte
                </Link>
              )}
            </li>
            <li className="navbar-item">
              <Link to="/contact" className="navbar-link" onClick={handleLinkClick}>
                Contact
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/about" className="navbar-link" onClick={handleLinkClick}>
                À propos
              </Link>
            </li>
          </div>
          
          {/* Articles Submenu View */}
          <div className={`menu-view ${currentView === 'articles' ? 'active' : ''}`}>
            <li className="navbar-item navbar-item-back">
              <a 
                href="#" 
                className="navbar-link"
                onClick={(e) => {
                  e.preventDefault();
                  goBack();
                }}
              >
                Retour<span className="back-arrow">›</span>
              </a>
            </li>
            <li className="navbar-item navbar-item-title">
              <span className="navbar-link navbar-link-title">Articles</span>
            </li>
            
            {/* All Categories */}
            <li className="navbar-item">
              <Link 
                to="/products" 
                className="navbar-link navbar-link-sub"
                onClick={handleAllCategoriesClick}
              >
                All Categories
              </Link>
            </li>
            
            {/* Root categories from data */}
            {menuCategories.filter(cat => cat.id !== 'all').map(category => (
              <React.Fragment key={category.id}>
                {category.isExpandable ? (
                  <li className="navbar-item">
                    <a
                      href="#"
                      className="navbar-link navbar-link-parent"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToView(category.id);
                      }}
                    >
                      <span className="nav-arrow">‹</span>
                      {category.name}
                    </a>
                  </li>
                ) : (
                  <li className="navbar-item">
                    <Link
                      to={`/products?category=${category.filterValue}`}
                      className="navbar-link navbar-link-sub"
                      onClick={(e) => {
                        setIsOpen(false);
                        setCurrentView('main');
                        setViewStack(['main']);
                        window.dispatchEvent(new CustomEvent('categoryChange', { 
                          detail: { category: category.filterValue } 
                        }));
                      }}
                    >
                      {category.name}
                    </Link>
                  </li>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Category Submenu Views (Chaussures, T-shirts, etc.) */}
          {menuCategories.filter(cat => cat.id !== 'all' && cat.isExpandable).map(category => (
            <div key={category.id} className={`menu-view ${currentView === category.id ? 'active' : ''}`}>
              <li className="navbar-item navbar-item-back">
                <a 
                  href="#" 
                  className="navbar-link"
                  onClick={(e) => {
                    e.preventDefault();
                    goBack();
                  }}
                >
                  Retour
                  <span className="back-arrow">›</span>
                </a>
              </li>
              <li className="navbar-item navbar-item-title">
                <span className="navbar-link navbar-link-title">{category.name}</span>
              </li>
              
              {category.children && category.children.map(subcategory => (
                <li key={subcategory.id} className="navbar-item">
                  <Link
                    to={`/products?category=${subcategory.filterValue}&subcategory=${subcategory.subFilter}`}
                    className="navbar-link navbar-link-sub"
                    onClick={(e) => {
                      setIsOpen(false);
                      setCurrentView('main');
                      setViewStack(['main']);
                      window.dispatchEvent(new CustomEvent('categoryChange', { 
                        detail: { 
                          category: subcategory.filterValue,
                          subcategory: subcategory.subFilter 
                        } 
                      }));
                    }}
                  >
                    {subcategory.name}
                  </Link>
                </li>
              ))}
            </div>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
