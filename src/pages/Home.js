import React from 'react';
import BrandShowcase from '../components/BrandShowcase';
import './Home.css';

const Home = () => {
  const heroImage = '/Images/home-photo/10111398.jpg';

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }}>
        </div>
      </section>

      <BrandShowcase />

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
              <p>Retours acceptés dans les 3 jours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
