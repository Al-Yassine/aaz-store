import React from 'react';
import './About.css';

const About = () => {
  

  return (
    <div className="about-page">
      <div className="container">
        <section className="about-section">
          <div className="about-content">
            <h1 className="page-title">À propos de AAZ Store</h1>
            <p className="page-subtitle">
              Votre partenaire de confiance pour vos achats.
            </p>
            
            <div className="about-text">
              <p>
Fondé en 2016, AAZ Store s’impose comme une référence de qualité et d’élégance masculine au Niger.
Chaque vêtement, chaque chaussure et chaque accessoire est sélectionné avec rigueur pour allier style, confort et durabilité.

Chez AAZ Store, la qualité n’est pas un choix — c’est une évidence.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat">
                <h3>10,000+</h3>
                <p>Client Satisfaits</p>
              </div>
              <div className="stat">
                <h3>500+</h3>
                <p>Produits</p>
              </div>
              <div className="stat">
                <h3>24/7</h3>
                <p>Service Client</p>
              </div>
            </div>
          </div>
        </section>

        {/* contact form moved to Contact page */}
      </div>
    </div>
  );
};

export default About;
