# ModernStore - React Online Store

A modern, responsive online store built with React, featuring a clean UI, shopping cart functionality, and multiple pages.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Product Catalog**: Browse products with category filtering
- **Shopping Cart**: Add/remove items, update quantities, view totals
- **Multiple Pages**: Home, Products, Cart, and About/Contact pages
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Context API**: Global state management for cart functionality
- **React Router**: Client-side routing between pages

## 🛠️ Tech Stack

- **React 18** with functional components and hooks
- **React Router DOM** for navigation
- **Context API** for state management
- **CSS3** with modern features (Grid, Flexbox, animations)
- **Google Fonts** (Poppins) for typography

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.js       # Navigation bar with cart icon
│   ├── Footer.js       # Footer with store info
│   ├── ProductCard.js  # Product display card
│   └── CartItem.js     # Cart item component
├── pages/              # Page components
│   ├── Home.js         # Homepage with hero and featured products
│   ├── Products.js     # Product listing with filters
│   ├── Cart.js         # Shopping cart page
│   └── About.js        # About and contact page
├── context/            # Context providers
│   └── CartContext.js  # Cart state management
├── data/               # Mock data
│   └── products.js     # Product data array
└── App.js             # Main app component
```

## 🎨 Design Features

- **Gradient Backgrounds**: Modern gradient designs throughout
- **Card-based Layout**: Clean white cards with shadows
- **Hover Effects**: Smooth transitions and animations
- **Mobile-first**: Responsive design that works on all devices
- **Accessibility**: Proper focus states and semantic HTML

## 🛒 Cart Functionality

- Add products to cart from product pages
- Update item quantities
- Remove items from cart
- Real-time total calculation
- Simulated checkout process
- Empty cart state handling

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## 📱 Pages Overview

### Home Page
- Hero section with call-to-action
- Featured products grid
- Store features showcase

### Products Page
- All products in a responsive grid
- Category filtering
- Product search functionality

### Cart Page
- Shopping cart with item management
- Order summary with totals
- Simulated checkout process

### About Page
- Store information and mission
- Contact form (simulated submission)
- Company statistics

## 🎯 Key Components

### ProductCard
- Displays product image, name, price
- Hover effects with "Add to Cart" button
- Responsive design

### CartItem
- Shows cart item details
- Quantity controls (+/- buttons)
- Remove item functionality
- Price calculations

### Navbar
- Responsive navigation
- Cart icon with item count
- Smooth hover effects

## 🔧 Customization

### Adding New Products
Edit `src/data/products.js` to add new products:

```javascript
{
  id: 13,
  name: "New Product",
  price: 99.99,
  image: "https://example.com/image.jpg",
  category: "Electronics"
}
```

### Styling
- Global styles in `src/App.css`
- Component-specific styles in individual CSS files
- Uses CSS custom properties for consistent theming

## 📦 Deployment

This project can be deployed to:
- **Vercel**: `npm run build` then deploy the `build` folder
- **Netlify**: Drag and drop the `build` folder
- **GitHub Pages**: Use `gh-pages` package

## 🎨 Color Scheme

- Primary: `#667eea` to `#764ba2` (gradient)
- Secondary: `#2c3e50`
- Success: `#27ae60`
- Danger: `#e74c3c`
- Background: `#f8f9fa`

## 📱 Responsive Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🚀 Future Enhancements

- User authentication
- Product search functionality
- Product reviews and ratings
- Wishlist functionality
- Payment integration
- Order history
- Admin dashboard

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using React
