import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import NewCollection from './pages/NewCollection';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CGU from './pages/CGU';
import Privacy from './pages/Privacy';
import CGV from './pages/CGV';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  useEffect(() => {
    let lastClick = 0;
    let pointerHandled = false;
    const THRESHOLD = 350; // ms

    function smoothScrollTo(hash, e) {
      if (!hash || hash === '#') return false;
      const target = document.querySelector(hash);
      if (!target) return false;
      if (e && e.cancelable) e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      setTimeout(() => target.removeAttribute('tabindex'), 1000);
      return true;
    }

    function handler(e) {
      const el = e.target.closest && e.target.closest('a[href^="#"]');
      if (!el) return;
      const now = Date.now();
      if (now - lastClick < THRESHOLD) {
        if (e && e.cancelable) e.preventDefault();
        return;
      }
      lastClick = now;
      const hash = el.getAttribute('href');
      smoothScrollTo(hash, e);
    }

    function pointerHandler(e) {
      pointerHandled = true;
      handler(e);
      setTimeout(() => (pointerHandled = false), THRESHOLD + 50);
    }

    function clickHandler(e) {
      // Ignore click if pointer/touch already handled it
      if (pointerHandled) return;
      handler(e);
    }

    if (window.PointerEvent) {
      document.addEventListener('pointerdown', pointerHandler, { passive: false });
    } else {
      document.addEventListener('touchstart', pointerHandler, { passive: false });
    }
    document.addEventListener('click', clickHandler, { passive: false });

    return () => {
      if (window.PointerEvent) {
        document.removeEventListener('pointerdown', pointerHandler);
      } else {
        document.removeEventListener('touchstart', pointerHandler);
      }
      document.removeEventListener('click', clickHandler);
    };
  }, []);
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="App">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/nouvelle-collection" element={<NewCollection />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/cgu" element={<CGU />} />
                  <Route path="/confidentialite" element={<Privacy />} />
                  <Route path="/cgv" element={<CGV />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
