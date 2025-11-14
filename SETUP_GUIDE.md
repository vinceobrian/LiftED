# LiftED Setup & Integration Guide

## Overview

LiftED is a student crowdfunding platform with a Node.js/Express backend and a vanilla JavaScript frontend. This guide walks you through:

1. **Environment Setup** — Configure required environment variables
2. **Backend Startup** — Run the Express server with MongoDB
3. **Frontend Startup** — Serve the frontend and connect to the backend
4. **Authentication Flow** — Test login, register, and protected endpoints
5. **Integration Testing** — Verify frontend-backend communication

---

## Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **MongoDB** — Either local instance or MongoDB Atlas connection string
- **npm** — Comes with Node.js
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## Part 1: Backend Setup

### 1.1 Environment Variables

Navigate to the `server/` folder and ensure `.env` file exists:

```bash
cd server
cat .env
```

**Required environment variables** (all must be set):

```properties
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/lifted

# Authentication
JWT_SECRET=lifted_dev_super_secret_jwt_key_2025_change_this_in_production_now
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@lifted.ke
EMAIL_PASSWORD=dev_password_123
EMAIL_FROM=noreply@lifted.ke
```

**For production**, update these values with real credentials (e.g., real SMTP, MongoDB Atlas, strong JWT secret).

### 1.2 Install Dependencies

```bash
cd server
npm install
```

Expected output: "up to date, audited XXX packages"

### 1.3 Start the Backend Server

**Development mode** (with auto-reload via nodemon):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

**Expected output** (if successful):

```
✅ MongoDB connected successfully
🚀 Server running on port 5000 in development mode
📍 API endpoint: http://localhost:5000/api
🏥 Health check: http://localhost:5000/health
```

If you see `Missing required environment variables`, check that `.env` is in the `server/` folder and all vars are set.

### 1.4 Verify Backend is Running

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected JSON response:

```json
{
  "success": true,
  "message": "LiftED API is running",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "environment": "development"
}
```

---

## Part 2: Frontend Setup

### 2.1 Ensure API Base URL is Correct

The frontend (`script.js`) uses a centralized `API_BASE` constant:

```javascript
const API_BASE = (window.__API_BASE__ || 'http://localhost:5000') + '/api';
```

**For local development**, this defaults to `http://localhost:5000/api` ✓

**For production**, inject the correct URL in `index.html` before `<script src="script.js">`:

```html
<script>
  window.__API_BASE__ = 'https://api.yourdomain.com';
</script>
<script src="script.js"></script>
```

### 2.2 Serve the Frontend Locally

From the project root:

```bash
# Option A: Using npx http-server (simplest)
npx http-server -p 3000

# Option B: Using Node.js dev script
npm run dev

# Option C: Open index.html directly in browser (limited CORS support)
```

**Expected output** (with http-server):

```
Starting up http-server, serving . on: http://127.0.0.1:3000
```

Then open: **http://localhost:3000/index.html**

### 2.3 Check Browser Console

Open DevTools (F12 → Console tab) and verify:

- No CORS errors
- No 404 on API calls
- Student data loads from backend

---

## Part 3: Authentication Flow

### 3.1 Frontend Auth Features

The frontend now includes **auth-aware API calls**:

1. **JWT Storage** — Token saved in `localStorage` under key `token`
2. **Auto Headers** — All API calls include `Authorization: Bearer <token>` if token exists
3. **Optional Login/Register Forms** — If `#loginForm`, `#registerForm`, `#logoutBtn` exist in HTML, they're automatically wired

### 3.2 Testing Login (Manual via Postman or curl)

1. **Register a new user**:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

2. **Login with existing user**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

3. **Use the token in protected requests**:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

### 3.3 Testing via Frontend UI

If your `index.html` includes login/register forms with ids `#loginForm`, `#registerForm`, `#logoutBtn`:

1. Navigate to the frontend: http://localhost:3000/index.html
2. Fill out and submit the registration form
3. Token is automatically stored in browser localStorage
4. All subsequent API calls (donations, contact, etc.) include the token

To verify token was stored:

```javascript
// In browser console (F12):
localStorage.getItem('token')
```

---

## Part 4: Common API Endpoints

### Student Endpoints

```bash
# Get all students
GET /api/students

# Create a new student application
POST /api/students
Content-Type: application/json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "course": "Computer Science",
  "institution": "University of Nairobi",
  "year": 2
}
```

### Donation Endpoints

```bash
# Create a donation (requires auth)
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json
{
  "studentId": 1,
  "donorName": "John Donor",
  "donorEmail": "donor@example.com",
  "donorPhone": "+254712345678",
  "amount": 5000,
  "paymentMethod": "mpesa"
}
```

### Contact & Newsletter

```bash
# Send contact message
POST /api/notifications
Content-Type: application/json
{
  "name": "Contact Sender",
  "email": "sender@example.com",
  "message": "Hello, I'd like to know more..."
}

# Subscribe to newsletter
POST /api/notifications/newsletter
Content-Type: application/json
{
  "email": "subscriber@example.com"
}
```

---

## Part 5: Troubleshooting

### Server Won't Start — "Missing required environment variables"

**Solution**: Verify `.env` file location and content:

```bash
cd server
cat .env
# Check that all required vars are set
```

### Port 5000 Already in Use

**Solution** (Windows):

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace XXXX with PID)
taskkill /PID XXXX /F
```

### CORS Error in Browser

**Solution**: Ensure `CLIENT_URL` in `.env` matches your frontend origin:

```properties
# If frontend is on http://localhost:3000:
CLIENT_URL=http://localhost:3000
```

Then restart the backend server.

### MongoDB Connection Failed

**Solution**: Ensure MongoDB is running:

```bash
# Check if MongoDB is installed and running
# On Windows with MongoDB installed:
mongod --version

# Start MongoDB service (if installed):
# Windows: Services → MongoDB → Start
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

Or use **MongoDB Atlas** (cloud):

```properties
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifted?retryWrites=true&w=majority
```

---

## Part 6: Frontend Integration Summary

### How Auth Works

1. **Frontend stores JWT** in `localStorage` when user logs in
2. **`apiFetch()` helper** automatically adds `Authorization: Bearer <token>` to all requests
3. **Backend validates token** on protected endpoints
4. **Logout** clears the token from storage and reloads the page

### Files Updated

- `script.js`
  - New constants: `API_BASE`, auth helpers (`getAuthToken()`, `setAuthToken()`)
  - New function: `apiFetch(path, options)` — centralized API calls with auth
  - Optional wiring: `#loginForm`, `#registerForm`, `#logoutBtn`
  - All form submissions now POST to real backend endpoints

### API Calls Made from Frontend

| Action | Method | Endpoint | Auth Required |
|--------|--------|----------|---|
| Load students | GET | `/api/students` | ✗ |
| Submit student app | POST | `/api/students` | ✗ |
| Make donation | POST | `/api/donations` | ✗ |
| Send contact | POST | `/api/notifications` | ✗ |
| Subscribe newsletter | POST | `/api/notifications/newsletter` | ✗ |
| User login | POST | `/api/auth/login` | ✗ |
| User register | POST | `/api/auth/register` | ✗ |

---

## Part 7: Quick Start Checklist

- [ ] Backend `.env` configured with all required variables
- [ ] Backend server running: `npm run dev` (or `npm start`)
- [ ] Health check passes: `curl http://localhost:5000/health`
- [ ] Frontend served on port 3000: `npx http-server -p 3000`
- [ ] Browser opens http://localhost:3000/index.html
- [ ] Student cards load from backend (not demo-data)
- [ ] Forms submit successfully and show success messages
- [ ] Browser console shows no errors

---

## Part 8: Deployment Notes

### For Production

1. **Update `.env`** with real values (strong JWT secret, real SMTP, MongoDB Atlas URI, etc.)
2. **Set `NODE_ENV=production`** in `.env`
3. **Build frontend** (optional; index.html can be served as-is)
4. **Inject `window.__API_BASE__`** in index.html pointing to your production API URL
5. **Deploy backend** to a hosting service (Heroku, Railway, AWS, Google Cloud, etc.)
6. **Serve frontend** from a static host or CDN (Vercel, Netlify, S3, etc.)
7. **Ensure CORS** is configured for your production domain

### Security Checklist

- [ ] JWT_SECRET is a strong, random string (>32 characters)
- [ ] Email credentials are real and secured
- [ ] Database credentials are protected (use environment variables, never commit `.env`)
- [ ] CORS origin matches your domain exactly
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] Input validation is in place (done server-side)

---

## Questions?

For more details on individual endpoints, see `server/README.md` or check the controller files in `server/controllers/`.

Happy funding! 🚀
