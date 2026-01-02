import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const featuredProducts = products.slice(0, 6);

  const heroImage = '/Images/home-photo/10111398.jpg';

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">Élevez Votre Style</h1>
              <p className="hero-subtitle">
              Élevez votre style avec notre collection de  vêtements, chaussures et accessoires pour hommes.
              </p>
              <Link to="/products" className="btn btn-cta">
                Découvrir la Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Collection Vedette</h2>
          <p className="section-subtitle">
            Découvrez nos pièces les plus recherchées
          </p>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/products" className="btn btn-outline">
              Voir Tous les Produits
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>Livraison Express Gratuite</h3>
              <p>Livraison gratuite sur les commandes de plus de 200 000 FCFA</p>
            </div>
            <div className="feature">
              <div className="feature-icon">👔</div>
              <h3>Styliste Personnel</h3>
              <p>Conseils d'experts en style et consultations de garde-robe</p>
            </div>
            <div className="feature">
              <div className="feature-icon">↩️</div>
              <h3>Politique de Retour</h3>
              <p>10 jours pour retourner le produit dans sa forme originale sans utilisation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
