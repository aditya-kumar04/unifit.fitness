# UNIFIT Deployment Guide

This guide covers deploying UNIFIT using **Vercel** (frontend) + **Railway/Render** (backend).

---

## **Table of Contents**
1. [Backend Deployment (Railway)](#backend-deployment-railway)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Post-Deployment Verification](#post-deployment-verification)

---

## **Backend Deployment (Railway)**

### **Step 1: Prepare Backend for Deployment**

Backend is already configured with:
- ✅ `Procfile` - Specifies how to run the app
- ✅ `server/.env.production` - Production environment variables template

### **Step 2: Deploy to Railway**

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
   - Click "New Project" → "Deploy from GitHub"
   - Select your `unifit.fitness` repository
   - Authorize Railway to access your repo

3. **Configure Build Settings**
   - Build Command: `npm install --prefix server` (optional)
   - Start Command: Leave empty (uses Procfile)
   - Root Directory: `server`

4. **Set Environment Variables**
   - In Railway dashboard, go to **Variables**
   - Add all variables from `server/.env.production`:
     ```
     PORT=8080
     NODE_ENV=production
     SERVER_URL=https://<railway-generated-url>
     FRONTEND_URL=https://<vercel-frontend-url>
     MONGODB_URI=<your-mongodb-atlas-uri>
     JWT_SECRET=<generate-strong-random-secret>
     GOOGLE_CLIENT_ID=<your-google-oauth-id>
     GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=<your-email>
     EMAIL_PASS=<your-app-password>
     ```

5. **Deploy**
   - Click **Deploy** button
   - Railway will automatically build and start your server
   - You'll get a URL like: `https://unifit-api-prod.railway.app`

### **Step 3: Verify Backend is Running**
```bash
curl https://<your-railway-url>/api/health
```

---

## **Frontend Deployment (Vercel)**

### **Step 1: Prepare Frontend**

1. **Ensure `client/` has proper structure**:
   - ✅ `package.json` configured with Vite build
   - ✅ `vercel.json` with build configuration
   - ✅ `.env.production` template created

2. **Update API URLs in Frontend**

Ensure `client/src/services/api.js` uses environment variables:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
```

### **Step 2: Deploy to Vercel**

1. **Sign up at [Vercel.com](https://vercel.com)**

2. **Import Project**
   - Click **Add New** → **Project**
   - Select your GitHub repository
   - Authorize Vercel

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - In **Settings** → **Environment Variables**, add:
     ```
     VITE_API_URL=https://<your-railway-url>
     VITE_SOCKET_URL=https://<your-railway-url>
     ```

5. **Deploy**
   - Click **Deploy**
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://unifit.vercel.app`

---

## **Environment Variables Setup**

### **Required Variables Checklist**

**Backend (Railway):**
- [ ] `PORT` - 8080 (for Railway)
- [ ] `NODE_ENV` - production
- [ ] `SERVER_URL` - Your Railway URL
- [ ] `FRONTEND_URL` - Your Vercel URL
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `EMAIL_USER` & `EMAIL_PASS` - Gmail credentials (or your email provider)

**Frontend (Vercel):**
- [ ] `VITE_API_URL` - Your Railway backend URL
- [ ] `VITE_SOCKET_URL` - Your Railway backend URL

### **Generating JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Use the output as your `JWT_SECRET`.

---

## **Post-Deployment Verification**

### **Check Backend Health**
```bash
curl https://<railway-url>/api/health
```

### **Test Frontend**
- Visit `https://unifit.vercel.app`
- Try logging in with test credentials
- Check Console for any API errors

### **Verify Real-time Communication**
- Open Chat/Notifications
- Check Network tab for WebSocket connections
- Verify Socket.IO connects successfully

### **Monitor Logs**
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Project → Deployments → Logs

---

## **Troubleshooting**

### **CORS Errors**
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL
- Check backend CORS middleware in `server/index.js`

### **WebSocket Connection Failed**
- Ensure Railway URL is properly set in frontend
- Check Socket.IO configuration in `server/utils/socket.js`

### **API Calls Failing**
- Verify `VITE_API_URL` is set in Vercel
- Check Network tab in browser DevTools
- Review Railway logs for errors

### **Database Connection Issues**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas whitelist includes Railway IP
- Ensure database user has correct permissions

### **Build Failures**

**Railway Build Failed:**
- Check logs for missing dependencies
- Ensure `package.json` has all required dependencies
- Verify Node.js version compatibility

**Vercel Build Failed:**
- Check `vite.config.js` configuration
- Ensure all environment variables are set
- Verify Tailwind CSS is properly configured

---

## **Production Optimization Tips**

1. **Enable Compression**
   - ✅ Already configured in `server/index.js`

2. **Set Up Monitoring**
   - Use Railway Analytics for backend
   - Use Vercel Analytics for frontend

3. **SSL/HTTPS**
   - ✅ Automatically handled by Railway & Vercel

4. **Database Backups**
   - Configure MongoDB Atlas automated backups
   - Set retention to at least 7 days

5. **Rate Limiting**
   - ✅ Already configured in `server/index.js`

6. **Security Headers**
   - ✅ Helmet configured for CSP and security headers

---

## **Rollback Procedure**

### **Railway Rollback**
1. Go to Deployments tab
2. Click on a previous deployment
3. Click Redeploy

### **Vercel Rollback**
1. Go to Deployments tab
2. Click "..." on previous deployment
3. Select "Promote to Production"

---

## **Continuous Deployment**

Both Railway and Vercel automatically deploy when you push to your main branch:

1. Push code to GitHub
2. Railway/Vercel automatically build and deploy
3. Check deployment status in their dashboards

To disable auto-deploy:
- **Railway**: Settings → Deployments → Auto-Deploy (toggle off)
- **Vercel**: Settings → Git → Deploy Hooks

---

## **Useful Links**

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

## **Support**

For deployment issues:
1. Check the specific service documentation
2. Review logs in dashboards
3. Verify environment variables are correctly set
4. Ensure all dependencies are installed

