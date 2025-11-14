# Environment Configuration Guide

This guide explains how to configure LiftED for different environments (development, staging, production).

## Environment Files

### Development (Local)
**File**: `.env` (in server folder)
**Purpose**: Local development with MongoDB

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/lifted
JWT_SECRET=dev_secret_key_change_in_production
...
```

### Production (Render + MongoDB Atlas)
**File**: Environment variables in Render Dashboard
**Purpose**: Live production deployment

```env
NODE_ENV=production
PORT=10000
CLIENT_URL=https://lifted.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lifted
JWT_SECRET=production_secret_key
...
```

---

## Configuration by Environment

### 1. Local Development Setup

**For Backend:**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with local settings
npm run dev
```

**For Frontend:**
```bash
npm install
npm run dev
```

**Database**: Local MongoDB
```bash
mongod
```

**API Endpoint**: `http://localhost:5000/api`
**Frontend URL**: `http://localhost:3000`

---

### 2. Staging Setup (Optional)

**For staging between development and production:**

1. Create a separate MongoDB Atlas cluster for staging
2. Create a separate Render service: `lifted-backend-staging`
3. Create a separate Vercel deployment (preview branch)
4. Use staging API keys from payment providers

**Environment Variables**:
```env
NODE_ENV=staging
MONGODB_URI=mongodb+srv://staging_user:password@staging-cluster.mongodb.net/lifted
CLIENT_URL=https://lifted-staging.vercel.app
STRIPE_SECRET_KEY=sk_test_... (test keys)
```

---

### 3. Production Setup

**Prerequisites**:
- MongoDB Atlas cluster
- Render account
- Vercel account
- Payment provider accounts (Stripe, M-Pesa)

**Backend (Render)**:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted
JWT_SECRET=<secure-secret-key>
CLIENT_URL=https://lifted.vercel.app
STRIPE_SECRET_KEY=sk_live_... (live keys)
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (Vercel)**:
```env
NEXT_PUBLIC_API_BASE_URL=https://lifted-backend.onrender.com/api
```

---

## Frontend Configuration

The frontend auto-detects the environment and configures the API URL:

```javascript
// script.js - Lines 1-20
function getAPIBase() {
    if (window.__API_BASE__) {
        return window.__API_BASE__ + '/api';
    }
    
    // Production: Use Render backend
    if (window.location.hostname !== 'localhost') {
        return 'https://lifted-backend.onrender.com/api';
    }
    
    // Development: Use local backend
    return 'http://localhost:5000/api';
}
```

### Override API URL

You can override the API URL by setting `window.__API_BASE__`:

```html
<!-- In index.html before script.js -->
<script>
    window.__API_BASE__ = 'https://your-api.com';
</script>
<script src="script.js"></script>
```

Or use environment variables during build:

```bash
# Development
VITE_API_BASE_URL=http://localhost:5000 npm run dev

# Production
VITE_API_BASE_URL=https://lifted-backend.onrender.com npm run build
```

---

## Backend Configuration

### Port Configuration

**Development**: 5000 (default for local testing)
**Production**: 10000 (Render free tier requirement)

The backend auto-detects the environment and uses the appropriate port:

```javascript
// server/server.js
const PORT = process.env.PORT || 5000;
```

### Database Configuration

**Development**: 
```
MONGODB_URI=mongodb://localhost:27017/lifted
```

**Production**:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lifted
```

### CORS Configuration

**Development** (localhost):
```javascript
cors({
    origin: 'http://localhost:3000',
    credentials: true
})
```

**Production** (Vercel):
```javascript
cors({
    origin: 'https://lifted.vercel.app',
    credentials: true
})
```

---

## Payment Provider Configuration

### Stripe

**Development** (Testing):
```env
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Production** (Live):
```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

### M-Pesa (Optional)

**Development** (Sandbox):
```env
MPESA_CONSUMER_KEY=test_key_sandbox
MPESA_CONSUMER_SECRET=test_secret_sandbox
MPESA_PASSKEY=test_passkey_sandbox
```

**Production** (Live):
```env
MPESA_CONSUMER_KEY=live_consumer_key
MPESA_CONSUMER_SECRET=live_consumer_secret
MPESA_PASSKEY=live_passkey
```

---

## Email Configuration

### Gmail (Recommended for quick setup)

1. Enable 2-Step Verification: myaccount.google.com → Security
2. Generate App Password: Security → App passwords
3. Use in environment:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password (no spaces)
EMAIL_FROM=noreply@lifted.ke
```

### SendGrid (For high volume)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@lifted.ke
```

---

## Security Configuration

### JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Development**: Simple key is fine
```env
JWT_SECRET=dev_key_only_for_testing
```

**Production**: Use strong generated key
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

### Rate Limiting

**Development**: Higher limits (testing)
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Production**: Lower limits (security)
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Monitoring Configuration

### Render

**Access Logs**:
- Go to Service → Logs
- View real-time application logs
- See deployment history

**Environment**: Set `NODE_ENV=production` for production logs

### Vercel

**Access Logs**:
- Go to Project → Deployments
- Click on a deployment → Logs
- See build and edge function logs

**Environment**: Set `NODE_ENV=production` for optimized builds

### MongoDB Atlas

**Monitoring**:
- Go to Cluster → Monitoring
- View query performance
- See database connections
- Monitor storage usage

---

## CI/CD Configuration (Optional)

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}
      - name: Deploy to Vercel
        run: |
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Environment Variable Checklist

### Required for All Environments
- [ ] NODE_ENV
- [ ] JWT_SECRET
- [ ] MONGODB_URI
- [ ] CLIENT_URL
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] EMAIL_FROM

### Required for Production
- [ ] STRIPE_SECRET_KEY (live)
- [ ] STRIPE_PUBLISHABLE_KEY (live)
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD

### Optional
- [ ] MPESA_CONSUMER_KEY
- [ ] MPESA_CONSUMER_SECRET
- [ ] MPESA_PASSKEY
- [ ] MPESA_SHORTCODE

---

## Switching Environments

### From Development to Production

1. **Backup database**
   ```bash
   mongodump --uri "mongodb://localhost:27017/lifted"
   ```

2. **Update environment variables**
   - Change `NODE_ENV` to `production`
   - Update `MONGODB_URI` to MongoDB Atlas connection string
   - Update all API keys to production keys
   - Update `CLIENT_URL` to production frontend URL

3. **Test production config locally**
   ```bash
   NODE_ENV=production npm start
   ```

4. **Deploy to production**
   - Push changes to GitHub
   - Render auto-deploys
   - Verify health endpoint

### Rollback to Development

1. **Revert environment variables**
   - Set `NODE_ENV` back to `development`
   - Update `MONGODB_URI` to local MongoDB
   - Update API keys back to test keys

2. **Restart backend**
   ```bash
   npm run dev
   ```

---

## Testing Different Configurations

### Test Stripe Integration

```bash
# Use test keys in development
STRIPE_SECRET_KEY=sk_test_... npm run dev

# Test webhook locally
ngrok http 5000
# Use ngrok URL for webhook: https://xxxxx.ngrok.io/api/payments/webhook
```

### Test Email Configuration

```bash
# Test Gmail
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

### Test Database Configuration

```bash
# Test MongoDB connection
curl http://localhost:5000/health
```

---

## Common Configuration Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to database" | Wrong MONGODB_URI | Check connection string in MongoDB Atlas |
| "CORS error" | Wrong CLIENT_URL | Update CLIENT_URL to match frontend domain |
| "Email not sending" | Wrong credentials | Verify EMAIL_USER and EMAIL_PASSWORD |
| "Stripe not working" | Using test keys in production | Ensure using sk_live_ and pk_live_ keys |
| "401 Unauthorized" | JWT_SECRET changed | Regenerate tokens after changing SECRET |

---

**Last Updated**: November 2025
