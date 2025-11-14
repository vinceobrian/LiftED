# Production Deployment Quick Start

## TL;DR - 5 Steps to Production

### Step 1: Set Up MongoDB Atlas (5 minutes)
```
1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (choose free tier)
4. Create database user: lifted_user / strong-password
5. Allow network access from anywhere
6. Get connection string: mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted
```

### Step 2: Push Code to GitHub (3 minutes)
```powershell
cd c:\Users\Vincent\Desktop\LIFT
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/YOUR_USERNAME/lifted.git
git push -u origin main
```

### Step 3: Deploy Backend to Render (5 minutes)
```
1. Go to render.com → Sign in with GitHub
2. New Web Service → Connect lifted repository
3. Name: lifted-backend
4. Add environment variables (see PRODUCTION_DEPLOYMENT.md)
5. Deploy
6. Get URL: https://lifted-backend.onrender.com
```

**Add to Render Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted
JWT_SECRET=<your-32-char-secret>
CLIENT_URL=https://lifted.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<gmail-app-password>
... (see full template in PRODUCTION_DEPLOYMENT.md)
```

### Step 4: Deploy Frontend to Vercel (2 minutes)
```
1. Go to vercel.com → Sign in with GitHub
2. Import Project → Select lifted repository
3. Add environment variables:
   NEXT_PUBLIC_API_BASE_URL=https://lifted-backend.onrender.com/api
4. Deploy
5. Get URL: https://lifted.vercel.app
```

### Step 5: Update Backend CORS (1 minute)
```
1. Go to Render → lifted-backend → Environment
2. Update CLIENT_URL=https://lifted.vercel.app
3. Save (auto-redeploys)
```

**Done!** Your app is live at https://lifted.vercel.app

---

## Environment Variables Explained

### Render Backend Variables
| Variable | Value | Where to Get |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Set it |
| `PORT` | `10000` | Render default |
| `CLIENT_URL` | Your Vercel URL | After Vercel deploy |
| `MONGODB_URI` | MongoDB connection string | MongoDB Atlas |
| `JWT_SECRET` | Random 32-char string | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `EMAIL_USER` | Your Gmail | Your email account |
| `EMAIL_PASSWORD` | Gmail app password | Gmail → Security → App passwords |
| `STRIPE_SECRET_KEY` | Live key | Stripe Dashboard → API Keys |

### Vercel Frontend Variables
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://lifted-backend.onrender.com/api` |

---

## Test Production

### 1. Backend Health
```powershell
curl https://lifted-backend.onrender.com/health
```

### 2. Frontend Loads
```
Visit https://lifted.vercel.app in browser
Press F12 to open console - check for errors
```

### 3. Create Student Application
```
1. Click "Apply for Support"
2. Fill form and submit
3. Check backend logs for success
4. Check MongoDB Atlas for new record
```

### 4. Create Donation
```
1. Click on a student
2. Enter donation amount
3. Complete payment
4. Check logs and MongoDB
```

---

## Common Issues

### Backend won't start
- Check Render logs: https://dashboard.render.com
- Verify MongoDB URI is correct
- Ensure all required env vars are set

### Frontend can't reach backend
- Check browser console (F12)
- Verify backend URL in frontend env vars
- Test backend health: `https://lifted-backend.onrender.com/health`

### Payment fails
- Verify Stripe keys are for LIVE mode (sk_live_, pk_live_)
- Check Stripe webhook endpoint is registered
- Review Stripe Dashboard → Payments for errors

### Email not sending
- Gmail: Use app password, not account password
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check backend logs for email errors

---

## Next Steps

1. ✅ **Deploy** - Follow 5 steps above
2. 📊 **Monitor** - Check Render/Vercel/MongoDB dashboards
3. 🔐 **Security** - Change admin password, rotate secrets
4. 📱 **Domain** - Add custom domain (lifted.ke)
5. 🚀 **Scale** - Upgrade to paid tiers as users grow

---

**Full Guide**: See PRODUCTION_DEPLOYMENT.md for detailed setup
**Issues**: Check TROUBLESHOOTING.md in same directory
