import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1 className="contact-hero-title">Contactez-nous</h1>
          <p className="contact-hero-subtitle">
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter !
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          {/* Contact Cards */}
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-card-icon">
                <img src="/Images/Icons/icons8-circled-envelope-48.png" alt="Email" />
              </div>
              <div className="contact-card-content">
                <h3>Email</h3>
                <a href="mailto:aazstore.niam@gmail.com">aazstore.niam@gmail.com</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📞</div>
              <div className="contact-card-content">
                <h3>Téléphone</h3>
                <a href="tel:+22789609497">+227 89 60 94 97</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📍</div>
              <div className="contact-card-content">
                <h3>Adresse</h3>
                <p>2e arrondissement, Soni<br />Niamey, Niger</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">🕒</div>
              <div className="contact-card-content">
                <h3>Heures d'ouverture</h3>
                <p>Lun - Sam: 10h - 00h<br />Dimanche: 14h - 00h</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="contact-map-section">
            <h2 className="contact-map-title">Notre Localisation</h2>
            <div className="contact-map">
              <iframe 
                title="AAZ Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.123456789!2d2.125!3d13.51!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDMwJzM2LjAiTiAywrAwNyczMC4wIkU!5e0!3m2!1sfr!2sne!4v1234567890"
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <a 
              href="https://maps.app.goo.gl/X1DYPaq3GSxpsYrD8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-map-link"
            >
              <span>📍</span> Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
