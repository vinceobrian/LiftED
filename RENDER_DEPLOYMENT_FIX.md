# Render Deployment Fix - Backend Only

## The Problem
Render was trying to run the **entire project** (frontend + backend) as a Node.js app, which failed because it tried to execute `index.html` as JavaScript.

## The Solution
The project structure separates **backend** (server folder) from **frontend** (root folder):

```
LIFT/
├── index.html          ← Frontend (deploy to Vercel)
├── script.js           ← Frontend
├── styles.css          ← Frontend
├── server/             ← Backend (deploy to Render)
│   ├── package.json
│   ├── server.js
│   └── routes/
```

## Fixed Configuration

### Root `render.yaml`
- Uses `rootDir: server` to only deploy the backend
- Ignores frontend files (index.html, styles.css, script.js)
- Runs `npm start` from the server directory
- Proper Node.js deployment

### Root `package.json`
- Changed `"main"` from `"index.html"` to removed (backend only)
- `"start"` now runs `node server/server.js`
- `"dev"` runs backend development
- Frontend scripts separated to `frontend-dev`, `frontend-serve`

### Frontend vs Backend

**Backend (Render)** - Deploy via GitHub to Render
```bash
- Backend server running on port 10000
- API endpoints: /api/students, /api/donations, etc.
- Connected to MongoDB Atlas
- Uses environment variables from Render dashboard
```

**Frontend (Vercel)** - Deploy via GitHub to Vercel
```bash
- Static HTML/CSS/JS site
- Connects to backend API
- Runs on global CDN
- No build step needed
```

## How to Deploy Now

### Step 1: Delete Current Render Deployment
1. Go to Render Dashboard
2. Find your `lifted-backend` service
3. Click Settings → Danger Zone → Delete Service
4. Confirm deletion

### Step 2: Reconnect Repository
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml` and use the new configuration
5. It will now only deploy the `server` folder

### Step 3: Add Environment Variables
In Render Dashboard → Environment:
```
MONGODB_URI=mongodb+srv://lifted_user:PASSWORD@cluster.mongodb.net/lifted
JWT_SECRET=your-generated-secret-key
CLIENT_URL=https://lifted.vercel.app (or your frontend URL)
[all other variables...]
```

### Step 4: Deploy
Click "Deploy" and wait 5-15 minutes for the backend to deploy successfully.

### Step 5: Test Health Endpoint
```bash
curl https://lifted-backend.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "LiftED API is running",
  "environment": "production"
}
```

## Deployment Strategy

**Two-Service Setup** (Recommended):
```
GitHub Repository
├── Push to main branch
│
├─→ Render Service 1: Backend
│   └── runs `server/server.js`
│       connects to MongoDB Atlas
│       serves API endpoints
│
└─→ Vercel Service: Frontend
    └── serves static files
        connects to Render backend
        global CDN
```

## What Changed

### Before (Broken)
```
render.yaml (tried to deploy everything)
↓
Render runs: node index.html
↓
ERROR: index.html is not JavaScript!
```

### After (Fixed)
```
render.yaml (rootDir: server)
↓
Render runs: npm start (from server folder)
↓
Runs: node server.js
✓ Backend API starts successfully
```

## Frontend Deployment (Vercel)
Frontend deployment **doesn't change**:
1. Connect your GitHub repo to Vercel
2. Vercel auto-detects frontend files
3. No build needed
4. Deploys static site globally

## Environment Variables to Set

### Render (Backend)
```
NODE_ENV=production
MONGODB_URI=[from MongoDB Atlas]
JWT_SECRET=[generated]
CLIENT_URL=https://lifted.vercel.app
EMAIL_USER=[your email]
EMAIL_PASSWORD=[app password]
STRIPE_SECRET_KEY=sk_live_[your key]
[all others...]
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_BASE_URL=https://lifted-backend.onrender.com/api
```

## Troubleshooting

### Still getting errors?
1. Make sure you're using the NEW `render.yaml` (with `rootDir: server`)
2. Delete the old Render service and create a new one
3. Verify `server/package.json` has correct scripts
4. Check that `server/server.js` exists and is valid

### Backend not starting?
```bash
# Test locally first
cd server
npm install
npm start
```

Should see: `🚀 Server running on port 5000`

### CORS errors?
Update Render environment variable: `CLIENT_URL=https://your-vercel-domain.vercel.app`
Then redeploy.

## Files Modified

- ✅ `render.yaml` - Added `rootDir: server` parameter
- ✅ `package.json` - Updated scripts to run backend
- ✅ Deployment strategy clarified

## Next Steps

1. Delete old Render service
2. Create new web service with updated `render.yaml`
3. Add all environment variables
4. Deploy
5. Test with: `https://lifted-backend.onrender.com/health`
6. Verify frontend connects and works

---

**Status**: ✅ Fixed - Backend only deployment configured
