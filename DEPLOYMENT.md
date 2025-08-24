# 🚀 Deployment Guide: Lead Management System

This guide will help you deploy your Lead Management System to make it accessible from anywhere.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free)
- Render account (free)
- PostgreSQL database (Render provides this)

## 🎯 Deployment Strategy

- **Frontend**: Vercel (React app)
- **Backend**: Render (Node.js/Express API)
- **Database**: Render PostgreSQL

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create a new account

### Step 2: Create PostgreSQL Database
1. **New** → **PostgreSQL**
2. **Name**: `lead-management-db`
3. **Database**: `lead_management`
4. **User**: `lead_user`
5. **Region**: Choose closest to you
6. **Plan**: Free (for testing)

### Step 3: Deploy Backend
1. **New** → **Web Service**
2. **Connect Repository**: Select your GitHub repo
3. **Name**: `lead-management-backend`
4. **Environment**: `Node`
5. **Build Command**: `cd backend && npm install`
6. **Start Command**: `cd backend && npm start`
7. **Plan**: Free

### Step 4: Configure Environment Variables
Add these in Render dashboard:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://lead_user:password@host:port/lead_management
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 5: Get Backend URL
Your backend will be available at:
`https://your-backend-name.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### Step 2: Configure Build Settings
1. **Framework Preset**: Create React App
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### Step 3: Set Environment Variables
Add in Vercel dashboard:

```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Get your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Update Configuration Files

### Update Frontend Config
In `frontend/src/config/config.js`:

```javascript
const config = {
  development: {
    apiUrl: 'http://localhost:5001',
  },
  production: {
    apiUrl: 'https://your-backend-name.onrender.com', // Your actual Render URL
  },
};
```

### Update Render Config
In `render.yaml`:

```yaml
envVars:
  - key: FRONTEND_URL
    value: https://your-frontend-url.vercel.app # Your actual Vercel URL
```

---

## 🗄️ Database Setup

### Step 1: Run Migration
After backend is deployed:

```bash
# Set DATABASE_URL in Render environment
# The migration will run automatically on first deployment
```

### Step 2: Seed Data
```bash
# Set DATABASE_URL in Render environment
# Run seeding through Render console or redeploy
```

---

## ✅ Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test `/health` endpoint
3. **Login**: Use test account (`test@example.com` / `test123`)
4. **CRUD Operations**: Test creating, reading, updating, deleting leads

---

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Error**: Ensure `FRONTEND_URL` is set correctly in backend
2. **Database Connection**: Check `DATABASE_URL` format
3. **Build Failures**: Verify Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Debug Commands:

```bash
# Check backend logs in Render
# Check frontend build logs in Vercel
# Test API endpoints with Postman/curl
```

---

## 🎉 Success!

Your Lead Management System is now:
- ✅ **Accessible from anywhere**
- ✅ **Scalable and reliable**
- ✅ **Professional deployment**
- ✅ **Ready for production use**

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Your GitHub Repository](https://github.com/jainyash0614/lead-management-system)
