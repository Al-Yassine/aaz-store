# Firebase Backend Integration

This document describes the Firebase backend integration for AAZ Store.

## 📁 Project Structure

```
src/
├── firebase.js                    # Firebase initialization and configuration
├── services/
│   ├── authService.js             # Authentication functions
│   ├── userService.js             # User management functions
│   └── orderService.js            # Order management functions
├── context/
│   └── AuthContext.js             # Authentication context provider
└── pages/
    └── AdminDashboard.js          # Admin dashboard page

functions/
├── index.js                       # Firebase Cloud Functions
└── package.json                   # Functions dependencies
```

## 🔐 Authentication

### Features Implemented
- **Sign Up**: Email & password registration with user data stored in Firestore
- **Login**: Email & password authentication
- **Logout**: Sign out functionality
- **Forgot Password**: Password reset email

### User Document Structure
```javascript
// Collection: users
{
  uid: "user_id",
  email: "user@example.com",
  name: "Full Name",
  phone: "+227 XX XX XX XX",
  role: "customer" | "admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Password Reset Email Template (French)
Configure in Firebase Console > Authentication > Email Templates > Password Reset:

```html
<p>Bonjour,</p>
<p>Veuillez suivre ce lien pour réinitialiser votre mot de passe %APP_NAME% associé au compte %EMAIL%.</p>
<p><a href="%LINK%">%LINK%</a></p>
<p>Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet e-mail.</p>
<p>Merci,</p>
<p>L'équipe %APP_NAME%</p>
```

## 🛒 Orders System

### Order Document Structure
```javascript
// Collection: orders
{
  id: "order_id",
  userId: "user_id",
  customerEmail: "user@example.com",
  products: [
    {
      id: "product_id",
      name: "Product Name",
      price: 25000,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "url_to_image",
      image: "url_to_image"
    }
  ],
  totalPrice: 26000,
  subtotal: 25000,
  deliveryFee: 1000,
  paymentMethod: "cod" | "nita",
  deliveryRegion: "Niamey",
  deliveryInfo: {
    fullName: "Customer Name",
    phone: "+227 XX XX XX XX",
    quartier: "Quartier Name",
    address: "Full Address"
  },
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Order Status Flow
1. **pending** - Order created, awaiting processing
2. **confirmed** - Order confirmed by admin
3. **shipped** - Order shipped to customer
4. **delivered** - Order delivered to customer
5. **cancelled** - Order cancelled

## 👑 Admin System

### Role-Based Access Control
- **customer**: Default role for all users
- **admin**: Full access to all orders and admin dashboard

### Admin Capabilities
- View all orders
- Filter orders by status
- Update order status
- Delete orders
- View order statistics

### Setting Up Admin User
To set a user as admin, you have two options:

1. **Via Firebase Console**:
   - Go to Firestore Database
   - Find the user document in `users` collection
   - Change `role` field to `"admin"`

2. **Via Cloud Function** (recommended for production):
   - Create a callable function that verifies the caller is already an admin
   - Then updates the target user's role

## 📧 Email Notifications

### Cloud Functions
The following Cloud Functions are implemented:

1. **sendOrderConfirmationEmail**: Sends confirmation email when order is created
2. **sendOrderStatusUpdateEmail**: Sends email when order status changes
3. **onOrderCreated**: Triggered when new order document is created
4. **onOrderStatusUpdated**: Triggered when order status changes

### Email Configuration
Set up Gmail for sending emails:

```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
```

Or use environment variables:
```bash
export GMAIL_EMAIL="your-email@gmail.com"
export GMAIL_PASSWORD="your-app-password"
```

**Note**: Use an App Password for Gmail, not your regular password.

## 🛡 Security Rules

### Firestore Rules Summary
- Users can only read/write their own user document
- Users can only create orders (with their own userId)
- Users can only read their own orders
- Admins can read/write all orders
- Admins can read all user documents

See `firestore.rules` for the complete rules configuration.

## 🚀 Deployment

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created at https://console.firebase.google.com

### Initial Setup
1. Copy `.env.example` to `.env.local` and fill in your Firebase config values
2. Enable Authentication in Firebase Console (Email/Password provider)
3. Create Firestore Database in Firebase Console
4. Enable Cloud Functions in Firebase Console

### Deploy Commands

```bash
# Install dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..

# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy

# Build and deploy hosting
npm run build
firebase deploy --only hosting
```

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🔧 Usage Examples

### Sign Up
```javascript
import { signUp } from './services/authService';

const result = await signUp('user@example.com', 'password123', {
  name: 'John Doe',
  phone: '+227 90 00 00 00'
});

if (result.success) {
  console.log('User created:', result.user);
}
```

### Sign In
```javascript
import { signIn } from './services/authService';

const result = await signIn('user@example.com', 'password123');

if (result.success) {
  console.log('Logged in:', result.user);
}
```

### Create Order
```javascript
import { createOrder } from './services/orderService';

const result = await createOrder({
  userId: 'user_id',
  customerEmail: 'user@example.com',
  products: [...],
  totalPrice: 26000,
  subtotal: 25000,
  deliveryFee: 1000,
  paymentMethod: 'cod',
  deliveryRegion: 'Niamey',
  deliveryInfo: {...}
});
```

### Get All Orders (Admin)
```javascript
import { getAllOrders } from './services/orderService';

const result = await getAllOrders();

if (result.success) {
  console.log('Orders:', result.data);
}
```

### Update Order Status (Admin)
```javascript
import { updateOrderStatus, ORDER_STATUS } from './services/orderService';

const result = await updateOrderStatus('order_id', ORDER_STATUS.CONFIRMED);
```

### Using Auth Context
```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser) return <div>Please log in</div>;
  
  return (
    <div>
      <p>Welcome, {currentUser.email}</p>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

## 🧪 Testing

### Test Authentication Flow
1. Create a new account via Sign Up page
2. Verify user document is created in Firestore
3. Log out and log back in
4. Test password reset functionality

### Test Order Flow
1. Add items to cart
2. Proceed to checkout
3. Complete order
4. Verify order appears in Firestore
5. Check email notification (if configured)

### Test Admin Dashboard
1. Set a user as admin in Firestore
2. Log in as that user
3. Access `/admin` route
4. Verify all orders are visible
5. Test status updates
6. Test order deletion

## 📞 Support

For issues or questions, contact the development team.
