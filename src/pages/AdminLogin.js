import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signIn } from '../services/authService';
import './AdminLogin.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && currentUser && isAdmin) {
      navigate('/admin');
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (location.state?.formSuccess) {
      setSubmitError('');
      setSubmitSuccess(location.state.formSuccess);
    }

    if (location.state?.formError) {
      setSubmitSuccess('');
      setSubmitError(location.state.formError);
    }
  }, [location.state]);

  const validateForm = () => {
    const validationErrors = {};

    if (!email.trim()) {
      validationErrors.email = "L'adresse email est requise";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      validationErrors.email = 'Adresse email invalide';
    }

    if (!password) {
      validationErrors.password = 'Le mot de passe est requis';
    }

    return validationErrors;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
    if (submitSuccess) {
      setSubmitSuccess('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
    if (submitSuccess) {
      setSubmitSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setSubmitError('');
    setSubmitSuccess('');
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    const result = await signIn(email.trim(), password);
    
    if (result.success) {
      setSubmitSuccess('Connexion reussie ! Verification des droits admin...');
      // Navigation will happen automatically via useEffect when isAdmin is updated
    } else {
      const message = result.error || 'Erreur lors de la connexion';
      setSubmitSuccess('');

      if (result.errorCode === 'auth/invalid-email' || result.errorCode === 'auth/user-not-found') {
        setErrors({ email: message });
      } else if (result.errorCode === 'auth/wrong-password' || result.errorCode === 'auth/invalid-credential') {
        setErrors({ password: message });
      } else {
        setSubmitError(message);
      }
    }
    
    setLoading(false);
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Vérification...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">
              <span className="logo-icon">🔐</span>
            </div>
            <h1>Admin Login</h1>
            <p>Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            {submitSuccess && <div className="admin-login-form-success">{submitSuccess}</div>}
            {submitError && <div className="admin-login-form-error">{submitError}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={errors.email ? 'input-error' : ''}
                aria-invalid={!!errors.email}
                placeholder="admin@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="admin-login-field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={errors.password ? 'input-error' : ''}
                aria-invalid={!!errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <span className="admin-login-field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>Accès réservé aux administrateurs</p>
            <a href="/" className="back-to-site">
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
