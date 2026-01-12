import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './About.css';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Merci pour votre message ! Nous vous répondrons très bientôt.', 'success');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

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
              <p>Fondé en 2016, AAZ Store s’impose comme une référence en matière de qualité et d’élégance masculine au Niger.
Chaque vêtement, chaussure et accessoire est soigneusement sélectionné pour offrir style, confort et durabilité.
              </p>
              <p>
              Chez AAZ Store, la qualité n’est pas un choix — c’est notre identité.
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

        <section className="contact-section">
          <div className="contact-content">
            <h2>Contactez-nous</h2>
            <p>Vous avez des questions ou des remarques ? Nous serons ravi de vous lire !</p>
            
            <div className="contact-grid">
              <div className="contact-form-container">
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3>Envoyez-nous un message</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Nom *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Sujet *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    Envoyer un Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
