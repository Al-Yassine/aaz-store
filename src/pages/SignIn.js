import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './SignIn.css';

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Sign up validation
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      if (formData.password.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }
      
      // In a real app, you would send this to a backend
      showToast('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
      setIsSignUp(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      // Sign in validation
      if (!formData.email || !formData.password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
      }
      
      // In a real app, you would authenticate with a backend
      showToast('Connexion réussie !', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  return (
    <div className="signin-page">
      <div className="container">
        <div className="signin-container">
          <div className="signin-card">
            <h1 className="signin-title">{isSignUp ? 'Créer un compte' : 'Se connecter'}</h1>
            <p className="signin-subtitle">
              {isSignUp 
                ? 'Rejoignez-nous pour profiter de nos offres exclusives'
                : 'Connectez-vous pour accéder à votre compte'
              }
            </p>

            <form className="signin-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Entrez votre nom complet"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Entrez votre email"
                />
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="phone">Téléphone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+227 XX XX XX XX"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
              )}

              <button type="submit" className="signin-btn">
                {isSignUp ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </form>

            <div className="signin-switch">
              <p>
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Vous n\'avez pas de compte ?'}{' '}
                <button
                  type="button"
                  className="switch-link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  {isSignUp ? 'Se connecter' : 'S\'inscrire'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

