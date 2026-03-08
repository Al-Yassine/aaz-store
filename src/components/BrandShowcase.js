import React from 'react';
import { Link } from 'react-router-dom';
import './BrandShowcase.css';

const COSTUME_IMG = '/Images/home-photo/three%20images/costume.webp';
const CHEMISE_IMG = '/Images/home-photo/three%20images/chemise.webp';
const SOULIER_IMG = '/Images/home-photo/three%20images/soulier.webp';

const BrandShowcase = () => {
  const handleShowcaseCtaClick = () => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlBehavior = html.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    window.setTimeout(() => {
      html.style.scrollBehavior = previousHtmlBehavior;
      body.style.scrollBehavior = previousBodyBehavior;
    }, 180);
  };

  return (
    <section className="brand-showcase">
      <div className="brand-showcase__inner">
        
        {/* ── Transition statement (visual pause under Hero) ── */}
        <div className="brand-transition" aria-hidden="true">
          Une vision complète du style masculin.
        </div>


        {/* ── Block 1: Costume — text left / image right ── */}
        <div className="showcase-block showcase-block--text-left">
          <div className="showcase-text">
            <h2 className="showcase-heading">
              Le costume comme il doit être.
            </h2>
            <p className="showcase-subtext">
              Net.&nbsp;&nbsp;Structuré.&nbsp;&nbsp;Maîtrisé.
            </p>
          </div>
          <div className="showcase-media">
            <img
              src={COSTUME_IMG}
              alt="Costume homme — élégance structurée"
              className="showcase-img"
            />
          </div>
        </div>

        <div className="showcase-divider" aria-hidden="true" />

        {/* ── Block 2: Chemise — image left / text right ── */}
        <div className="showcase-block showcase-block--text-right">
          <div className="showcase-media">
            <img
              src={CHEMISE_IMG}
              alt="Chemise homme ajustée avec précision"
              className="showcase-img"
            />
          </div>
          <div className="showcase-text">
            <h2 className="showcase-heading">
              L'essentiel du vestiaire masculin.
            </h2>
            <p className="showcase-subtext">
              Des chemises ajustées avec précision.&nbsp;&nbsp;Sans compromis.
            </p>
          </div>
        </div>

        <div className="showcase-divider" aria-hidden="true" />

        {/* ── Block 3: Souliers — centred portrait ── */}
        <div className="showcase-block showcase-block--centered">
          <div className="showcase-portrait">
            <img
              src={SOULIER_IMG}
              alt="Souliers en cuir pleine qualité"
              className="showcase-img showcase-img--portrait"
            />
          </div>
          <div className="showcase-text showcase-text--centered">
            <h2 className="showcase-heading">
              Des souliers en cuir pleine qualité
            </h2>
          </div>
        </div>

        {/* ── Closing brand statement (above CTA) ── */}
        <div className="brand-closing">
          Des pièces essentielles, réunies avec exigence.
        </div>

        {/* ── Global CTA ── */}
        <div className="showcase-cta">
          <Link to="/products" className="showcase-btn" onClick={handleShowcaseCtaClick}>
            Découvrir la sélection
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BrandShowcase;
