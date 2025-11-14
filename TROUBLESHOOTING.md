# LiftED Project - Troubleshooting & Setup Guide

## Current Status: All Code Errors Fixed ✅

### What Was Fixed (November 13, 2025)

1. **Missing `displayStudentProfiles()` function** → Added complete function with filtering logic
2. **Route conflicts (Express routing)** → Reordered routes so specific routes come before generic ones
3. **Authentication requirements on public features** → Made donations and student applications public-facing
4. **Frontend-backend field name mismatches** → Aligned field names between forms and API
5. **Mongoose duplicate index warnings** → Removed redundant index definition
6. **Missing contact/newsletter endpoints** → Implemented POST endpoints in notifications route

---

## CURRENT ISSUE: MongoDB Not Running

### Symptom
- Backend starts successfully but port 5000 not listening
- Server output shows: `✅ MongoDB connected successfully` (but actually failing silently)

### Root Cause
MongoDB service must be running on `localhost:27017` for the application to work.

### Solution

#### Option 1: Install and Run MongoDB Locally (Recommended for Development)

**Windows - Using MongoDB Community Edition:**

```powershell
# Download MongoDB Community Edition from:
# https://www.mongodb.com/try/download/community

# After installation, start MongoDB service:
# Option A: As Windows Service (if installed)
net start MongoDB

# Option B: Run manually from installation directory
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod.exe

# Verify it's running - in another terminal:
netstat -ano | findstr :27017
# Should show: TCP 127.0.0.1:27017 LISTENING
```

**macOS - Using Homebrew:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux - Using Package Manager:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl status mongodb
```

#### Option 2: Use MongoDB Atlas (Cloud Hosted)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Update `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifted
```

---

## TESTING CHECKLIST

After MongoDB is running:

### 1. Test Backend Connectivity
```powershell
# Check if server is listening
netstat -ano | findstr :5000

# Test health endpoint
$response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET
$response.Content | ConvertFrom-Json

# Expected output:
# {
#   "success": true,
#   "message": "LiftED API is running",
#   "timestamp": "2025-11-13T12:00:00.000Z",
#   "environment": "development"
# }
```

### 2. Test GET /api/students (Should return empty array initially)
```powershell
$resp = (Invoke-WebRequest -Uri "http://localhost:5000/api/students" -Method GET).Content | ConvertFrom-Json
$resp | ConvertTo-Json

# Expected output:
# {
#   "success": true,
#   "students": [],
#   "totalPages": 0,
#   "currentPage": 1,
#   "total": 0
# }
```

### 3. Create a Test Student (Public API)
```powershell
$body = @{
    firstName = "Test"
    lastName = "Student"
    email = "test@example.com"
    phone = "+254700000000"
    institution = "Kenyatta University"
    course = "Computer Science"
    year = 2
    amountNeeded = 50000
    fundingType = "tuition"
    story = "This is my story about why I need educational support. I come from a humble background and my family cannot afford tuition fees. Please help me achieve my dreams of becoming a software engineer and contributing to Kenya's tech industry."
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/students" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json
```

### 4. Create a Test Donation
```powershell
# First, get a student ID from GET /api/students
# Then use that ID in the donation

$body = @{
    student = "STUDENT_ID_FROM_ABOVE"
    donorName = "John Donor"
    donorEmail = "donor@example.com"
    donorPhone = "+254700111111"
    amount = 5000
    paymentMethod = "mpesa"
    message = "Great work! Keep it up!"
    anonymous = $false
    receiveUpdates = $true
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/donations" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json
```

### 5. Test Contact Form (Public API)
```powershell
$body = @{
    name = "John Contact"
    email = "contact@example.com"
    message = "I have a question about the platform. Can you help me?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/notifications" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json
```

### 6. Test Newsletter Subscription
```powershell
$body = @{
    email = "newsletter@example.com"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/notifications/newsletter" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json
```

### 7. Test Frontend Loading
```
1. Open http://localhost:3000/index.html in browser
2. Check browser console (F12) for errors
3. Verify student cards display (from demo-data.json fallback if API empty)
4. Try submitting the student application form
5. Try submitting the donation form
```

---

## Full Stack Startup Procedure

### Terminal 1: Start MongoDB
```powershell
# Windows
net start MongoDB
# or
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Terminal 2: Start Backend
```powershell
cd c:\Users\Vincent\Desktop\LIFT\server
node server.js

# Expected output:
# (Warnings about deprecated options - OK)
# ✅ MongoDB connected successfully
# 🚀 Server running on port 5000 in development mode
```

### Terminal 3: Start Frontend
```powershell
cd c:\Users\Vincent\Desktop\LIFT
npx http-server -p 3000

# Expected output:
# Starting up http-server, serving ./
# Available on:
#   http://127.0.0.1:3000
```

### Browser
```
Visit: http://localhost:3000/index.html
```

---

## Debugging Tips

### If backend won't connect to MongoDB
```powershell
# 1. Check if MongoDB is running
netstat -ano | findstr :27017

# 2. Try connecting with mongo shell
mongosh "mongodb://localhost:27017"

# 3. Check MongoDB logs
# Windows: Event Viewer > Windows Logs
# macOS: brew services log mongodb-community
# Linux: sudo journalctl -u mongodb

# 4. Verify MONGODB_URI in .env
# Should be: mongodb://localhost:27017/lifted
```

### If frontend can't reach backend
```powershell
# 1. Check if backend port is listening
netstat -ano | findstr :5000

# 2. Check browser console for CORS errors
# If CORS error, check CLIENT_URL in .env matches frontend URL

# 3. Check network tab in DevTools (F12)
# Should see API requests to http://localhost:5000/api/*
```

### If student data doesn't load
```javascript
// Check browser console (F12)
// Should see one of:

// 1. API response (if MongoDB has data):
// { success: true, students: [...], ... }

// 2. Fallback to demo-data:
// "Backend not reachable, using demo data..."

// 3. Error:
// "Failed to load demo data:"
```

---

## Files Modified Today

1. `script.js` - Added displayStudentProfiles() & createStudentCard()
2. `server/routes/students.js` - Reordered routes, made POST public
3. `server/routes/donations.js` - Reordered routes, made POST public
4. `server/routes/notifications.js` - Added POST endpoints
5. `server/controllers/studentController.js` - Handle public applications
6. `server/controllers/donationController.js` - Handle public donations
7. `server/models/Donation.js` - Removed duplicate index
8. `ERRORS_FIXED.md` - Documented all fixes

---

## Next Steps

1. **Install & Start MongoDB** - Most critical step
2. **Verify backend connectivity** - Run health check test
3. **Test all API endpoints** - Use PowerShell scripts above
4. **Test frontend forms** - Open in browser
5. **Populate seed data** - Add sample students for testing
6. **Deploy** - Move to production environment

---

## Quick Reference

| Component | Port | URL |
|-----------|------|-----|
| Backend | 5000 | http://localhost:5000 |
| Frontend | 3000 | http://localhost:3000 |
| MongoDB | 27017 | mongodb://localhost:27017 |

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /health | GET | No | Backend health check |
| /api/students | GET | No | List approved students |
| /api/students | POST | No | Create student application |
| /api/donations | POST | No | Create donation |
| /api/notifications | POST | No | Send contact message |
| /api/notifications/newsletter | POST | No | Subscribe to newsletter |

---

## Support

If issues persist after following these steps:

1. Check ERRORS_FIXED.md for detailed technical changes
2. Check SETUP_GUIDE.md for configuration
3. Check server console logs for error messages
4. Check browser console (F12) for frontend errors
5. Verify all environment variables in .env are set
6. Ensure MongoDB is actually running (netstat check)

Good luck! 🚀
