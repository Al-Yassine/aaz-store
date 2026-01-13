# 📋 Installation & Setup Guide

## Prerequisites

Before you can run this project, ensure you have the following installed:

- **Node.js** ≥ 14.0 - [Download](https://nodejs.org/)
- **npm** ≥ 6.0 - (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version    # Should show v14+ or higher
npm --version     # Should show 6.0 or higher
git --version     # Should show 2.0 or higher
```

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/aazstore.git
cd aazstore
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`:
- React 18.2.0
- React Router DOM 6.3.0
- React Scripts 5.0.1

### 3. Start Development Server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

---

## 📦 Available Scripts

### `npm start`
Runs the app in development mode with hot-reload.
- Open [http://localhost:3000](http://localhost:3000) to view it in the browser
- The page will reload when you make changes
- You will see build errors and lint warnings in the console

### `npm run build`
Builds the app for production to the `build` folder.
- Correctly bundles React in production mode
- Optimizes the build for the best performance
- Build is minified and filenames include hashes
- Ready to deploy on Vercel or any static host

### `npm test`
Launches the test runner in interactive watch mode.
- Tests are optional (project does not include test suite)

### `npm run eject`
**⚠️ Warning: This is a one-way operation. Once you eject, you can't go back!**

---

## 🔧 Troubleshooting Installation

### Issue: `npm: command not found`
**Solution**: Node.js is not installed or not in PATH
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal
3. Verify with `node --version`

### Issue: `npm install` is slow
**Solution**: Clear npm cache
```bash
npm cache clean --force
npm install
```

### Issue: `npm install` fails with permission errors
**Solution**: Use sudo (not recommended) or fix npm permissions
```bash
# On macOS/Linux
sudo npm install
```

### Issue: `npm start` fails with "PORT 3000 is already in use"
**Solution**: Use a different port
```bash
PORT=3001 npm start
```

### Issue: Build fails with "out of memory" error
**Solution**: Increase Node memory
```bash
node --max-old-space-size=4096 node_modules/.bin/react-scripts build
```

### Issue: Module not found errors
**Solution**: Ensure you're in the correct directory and dependencies are installed
```bash
cd aazstore
npm install
npm start
```

---

## 📝 Project Structure

```
aazstore/
├── public/              # Static assets
│   ├── index.html       # Root HTML file
│   └── Images/          # Product images
├── src/                 # Source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── context/         # React Context (state management)
│   ├── data/            # Static data and products
│   ├── utils/           # Utility functions
│   ├── App.js           # Main App component
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── vercel.json          # Vercel deployment config
└── README.md            # Main documentation
```

---

## 🌐 Environment Variables

This project does not require environment variables by default.

If you need to add them in the future:

1. Create `.env.local` in the project root
2. Add variables (must start with `REACT_APP_`)
   ```
   REACT_APP_API_URL=https://api.example.com
   ```
3. Access in code: `process.env.REACT_APP_API_URL`
4. **Important**: Never commit `.env.local` to Git

---

## 🚀 Next Steps

After successful installation:

1. **Development**: Run `npm start` to develop locally
2. **Building**: Run `npm run build` to create production build
3. **Deployment**: See [README.md](README.md) for Vercel deployment
4. **Git**: Commit your changes and push to GitHub
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

---

## 📞 Getting Help

- **React Issues**: Check [React Documentation](https://react.dev)
- **Node/npm Issues**: Check [Node.js Documentation](https://nodejs.org/docs/)
- **GitHub Issues**: Create an issue in the repository
- **npm Issues**: Search [npm Support](https://www.npmjs.com/)

---

## ✅ Installation Checklist

- [ ] Node.js installed (v14+)
- [ ] npm installed (v6+)
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm start`)
- [ ] Application opens in browser
- [ ] No errors in console

---

**Ready to develop!** 🎉

For more information, see:
- [README.md](README.md) - Features and deployment
- [QUICK_START_DEPLOY.md](QUICK_START_DEPLOY.md) - Deploy to Vercel
