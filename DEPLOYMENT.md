# 🚀 Deployment Guide - IRON TEMPLE

## Quick Deployment Steps

### Step 1: MongoDB Setup (5 minutes)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up (free tier available)

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select cloud provider and region
   - Click "Create"

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (SAVE THESE!)
   - Set privileges to "Atlas admin"
   - Click "Add User"

4. **Whitelist IP:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - Or add your specific IP for local dev
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `iron_temple` (or your preferred name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/iron_temple?retryWrites=true&w=majority`

### Step 2: Backend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy Backend:**
```bash
cd backend
vercel
```

4. **Set Environment Variables:**
   - When prompted, say "No" to overwriting settings
   - Go to https://vercel.com/dashboard
   - Select your backend project
   - Go to Settings → Environment Variables
   - Add:
     - **Name:** `MONGODB_URI`
     - **Value:** Your MongoDB connection string
   - Click "Save"

5. **Redeploy:**
   - Go to Deployments tab
   - Click "..." → "Redeploy"
   - Copy your backend URL (e.g., `https://iron-temple-backend.vercel.app`)

### Step 3: Frontend Deployment (Vercel)

1. **Update API URL:**
   - Create `.env` file in root:
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

2. **Deploy Frontend:**
```bash
cd ..  # Go back to root
vercel
```

3. **Set Environment Variable:**
   - Go to Vercel Dashboard → Frontend Project → Settings → Environment Variables
   - Add:
     - **Name:** `VITE_API_URL`
     - **Value:** Your backend URL (from Step 2)
   - Redeploy

### Step 4: Test Deployment

1. **Test Backend:**
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"IRON TEMPLE API is running"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try adding a member
   - Check if it saves to MongoDB

## Local Development Setup

### Backend:
```bash
cd backend
npm install
# Create .env file with MONGODB_URI
npm run dev
```

### Frontend:
```bash
npm install
# Create .env file with VITE_API_URL=http://localhost:3001
npm run dev
```

## Troubleshooting

### Backend Issues:
- **MongoDB Connection Error:** Check your connection string, password, and IP whitelist
- **Port Already in Use:** Change PORT in .env or kill the process using port 3001
- **CORS Error:** Backend CORS is already configured

### Frontend Issues:
- **API Not Working:** Check VITE_API_URL environment variable
- **Build Errors:** Make sure all dependencies are installed
- **CORS Error:** Ensure backend URL is correct

### Vercel Issues:
- **Build Fails:** Check build logs in Vercel dashboard
- **Environment Variables Not Working:** Make sure to redeploy after adding variables
- **API 404:** Check your API routes and Vercel configuration

## Environment Variables Summary

### Backend (.env):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iron_temple?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
```

### Frontend (.env):
```
VITE_API_URL=https://your-backend-url.vercel.app
```

## Quick Commands

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
npm install && npm run dev

# Deploy Backend
cd backend && vercel

# Deploy Frontend
vercel
```

---

**Need Help?** Check the main README.md for more details.
