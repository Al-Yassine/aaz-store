import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { signIn } from '../services/authService';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && currentUser && isAdmin) {
      navigate('/admin');
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      showToast('Connexion réussie ! Vérification des droits admin...', 'success');
      // Navigation will happen automatically via useEffect when isAdmin is updated
    } else {
      showToast(result.error || 'Erreur lors de la connexion', 'error');
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

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
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
