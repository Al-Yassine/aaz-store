import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
  // Keep filters in URL so they survive navigation and browser Back
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'Tous');
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [activeSearch, setActiveSearch] = useState(() => searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const categories = ['Tous', ...new Set(products.map(product => product.category))];
  
  const productsByCategory = useMemo(() => {
    if (selectedCategory === 'Tous') return products;
    return products.filter(product => product.category === selectedCategory);
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!activeSearch.trim()) return productsByCategory;
    const term = activeSearch.trim().toLowerCase();
    return productsByCategory.filter(p => p.name.toLowerCase().includes(term));
  }, [productsByCategory, activeSearch]);

  const suggestions = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return [];
    const names = productsByCategory
      .filter(p => p.name.toLowerCase().includes(term))
      .map(p => p.name);
    return Array.from(new Set(names)).slice(0, 8);
  }, [productsByCategory, searchInput]);

  useEffect(() => {
    const cat = searchParams.get('category') || 'Tous';
    if (cat !== selectedCategory) setSelectedCategory(cat);
    const q = searchParams.get('q') || '';
    if (q !== activeSearch) {
      setActiveSearch(q);
      setSearchInput(q);
    }
  }, [searchParams, selectedCategory, activeSearch]);

  const applyCategory = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'Tous') newParams.set('category', category);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  // Update URL search params and local state for category/search so Back preserves them
  const applySearch = (value) => {
    const q = value && value.trim() ? value.trim() : '';
    setActiveSearch(q);
    setSearchInput(q);
    const newParams = new URLSearchParams(searchParams);
    if (q) newParams.set('q', q);
    else newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      applySearch(searchInput);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    applySearch(name);
    setShowSuggestions(false);
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Nos Produits</h1>
          <p className="page-subtitle">
            Découvrez notre large gamme de produits de haute qualité
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden>🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher des produits par nom..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search products"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-dropdown" role="listbox">
                {suggestions.map(name => (
                  <li
                    key={name}
                    className="suggestion-item"
                    role="option"
                    aria-selected={searchInput === name}
                    onMouseDown={() => handleSuggestionClick(name)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="category-filter">
          <h3>Filtrer par Catégorie :</h3>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => applyCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>Aucun produit trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>

        <div className="results-info">
          <p>
            Affichage de {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'Tous' && ` dans ${selectedCategory}`}
            {activeSearch && ` pour "${activeSearch}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Products;
