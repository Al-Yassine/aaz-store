# Store Customization Guide

## 🏪 Store Information
Update these files with your store details:

### 1. Navbar (src/components/Navbar.js)
- Line 14: Store name in header

### 2. Footer (src/components/Footer.js)
- Line 10: Store name
- Line 11: Store description
- Line 36: Email address
- Line 37: Phone number
- Line 38: Physical address
- Line 39: Store hours
- Line 44: Copyright notice

### 3. HTML Title (public/index.html)
- Line 15: Browser tab title
- Lines 9-10: Meta description for SEO

## 📸 Product Customization

### Add Your Products (src/data/products.js)
Replace the existing products with your inventory:

```javascript
{
  id: 1,
  name: "Your Product Name",
  price: 899.99,
  image: "https://your-image-url.com/product.jpg",
  category: "Suits", // or "Shirts", "Shoes", "Accessories", etc.
  description: "Your detailed product description"
}
```

### Product Categories Available:
- **Costumes** (9 produits) - ✅ Personnalisé
- **Chemises** (3 produits) - 🆕 Nouveau
- **Pantalons** (3 produits) - 🆕 Nouveau  
- **Vestes** (3 produits) - 🆕 Nouveau
- **Chaussures** (3 produits) - 🆕 Nouveau
- **Accessoires** (3 produits) - 🆕 Nouveau
- **Sous-vêtements** (3 produits) - 🆕 Nouveau
- **Blazers** (1 produit) - Existant

## 🖼️ Image Guidelines

### Hero Image (src/pages/Home.css)
- Update line 16 with your hero image URL
- Recommended size: 1920x1080px or larger
- Should show professional Black man in suit

### Product Images
- Recommended size: 400x400px minimum
- Use high-quality, professional photos
- Ensure good lighting and clean backgrounds

## 🎨 Brand Colors
Current brand colors in the design:
- Primary: Black (#000000)
- Accent: Gold (#FFD700)
- Background: Light Gray (#F7F7F7)
- Text: Dark Gray (#666666)

## 📱 Contact Information Template
Replace with your actual details:
- Email: yourstore@email.com
- Phone: +1 (XXX) XXX-XXXX
- Address: Your Street Address, City, State ZIP
- Hours: Your Business Hours

## 🆕 Nouvelles Catégories à Personnaliser

### Structure des Images
Créez ces dossiers dans `public/images/`:
```
public/images/
├── costumes/          (✅ Déjà configuré)
├── chemises/         (🆕 À créer)
├── pantalons/        (🆕 À créer)
├── vestes/           (🆕 À créer)
├── chaussures/       (🆕 À créer)
├── accessoires/      (🆕 À créer)
└── sous-vetements/   (🆕 À créer)
```

### Personnalisation des Nouvelles Catégories
1. **Chemises** (IDs 13-15): Chemises blanches, bleues, rayées
2. **Pantalons** (IDs 16-18): Chinos, costumes, jeans
3. **Vestes** (IDs 19-21): Cuir, bomber, denim
4. **Chaussures** (IDs 22-24): Baskets, derby, bottes
5. **Accessoires** (IDs 25-27): Montres, portefeuilles, écharpes
6. **Sous-vêtements** (IDs 28-30): T-shirts, boxers, chaussettes

### Prix et Devises
- **Costumes**: Mix CFA (95,000) et USD (1,299-1,799)
- **Nouvelles catégories**: USD (19.99-599.99)
- Personnalisez selon votre marché local

## 🔧 Quick Updates Checklist
- [ ] Update store name in navbar and footer
- [ ] Add your contact information
- [ ] Replace product images with your inventory photos
- [ ] Update product names and descriptions
- [ ] Change hero image to your professional photo
- [ ] Update HTML title and meta description
- [ ] Replace favicon with your logo
- [ ] **🆕 Create image folders for new categories**
- [ ] **🆕 Add your product photos to new categories**
- [ ] **🆕 Adjust pricing for your local market**
