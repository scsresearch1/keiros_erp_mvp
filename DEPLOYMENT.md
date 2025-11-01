# Deployment Guide

This guide explains how to deploy the Keiros ERP application to Netlify and Render.

## Prerequisites

- Node.js and npm installed
- Firebase Realtime Database credentials:
  - `REACT_APP_FIREBASE_DATABASE_URL`
  - `REACT_APP_FIREBASE_DATABASE_SECRET`

## Environment Variables

The application requires the following environment variables:

- `REACT_APP_FIREBASE_DATABASE_URL` - Your Firebase Realtime Database URL
- `REACT_APP_FIREBASE_DATABASE_SECRET` - Your Firebase Database Secret (Auth token)

## Deploying to Netlify

### Option 1: Deploy via Netlify Dashboard

1. **Create a Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up or log in

2. **Connect Your Repository**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - These are already configured in `netlify.toml`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following:
     - `REACT_APP_FIREBASE_DATABASE_URL` = `https://kerios-4cf38-default-rtdb.firebaseio.com/`
     - `REACT_APP_FIREBASE_DATABASE_SECRET` = `your_secret_here`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Deploying to Render

### Option 1: Deploy via Render Dashboard

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up or log in

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your repository

3. **Configure Service**
   - Name: `keiros-erp`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l 3000`
   - Or use the settings from `render.yaml`

4. **Set Environment Variables**
   - Go to Environment tab
   - Add:
     - `REACT_APP_FIREBASE_DATABASE_URL` = `https://kerios-4cf38-default-rtdb.firebaseio.com/`
     - `REACT_APP_FIREBASE_DATABASE_SECRET` = `your_secret_here`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### Option 2: Deploy via Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy using render.yaml
render deploy
```

## Local Development Setup

1. **Copy environment template**
   ```bash
   cp env.example.txt .env.local
   ```

2. **Edit `.env.local`**
   - Set your Firebase credentials

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run development server**
   ```bash
   npm start
   ```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Testing the Build Locally

```bash
# Install serve globally (if not already installed)
npm install -g serve

# Serve the build
serve -s build -l 3000
```

Visit `http://localhost:3000` to test the production build.

## Troubleshooting

### Build Fails

- Ensure all environment variables are set
- Check Node.js version (should be 14+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Firebase Connection Issues

- Verify `REACT_APP_FIREBASE_DATABASE_URL` ends with `/`
- Check that `REACT_APP_FIREBASE_DATABASE_SECRET` is correct
- Ensure Firebase Realtime Database rules allow read access

### Environment Variables Not Working

- Remember: React env vars must start with `REACT_APP_`
- Restart development server after changing `.env` files
- In production, ensure env vars are set in deployment platform

## Security Notes

- Never commit `.env` files to Git
- Use environment variables for all secrets
- The `.gitignore` file already excludes `.env*` files

