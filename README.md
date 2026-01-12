# AAZ Store

Boutique en ligne de vêtements masculins de luxe.

## 🚀 Déploiement

Ce projet est configuré pour être déployé sur Vercel.

### Déploiement automatique

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement qu'il s'agit d'un projet Create React App
3. Les déploiements se feront automatiquement à chaque push sur la branche principale

### Configuration Vercel

Le fichier `vercel.json` est déjà configuré pour gérer le routing React Router correctement.

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Build

```bash
npm run build
```

Crée une version optimisée pour la production dans le dossier `build/`.

## 📝 Technologies

- React 18.2.0
- React Router DOM 6.3.0
- React Scripts 5.0.1

## � Responsive & Accessibility

- Mobile-first design implemented via global CSS variables and responsive rules.
- Ensured no horizontal scrolling on supported pages (global overflow-x handling).
- Navigation supports a touch-friendly hamburger menu on mobile (`src/components/Navbar.js`).
- Product grids adapt to 1 column on small screens and expand on larger screens (`src/pages/Products.css`).
- Images and media elements are responsive (`img, picture, video` global rules).
- Buttons and form controls meet minimum touch target sizes.
- See `RESPONSIVE_TESTS.md` for a short QA checklist and recommended viewports.

## �📄 License

Propriétaire - AAZ Store