import React, { useMemo, useState } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './NewCollection.css';

const NewCollection = () => {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter products that are marked as new
  const newProducts = useMemo(() => {
    return products.filter(product => product.isNew === true);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeSearch.trim()) return newProducts;
    const term = activeSearch.trim().toLowerCase();
    return newProducts.filter(p => p.name.toLowerCase().includes(term));
  }, [newProducts, activeSearch]);

  const suggestions = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return [];
    const names = newProducts
      .filter(p => p.name.toLowerCase().includes(term))
      .map(p => p.name);
    return Array.from(new Set(names)).slice(0, 8);
  }, [newProducts, searchInput]);

  const applySearch = (value) => {
    const q = value && value.trim() ? value.trim() : '';
    setActiveSearch(q);
    setSearchInput(q);
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
    <div className="new-collection-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Nouvelle Collection</h1>
          <p className="page-subtitle">
            Découvrez nos dernières nouveautés et tendances
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden>🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher dans la nouvelle collection..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search new collection products"
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

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>Aucun produit trouvé dans la nouvelle collection{activeSearch && ` pour "${activeSearch}"`}.</p>
            </div>
          )}
        </div>

        <div className="results-info">
          <p>
            Affichage de {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} dans la nouvelle collection
            {activeSearch && ` pour "${activeSearch}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewCollection;


