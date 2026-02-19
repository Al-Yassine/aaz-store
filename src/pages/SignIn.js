import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { signUp, signIn, resetPassword } from '../services/authService';
import './SignIn.css';

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      // Sign up validation
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        showToast('Veuillez remplir tous les champs', 'error');
        setLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        setLoading(false);
        return;
      }
      
      // Sign up with Firebase
      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone
      });
      
      if (result.success) {
        showToast('Inscription réussie ! Vous êtes maintenant connecté.', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        showToast(result.error || 'Erreur lors de l\'inscription', 'error');
      }
    } else {
      // Sign in validation
      if (!formData.email || !formData.password) {
        showToast('Veuillez remplir tous les champs', 'error');
        setLoading(false);
        return;
      }
      
      // Sign in with Firebase
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        showToast('Connexion réussie !', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        showToast(result.error || 'Erreur lors de la connexion', 'error');
      }
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      showToast('Veuillez entrer votre adresse email', 'error');
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(formData.email);
    setLoading(false);
    
    if (result.success) {
      showToast('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.', 'success');
      setShowForgotPassword(false);
    } else {
      showToast(result.error || 'Erreur lors de l\'envoi de l\'email', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="signin-page">
        <div className="container">
          <div className="signin-container">
            <div className="signin-card">
              <h1 className="signin-title">Mot de passe oublié</h1>
              <p className="signin-subtitle">
                Entrez votre adresse email pour recevoir un lien de réinitialisation
              </p>

              <form className="signin-form" onSubmit={handleForgotPassword}>
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

                <button type="submit" className="signin-btn" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <div className="signin-switch">
                <p>
                  <button
                    type="button"
                    className="switch-link"
                    onClick={() => {
                      setShowForgotPassword(false);
                      resetForm();
                    }}
                  >
                    Retour à la connexion
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading 
                  ? (isSignUp ? 'Inscription...' : 'Connexion...') 
                  : (isSignUp ? 'S\'inscrire' : 'Se connecter')
                }
              </button>
            </form>

            {!isSignUp && (
              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <div className="signin-switch">
              <p>
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Vous n\'avez pas de compte ?'}{' '}
                <button
                  type="button"
                  className="switch-link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    resetForm();
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
