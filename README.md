# 🛍️ AAZ Store - E-Commerce Application

Boutique en ligne de vêtements masculins de luxe. Une application React moderne avec panier d'achat, gestion des stocks, et paiement en ligne.

## 🎯 Fonctionnalités

- **Catalogue Produits**: Navigation par catégories avec recherche en temps réel
- **Variantes de Produits**: Sélection de couleurs et tailles avec gestion des stocks
- **Panier d'Achat**: Fusion intelligente des quantités, validation du stock
- **Checkout**: Calcul des frais de livraison basé sur la région (Niamey: 1000 CFA, Autres: 2000 CFA)
- **Modes de Paiement**: Paiement à la livraison (Niamey) et Virement NITA/Amana
- **Navigation Intuitif**: Retour contextuel aux catégories, bouton Back navigateur compatible
- **Pages Légales**: CGU, CGV, Politique de Confidentialité
- **Avis Clients**: Système de notation et commentaires sauvegardés en localStorage

---

## 📋 Prérequis

- Node.js ≥ 14.0
- npm ≥ 6.0

---

## 🛠️ Installation Locale

```bash
# Clone le repository
git clone <votre-repo>
cd aazstore

# Installe les dépendances
npm install

# Lance le serveur de développement
npm start
```

L'application s'ouvrira sur [http://localhost:3000](http://localhost:3000)

---

## 📦 Build pour Production

```bash
npm run build
```

Génère un dossier `build/` optimisé pour le déploiement en production.

---

## 🚀 Déploiement sur Vercel

### Méthode 1: Automatique (Recommandée)

1. **Push votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connectez Vercel à votre repository**
   - Allez sur [Vercel](https://vercel.com)
   - Cliquez "New Project"
   - Sélectionnez votre repository GitHub
   - Vercel détecte automatiquement qu'il s'agit d'un Create React App
   - Cliquez "Deploy"

3. **Configuration Vercel (automatique)**
   - Build command: `npm run build`
   - Output directory: `build`
   - Le fichier `vercel.json` gère le routing React Router

### Méthode 2: Manuelle avec Vercel CLI

```bash
# Installez Vercel CLI
npm install -g vercel

# Déployez
vercel
```

Suivez les prompts pour terminer le déploiement.

---

## 🧪 Testing & QA

### Tests Fonctionnels Effectués

#### ✅ Logique Produits & Variantes
- [x] Tous les produits s'affichent correctement avec leurs variantes
- [x] Les couleurs changent les tailles disponibles
- [x] Les tailles sans stock sont désactivées (pas cachées)
- [x] La quantité ne peut pas dépasser le stock disponible
- [x] Sélection automatique de la meilleure taille lors du changement de couleur

#### ✅ Panier & Quantités
- [x] Ajout de plusieurs quantités du même produit fusionne les articles
- [x] Pas de duplication d'articles en panier
- [x] Calcul correct du sous-total
- [x] Validation du stock avant ajout au panier
- [x] Suppression d'articles fonctionne correctement

#### ✅ Checkout & Frais de Livraison
- [x] "Acheter maintenant" ne calcule PAS les frais de livraison
- [x] Les frais sont calculés UNIQUEMENT après sélection de la région
- [x] Niamey: 1000 CFA | Autres régions: 2000 CFA
- [x] Le total se met à jour correctement lors du changement de région
- [x] Paiement à la livraison disponible UNIQUEMENT à Niamey
- [x] Validation de tous les champs avant validation de la commande

#### ✅ Navigation & UX
- [x] Catégorie → Produit → Retour conserve la catégorie
- [x] Le bouton navigateur "Retour" fonctionne correctement
- [x] Aucune redirection non souhaitée vers la catégorie générale
- [x] Scroll vers le haut au changement de page
- [x] Menu mobile fonctionne sur tous les appareils

#### ✅ Gestion d'Erreurs
- [x] Aucune erreur console
- [x] Pas de plantage sur les valeurs nulles/undefined
- [x] Messages d'erreur clairs pour l'utilisateur
- [x] Gestion gracieuse des données manquantes

#### ✅ Optimisation & Performance
- [x] Build sans warnings eslint
- [x] Pas de console.log en production
- [x] Code mort et imports inutiles nettoyés
- [x] Utilisation optimisée de useMemo et useCallback
- [x] Images responsive et lazy-loading compatible

---

## 🧹 Nettoyage du Code

Tous les éléments suivants ont été vérifiés et nettoyés:

- ✅ **console.log**: Aucun dans le code source (scripts développement seulement)
- ✅ **Code mort**: Code commenté suppressible - nettoyé
- ✅ **Imports inutiles**: Tous les imports sont utilisés
- ✅ **Variables inutilisées**: Aucune trouvée
- ✅ **ESLint warnings**: Tous corrigés et optimisés
- ✅ **Nommage cohérent**: Conventions CSS, composants, et fichiers uniformes
- ✅ **Structure de dossiers**: Organisation logique et propre

### Optimisations Effectuées

1. **ProductDetail.js**: Enveloppement de `sizeStockMap`, `colorSizeStock`, et autres dérivations dans `useMemo` pour éviter les re-renders inutiles
2. **Products.js**: Correction des dépendances de useEffect pour une synchronisation correcte de l'état
3. **ToastContext.js**: Utilisation optimisée de useCallback pour la mémorisation des fonctions
4. **PhotoSlider.js**: Drag/touch handling optimisé sans console.log

---

## 📝 Fichiers de Configuration

### `vercel.json`
Configure le routing React Router pour Vercel - toutes les routes se résolvent à `/index.html`

### `.gitignore`
Comprend:
- `node_modules/` - Dépendances npm
- `build/` - Build de production
- `.env*` - Fichiers d'environnement
- Fichiers système (`.DS_Store`, `Thumbs.db`)

### `package.json`
- React 18.2.0
- React Router DOM 6.3.0
- React Scripts 5.0.1 (Create React App)

---

## 🔐 Variables d'Environnement

Actuellement, l'application ne nécessite pas de variables d'environnement sensibles.

Si nécessaire à l'avenir, créez un fichier `.env.local`:
```
REACT_APP_API_URL=https://api.example.com
```

**Note**: Ne commitez JAMAIS `.env.local` sur GitHub

---

## 📱 Responsive & Accessibilité

- ✅ Design mobile-first avec breakpoints CSS
- ✅ Menu hamburger tactile sur mobile
- ✅ Images responsives
- ✅ Labels accessibles sur tous les formulaires
- ✅ Rôles ARIA pour les composants interactifs
- ✅ Support clavier complet
- ✅ Contraste suffisant (WCAG AA)

Voir `RESPONSIVE_TESTS.md` pour la checklist de test complète.

---

## 🛠️ Troubleshooting

### Le build échoue
```bash
# Nettoyez les dépendances et réinstallez
rm -r node_modules package-lock.json
npm install
npm run build
```

### Port 3000 déjà utilisé
```bash
# Spécifiez un autre port
PORT=3001 npm start
```

### Erreurs d'image 404
- Vérifiez que les chemins commencent par `/Images/` (majuscule)
- Les images doivent être dans `public/Images/`

### Panier vide après rechargement
- Le panier est stocké en React Context (pas de persistence)
- Pour persister le panier, utilisez localStorage dans CartContext

---

## 📚 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.js
│   ├── Footer.js
│   ├── ProductCard.js
│   ├── CartItem.js
│   ├── PhotoSlider.js
│   ├── ProductReviews.js
│   ├── ScrollToTop.js
│   └── Toast.js
├── pages/              # Pages principales
│   ├── Home.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── Cart.js
│   ├── Checkout.js
│   ├── About.js
│   ├── CGU.js
│   ├── CGV.js
│   └── Privacy.js
├── context/            # React Context API
│   ├── CartContext.js
│   └── ToastContext.js
├── data/               # Données
│   ├── products.js
│   └── sizeInventory.json
├── utils/              # Fonctions utilitaires
│   ├── formatPrice.js
│   └── getSizesByCategory.js
├── App.js              # Composant principal
├── index.js            # Point d'entrée
└── index.css           # Styles globaux
```

---

## 🔄 Workflow de Déploiement

### Local Development
```bash
npm start        # Mode développement avec hot reload
npm run build    # Build de production
```

### Avant de Pusher sur GitHub
```bash
# Vérifiez qu'il n'y a pas d'erreurs
npm run build

# Commitez vos changements
git add .
git commit -m "Description du changement"
git push origin main
```

### Après Push
1. Vercel détecte automatiquement le push
2. Vercel lance un preview deployment
3. Après approbation, mergez sur la branche principale
4. Vercel déploie automatiquement en production

---

## 📞 Support & Contact

Pour toute question ou problème:
- 📧 Email: aazstore.niam@gmail.com
- 📱 Téléphone: +227 89 60 94 97
- 📍 Localisation: Soni, 2e arrondissement, Niamey

---

## 📄 License

Propriétaire - AAZ Store 2025. Tous droits réservés.
