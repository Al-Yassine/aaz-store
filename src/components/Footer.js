import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Aaz Store</h3>
            <p>AAZ Store, c’est plus qu’une boutique : c’est une équipe qui vous accompagne. Nous choisissons des vêtements pensés pour vous, pour chaque moment important.</p>
          </div>
          
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <ul>
              <li><a href="/home">Accueil</a></li>
              <li><a href="/products">Produits</a></li>
              <li><a href="/about">À Propos</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Informations de Contact</h4>

            {/* Required order: Facebook, Gmail, Phone */}
            <p>
              <a
                className="footer-link footer-contact-link"
                href="https://www.facebook.com/profile.php?id=61578674071971"
                target="_blank"
                rel="noreferrer"
                aria-label="Page Facebook Aaz Store"
              >
                <span
                  className="footer-contact-icon footer-contact-icon--facebook"
                  aria-hidden="true"
                >
                  f
                </span>{' '}
                Aaz Store
              </a>
            </p>

            <p>
              <a
                className="footer-link footer-contact-link"
                href="mailto:aazstore.niam@gmail.com"
                aria-label="Envoyer un email à Aaz Store"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  📧
                </span>{' '}
                aazstore.niam@gmail.com
              </a>
            </p>

            <p>
              <a
                className="footer-link footer-contact-link"
                href="tel:+22789609497"
                aria-label="Appeler Aaz Store"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  📞
                </span>{' '}
                +227 89 60 94 97
              </a>
            </p>

            <p>
              <span className="footer-contact-icon" aria-hidden="true">
                📍
              </span>{' '}
              2e arrondissement, Soni, Niamey
            </p>
            <p>
              <span className="footer-contact-icon" aria-hidden="true">
                🕒
              </span>{' '}
              Lun-Sam: 10h-00h, Dim: 14h-00h
            </p>
          </div>
        </div>
        
        <div className="footer-legal">
          <ul className="footer-legal-list">
            <li><Link to="/cgu">Conditions Générales d'Utilisation</Link></li>
            <li><Link to="/confidentialite">Politique de Confidentialité</Link></li>
            <li><Link to="/cgv">Conditions Générales de Vente</Link></li>
          </ul>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Aaz Store. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
