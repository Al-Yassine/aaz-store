# AAZ Store - Boutique en Ligne

Une boutique en ligne moderne et élégante spécialisée dans les vêtements masculins de luxe, les costumes sur mesure et les accessoires de mode.

## 🚀 Fonctionnalités

- **Interface Moderne**: Design épuré et responsive avec animations fluides
- **Catalogue Produits**: Navigation par catégories avec filtres et recherche
- **Panier d'Achat**: Ajout/suppression d'articles, gestion des quantités, calcul des totaux
- **Pages Multiples**: Accueil, Produits, Panier, À Propos, Commande
- **Design Responsive**: Expérience optimale sur ordinateur, tablette et mobile
- **Gestion d'État**: Context API pour la fonctionnalité du panier
- **Routage Client**: React Router pour la navigation entre pages

## 🛠️ Stack Technique

- **React 18** avec composants fonctionnels et hooks
- **React Router v6** pour la navigation
- **Context API** pour la gestion d'état
- **CSS3** moderne (Grid, Flexbox, animations)
- **Google Fonts** (Playfair Display, Roboto)

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.js       # Barre de navigation avec icône panier
│   ├── Footer.js       # Pied de page avec informations
│   ├── ProductCard.js  # Carte d'affichage produit
│   ├── CartItem.js     # Composant article panier
│   ├── PhotoSlider.js  # Galerie d'images avec navigation
│   └── ProductReviews.js # Système d'avis clients
├── pages/              # Composants de pages
│   ├── Home.js         # Page d'accueil avec hero et produits vedettes
│   ├── Products.js     # Liste de produits avec filtres
│   ├── ProductDetail.js # Détail produit avec sélection taille
│   ├── Cart.js         # Page panier d'achat
│   ├── Checkout.js     # Page de commande
│   └── About.js        # Page à propos et contact
├── context/            # Providers de contexte
│   └── CartContext.js  # Gestion d'état du panier
├── data/               # Données
│   └── products.js     # Données produits
├── utils/              # Utilitaires
│   ├── formatPrice.js  # Formatage des prix
│   └── getSizesByCategory.js # Gestion des tailles
└── App.js             # Composant principal
```

## 🚀 Installation et Démarrage

1. **Installer les Dépendances**
   ```bash
   npm install
   ```

2. **Démarrer le Serveur de Développement**
   ```bash
   npm start
   ```

3. **Ouvrir dans le Navigateur**
   Accéder à `http://localhost:3000`

## 📱 Pages

### Page d'Accueil
- Section hero avec appel à l'action
- Grille de produits vedettes
- Présentation des fonctionnalités

### Page Produits
- Tous les produits dans une grille responsive
- Filtrage par catégorie
- Barre de recherche avec suggestions
- Compteur de résultats

### Page Panier
- Gestion du panier avec contrôles de quantité
- Résumé de commande avec totaux
- Processus de commande simulé

### Page Détail Produit
- Galerie d'images interactive
- Sélection de taille
- Boutons "Ajouter au Panier" et "Acheter Maintenant"
- Avis clients
- Produits similaires

### Page Commande
- Formulaire d'informations de livraison
- Calcul des frais de livraison selon la ville
- Options de paiement (Paiement à la livraison / NITA)
- Récapitulatif de commande

### Page À Propos
- Information sur la boutique
- Formulaire de contact
- Statistiques de l'entreprise

## 🎨 Fonctionnalités du Design

- **Thème Élégant**: Couleurs noir et or pour un look haut de gamme
- **Mise en Page par Cartes**: Cartes blanches épurées avec ombres
- **Effets au Survol**: Transitions et animations fluides
- **Mobile-First**: Design responsive sur tous les appareils
- **Accessibilité**: États de focus appropriés et HTML sémantique

## 🛒 Fonctionnalité Panier

- Ajouter des produits au panier depuis les pages produits
- Mettre à jour les quantités d'articles
- Supprimer des articles du panier
- Calcul du total en temps réel
- Gestion des articles avec taille et couleur
- Processus de commande
- Gestion de l'état panier vide

## 📦 Déploiement

### Vercel (Recommandé)
1. Connecter votre dépôt GitHub à Vercel
2. Vercel détectera automatiquement Create React App
3. Déployer avec les paramètres par défaut

### Build Manuel
```bash
npm run build
```
Cela créera un dossier `build` optimisé pour la production.

## 🌐 Configuration Vercel

Le fichier `vercel.json` est déjà configuré pour gérer correctement le routage React Router lors du rafraîchissement de page.

## 📞 Contact

- **Email**: aazstore.niam@gmail.com
- **Téléphone**: +227 89 60 94 97
- **Facebook**: Aaz Store
- **Adresse**: 2e arrondissement, Soni, Niamey

## 📄 Licence

© 2025 Aaz Store. Tous droits réservés.

---

Construit avec ❤️ utilisant React