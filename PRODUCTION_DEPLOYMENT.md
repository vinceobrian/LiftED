# LiftED Production Deployment Guide

## Overview
This guide walks you through deploying LiftED to production:
- **Backend**: Render.com (free tier available)
- **Frontend**: Vercel (free tier available)
- **Database**: MongoDB Atlas (free tier available)
- **Email**: Gmail or SendGrid
- **Payments**: Stripe (live mode)
- **File Storage**: Cloudinary

---

## STEP 1: Prepare Your Environment

### 1.1 Generate Secure Credentials
```powershell
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Store this securely - you'll need it multiple times
```

### 1.2 Create Accounts (Free Tiers Available)
- [ ] **MongoDB Atlas** - https://www.mongodb.com/cloud/atlas
- [ ] **Render** - https://render.com
- [ ] **Vercel** - https://vercel.com
- [ ] **Stripe** - https://stripe.com
- [ ] **Cloudinary** - https://cloudinary.com
- [ ] **SendGrid or Gmail App Password**

---

## STEP 2: Set Up MongoDB Atlas

### 2.1 Create Cluster
1. Sign in to MongoDB Atlas
2. Click "Create" → "Build a Cluster"
3. Choose "Free" tier
4. Select your region (choose closest to your users)
5. Name: `lifted-production`
6. Click "Create Cluster" (wait 5-10 minutes)

### 2.2 Configure Access
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `lifted_user`
4. Password: Generate strong password (save this!)
5. Built-in Role: `Editor`
6. Click "Add User"

### 2.3 Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - In production, restrict to Render IP (you'll get this later)
4. Click "Confirm"

### 2.4 Get Connection String
1. Go to "Databases"
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<username>` with `lifted_user`
7. Example: `mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted?retryWrites=true&w=majority`

**Save this connection string - you'll need it for Render!**

---

## STEP 3: Deploy Backend to Render

### 3.1 Push Code to GitHub
```powershell
cd c:\Users\Vincent\Desktop\LIFT

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production deployment setup"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/lifted.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3.2 Connect to Render
1. Sign in to Render - https://render.com
2. Click "New" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub account
5. Select `lifted` repository
6. Choose branch: `main`

### 3.3 Configure Render Service
**Name**: `lifted-backend`
**Runtime**: `Node`
**Build Command**: `npm install`
**Start Command**: `npm start`
**Instance Type**: `Free` (or Starter)

### 3.4 Add Environment Variables in Render
Click "Advanced" and add these variables:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://YOUR_VERCEL_DOMAIN.vercel.app
MONGODB_URI=mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted
JWT_SECRET=<your-generated-secret-key>
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-password>
EMAIL_FROM=noreply@lifted.ke
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
MPESA_CONSUMER_KEY=xxxxx
MPESA_CONSUMER_SECRET=xxxxx
MPESA_PASSKEY=xxxxx
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://lifted-backend.onrender.com/api/payments/mpesa/callback
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAIL=admin@lifted.ke
ADMIN_PASSWORD=<strong-password>
```

### 3.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-15 minutes)
3. You'll get a URL like: `https://lifted-backend.onrender.com`
4. Test: `https://lifted-backend.onrender.com/health`

**Save your backend URL - you'll need it for the frontend!**

---

## STEP 4: Deploy Frontend to Vercel

### 4.1 Update Script for Production
The frontend has already been updated to use the Render backend URL.

### 4.2 Connect to Vercel
1. Sign in to Vercel - https://vercel.com
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Select your `lifted` repository
5. Click "Import"

### 4.3 Configure Vercel Project
**Framework Preset**: `Other`
**Root Directory**: `./` (root of repository)

**Build Command**: (leave empty - it's a static site)
**Output Directory**: `./` (leave as is)

### 4.4 Add Environment Variables
Go to project "Settings" → "Environment Variables"

Add these variables (for all environments):
```
NEXT_PUBLIC_API_BASE_URL=https://lifted-backend.onrender.com/api
VITE_API_BASE_URL=https://lifted-backend.onrender.com/api
```

### 4.5 Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://lifted.vercel.app`
4. Visit the URL to test the frontend

**Your production URL**: https://lifted.vercel.app ✅

---

## STEP 5: Update Backend CORS for Frontend

Now that you have your Vercel URL, update the backend:

### 5.1 In Render Dashboard
1. Go to your `lifted-backend` service
2. Click "Environment"
3. Update `CLIENT_URL` to your Vercel URL
4. Example: `https://lifted.vercel.app`
5. Click "Save"
6. Render will auto-redeploy

---

## STEP 6: Set Up Email (Gmail Example)

### 6.1 Enable 2-Factor Authentication
1. Sign in to your Gmail account
2. Go to myaccount.google.com
3. Click "Security" (left menu)
4. Scroll to "How you sign in to Google"
5. Enable "2-Step Verification"

### 6.2 Generate App Password
1. Go back to Security
2. Scroll to "App passwords"
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Copy this password (it has spaces - ignore them)
6. Use this in your `EMAIL_PASSWORD` environment variable

---

## STEP 7: Set Up Payments (Stripe)

### 7.1 Get Stripe API Keys
1. Sign in to Stripe Dashboard - https://dashboard.stripe.com
2. Go to "Developers" → "API Keys"
3. Copy:
   - `Secret Key` (sk_live_...)
   - `Publishable Key` (pk_live_...)
4. Update in Render environment variables

### 7.2 Create Webhook Endpoint
1. Go to "Developers" → "Webhooks"
2. Click "Add Endpoint"
3. URL: `https://lifted-backend.onrender.com/api/payments/webhook`
4. Events to send:
   - `payment_intent.succeeded`
   - `charge.refunded`
5. Copy webhook secret
6. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## STEP 8: Test Production Deployment

### 8.1 Test Backend Health
```powershell
$backendUrl = "https://lifted-backend.onrender.com"
curl "$backendUrl/health"
```

Expected output:
```json
{
  "success": true,
  "message": "LiftED API is running",
  "environment": "production"
}
```

### 8.2 Test Frontend
1. Visit https://lifted.vercel.app
2. Check browser console (F12) for API errors
3. Try creating a student application
4. Try making a donation
5. Check MongoDB Atlas for new records

### 8.3 Test API Endpoints
```powershell
# Get all students
curl "https://lifted-backend.onrender.com/api/students"

# Get students stats
curl "https://lifted-backend.onrender.com/api/donations/stats/summary"

# Health check
curl "https://lifted-backend.onrender.com/health"
```

---

## STEP 9: Monitor Production

### 9.1 Render Logs
1. Go to your service in Render
2. Click "Logs" to see real-time logs
3. Look for errors or warnings

### 9.2 MongoDB Atlas Monitoring
1. Go to your cluster
2. Click "Monitoring"
3. Check:
   - Database connections
   - Query performance
   - Storage usage

### 9.3 Vercel Analytics
1. Go to your project in Vercel
2. Click "Analytics"
3. Monitor:
   - Page views
   - Performance
   - Error rates

---

## STEP 10: Set Up Custom Domain (Optional)

### 10.1 Frontend Custom Domain
1. In Vercel, go to "Settings" → "Domains"
2. Add your domain (e.g., lifted.ke)
3. Follow DNS instructions
4. Update backend `CLIENT_URL` to your domain

### 10.2 Backend Custom Domain
1. In Render, go to "Settings" → "Custom Domain"
2. Add your domain (e.g., api.lifted.ke)
3. Follow DNS instructions
4. Update frontend environment variables

---

## TROUBLESHOOTING

### Backend Won't Start
- Check Render logs for errors
- Verify all environment variables are set
- Test MongoDB connection locally first

### Frontend Can't Connect to Backend
- Check browser console (F12) for CORS errors
- Verify `CLIENT_URL` in backend matches frontend domain
- Test backend health endpoint

### Database Connection Fails
- Verify MongoDB Atlas connection string
- Check network access settings (IP whitelist)
- Ensure database user password is correct

### Email Not Sending
- Verify Gmail app password (not regular password)
- Check EMAIL_USER is correct
- Enable "Less secure app access" if not using app password

### Payments Not Working
- Test with Stripe test keys first
- Verify webhook endpoint is accessible
- Check Render logs for webhook errors

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both services
- [ ] Backend health endpoint working
- [ ] Frontend loads successfully
- [ ] Student application form works end-to-end
- [ ] Donation form processes payment
- [ ] Email notifications sent
- [ ] MongoDB records created
- [ ] Custom domains configured (optional)
- [ ] SSL certificates valid (automatic on Render/Vercel)
- [ ] Monitoring dashboards checked
- [ ] Admin panel accessible
- [ ] Backup strategy in place

---

## Important Security Notes

⚠️ **CRITICAL**: Never commit `.env` files to Git!
⚠️ Change admin password immediately after first login
⚠️ Use strong JWT secret (min 32 characters)
⚠️ Enable 2FA on all service accounts
⚠️ Rotate API keys regularly
⚠️ Monitor logs for suspicious activity
⚠️ Set up proper database backups

---

## Support

For issues, check:
1. **Render Logs** - https://dashboard.render.com
2. **Vercel Logs** - https://vercel.com/dashboard
3. **MongoDB Atlas Alerts** - https://cloud.mongodb.com
4. **Backend Health** - https://lifted-backend.onrender.com/health
5. **Browser Console** - F12 → Console tab

---

**Last Updated**: November 2025
**Backend**: Render.com (onrender.com)
**Frontend**: Vercel (vercel.app)
**Database**: MongoDB Atlas (mongodb.com)
