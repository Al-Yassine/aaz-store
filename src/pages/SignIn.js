import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp, signIn, resetPassword, resendVerificationEmail } from '../services/authService';
import './SignIn.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{8,}$/;
const RESEND_COOLDOWN_SECONDS = 30;

const mapAuthErrorToUi = (errorCode, fallbackMessage) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
    case 'auth/invalid-email':
    case 'auth/user-not-found':
      return { email: fallbackMessage };
    case 'auth/wrong-password':
    case 'auth/weak-password':
    case 'auth/invalid-credential':
      return { password: fallbackMessage };
    case 'auth/email-not-verified':
      return { form: fallbackMessage };
    default:
      return { form: fallbackMessage || 'Une erreur est survenue. Veuillez reessayer.' };
  }
};

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
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    useEffect(() => {
      if (resendCooldown <= 0) {
        return;
      }

      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }, [resendCooldown]);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const redirectAfterSignIn =
    typeof location.state?.redirectTo === 'string' && location.state.redirectTo
      ? location.state.redirectTo
      : '/';
  const redirectState =
    location.state?.redirectState && typeof location.state.redirectState === 'object'
      ? location.state.redirectState
      : undefined;

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

  useEffect(() => {
    if (currentUser && !loading && !resendLoading) {
      navigate(redirectAfterSignIn, { replace: true, state: redirectState });
    }
  }, [currentUser, loading, resendLoading, navigate, redirectAfterSignIn, redirectState]);

  // Redirect if already logged in
  if (currentUser && !loading && !resendLoading) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (submitError) {
      setSubmitError('');
    }

    if (submitSuccess) {
      setSubmitSuccess('');
    }

  };

  const validateSignUp = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      validationErrors.email = "L'adresse email est requise";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      validationErrors.email = 'Adresse email invalide';
    }

    if (!formData.phone.trim()) {
      validationErrors.phone = 'Le numero de telephone est requis';
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      validationErrors.phone = 'Numero de telephone invalide';
    }

    if (!formData.password) {
      validationErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Le mot de passe doit contenir au moins 6 caracteres';
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return validationErrors;
  };

  const validateSignIn = () => {
    const validationErrors = {};

    if (!formData.email.trim()) {
      validationErrors.email = "L'adresse email est requise";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      validationErrors.email = 'Adresse email invalide';
    }

    if (!formData.password) {
      validationErrors.password = 'Le mot de passe est requis';
    }

    return validationErrors;
  };

  const validateForgotPassword = () => {
    const validationErrors = {};

    if (!formData.email.trim()) {
      validationErrors.email = "L'adresse email est requise";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      validationErrors.email = 'Adresse email invalide';
    }

    return validationErrors;
  };

  const applyBackendError = (result, fallbackMessage) => {
    const mapped = mapAuthErrorToUi(result.errorCode, result.error || fallbackMessage);
    const nextFieldErrors = {};

    if (mapped.email) nextFieldErrors.email = mapped.email;
    if (mapped.password) nextFieldErrors.password = mapped.password;
    if (mapped.name) nextFieldErrors.name = mapped.name;
    if (mapped.phone) nextFieldErrors.phone = mapped.phone;

    setErrors(nextFieldErrors);
    setSubmitSuccess('');
    setSubmitError(mapped.form || (Object.keys(nextFieldErrors).length === 0 ? (result.error || fallbackMessage) : ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = isSignUp ? validateSignUp() : validateSignIn();
    setErrors(validationErrors);
    setSubmitError('');
    setSubmitSuccess('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    
    if (isSignUp) {
      const submittedEmail = formData.email.trim();

      // Sign up with Firebase
      const result = await signUp(submittedEmail, formData.password, {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });
      
      if (result.success) {
        if (result.verificationEmailSent) {
          setSubmitSuccess('Inscription reussie ! Un email de confirmation a ete envoye. Verifiez votre boite de reception.');
        } else {
          setSubmitSuccess('Inscription reussie, mais email de confirmation non envoye pour le moment.');
        }

        setIsSignUp(false);
        setShowForgotPassword(false);
        setErrors({});
        setSubmitError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setCanResendVerification(false);
        setResendCooldown(0);
        setFormData((prev) => ({
          ...prev,
          name: '',
          phone: '',
          password: '',
          confirmPassword: '',
          email: submittedEmail
        }));
      } else {
        applyBackendError(result, 'Erreur lors de l\'inscription');
      }
    } else {
      // Sign in with Firebase
      const result = await signIn(formData.email.trim(), formData.password);
      
      if (result.success) {
        setCanResendVerification(false);
        setResendCooldown(0);
        setSubmitError('');
        setSubmitSuccess('Connexion reussie ! Redirection...');
        setTimeout(() => {
          navigate(redirectAfterSignIn, { replace: true, state: redirectState });
        }, 1000);
      } else {
        setCanResendVerification(result.errorCode === 'auth/email-not-verified');
        applyBackendError(result, 'Erreur lors de la connexion');
      }
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const validationErrors = validateForgotPassword();
    setErrors(validationErrors);
    setSubmitError('');
    setSubmitSuccess('');
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(formData.email.trim());
    setLoading(false);
    
    if (result.success) {
      setCanResendVerification(false);
      setResendCooldown(0);
      setSubmitError('');
      setSubmitSuccess('Email de reinitialisation envoye. Verifiez votre boite de reception.');
    } else {
      applyBackendError(result, 'Erreur lors de l\'envoi de l\'email');
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
    setErrors({});
    setSubmitError('');
    setSubmitSuccess('');
    setCanResendVerification(false);
    setResendCooldown(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendLoading || loading) {
      return;
    }

    const email = formData.email.trim();
    const password = formData.password;
    const validationErrors = {};

    if (!email) {
      validationErrors.email = "L'adresse email est requise";
    } else if (!EMAIL_REGEX.test(email)) {
      validationErrors.email = 'Adresse email invalide';
    }

    if (!password) {
      validationErrors.password = 'Le mot de passe est requis pour renvoyer la confirmation';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    setResendLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    const result = await resendVerificationEmail(email, password);

    if (result.success) {
      setCanResendVerification(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSubmitError('');
      setSubmitSuccess('Email de confirmation renvoye. Verifiez votre boite de reception.');
    } else if (result.errorCode === 'auth/email-already-verified') {
      setCanResendVerification(false);
      setResendCooldown(0);
      setSubmitError('');
      setSubmitSuccess(result.error || 'Votre email est deja confirme. Vous pouvez vous connecter.');
    } else {
      setCanResendVerification(result.errorCode === 'auth/email-not-verified');
      applyBackendError(result, 'Impossible de renvoyer l\'email de confirmation');
    }

    setResendLoading(false);
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

              <form className="signin-form" onSubmit={handleForgotPassword} noValidate>
                {submitSuccess && <div className="signin-form-success">{submitSuccess}</div>}
                {submitError && <div className="signin-form-error">{submitError}</div>}

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'input-error' : ''}
                    aria-invalid={!!errors.email}
                    placeholder="Entrez votre email"
                  />
                  {errors.email && <span className="signin-field-error">{errors.email}</span>}
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

            <form className="signin-form" onSubmit={handleSubmit} noValidate>
              {submitSuccess && <div className="signin-form-success">{submitSuccess}</div>}
              {submitError && <div className="signin-form-error">{submitError}</div>}

              {!isSignUp && canResendVerification && (
                <div className="verification-actions">
                  <button
                    type="button"
                    className="resend-verification-btn"
                    onClick={handleResendVerification}
                    disabled={resendLoading || loading || resendCooldown > 0}
                  >
                    {resendLoading
                      ? 'Envoi en cours...'
                      : resendCooldown > 0
                        ? `Renvoyer dans ${resendCooldown}s`
                        : 'Renvoyer email de confirmation'}
                  </button>
                </div>
              )}

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'input-error' : ''}
                    aria-invalid={!!errors.name}
                    placeholder="Entrez votre nom complet"
                  />
                  {errors.name && <span className="signin-field-error">{errors.name}</span>}
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
                  className={errors.email ? 'input-error' : ''}
                  aria-invalid={!!errors.email}
                  placeholder="Entrez votre email"
                />
                {errors.email && <span className="signin-field-error">{errors.email}</span>}
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
                    className={errors.phone ? 'input-error' : ''}
                    aria-invalid={!!errors.phone}
                    placeholder="+227 XX XX XX XX"
                  />
                  {errors.phone && <span className="signin-field-error">{errors.phone}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'input-error' : ''}
                    aria-invalid={!!errors.password}
                    placeholder="Entrez votre mot de passe"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                {errors.password && <span className="signin-field-error">{errors.password}</span>}
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? 'input-error' : ''}
                      aria-invalid={!!errors.confirmPassword}
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}
                    >
                      {showConfirmPassword ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="signin-field-error">{errors.confirmPassword}</span>}
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
                  onClick={() => {
                    setErrors({});
                    setSubmitError('');
                    setSubmitSuccess('');
                    setCanResendVerification(false);
                    setShowForgotPassword(true);
                  }}
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
