# LiftED Backend Setup Guide

Complete guide for setting up the LiftED backend API.

## 🎯 What's Been Created

### Backend Structure
```
server/
├── controllers/          # Business logic
│   ├── authController.js         ✅ Complete
│   ├── studentController.js      ✅ Complete
│   └── donationController.js     ✅ Complete
├── models/              # Database schemas
│   ├── User.js                   ✅ Complete
│   ├── Student.js                ✅ Complete
│   └── Donation.js               ✅ Complete
├── routes/              # API endpoints
│   ├── auth.js                   ✅ Complete
│   ├── students.js               ✅ Complete
│   ├── donations.js              ✅ Complete
│   ├── users.js                  ✅ Placeholder
│   ├── payments.js               ✅ Placeholder
│   ├── notifications.js          ✅ Placeholder
│   └── upload.js                 ✅ Complete
├── middleware/
│   └── auth.js                   ✅ Complete
├── utils/
│   └── sendEmail.js              ✅ Complete
├── server.js                     ✅ Complete
├── package.json                  ✅ Complete
├── env.example                   ✅ Complete
├── .gitignore                    ✅ Complete
└── README.md                     ✅ Complete
```

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- express-validator - Input validation
- nodemailer - Email sending
- multer - File uploads
- helmet - Security
- cors - Cross-origin requests
- socket.io - Real-time updates
- And more...

### Step 3: Set Up Environment Variables
```bash
# Copy example file
cp env.example .env

# Edit .env file with your values
# Minimum required:
# - MONGODB_URI
# - JWT_SECRET
```

### Step 4: Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (Cloud)
# Just use your Atlas connection string in .env
```

### Step 5: Run the Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:5000`

---

## 🗄️ Database Setup

### Option A: Local MongoDB

1. **Install MongoDB**
   - **macOS:** `brew install mongodb-community`
   - **Ubuntu:** `sudo apt-get install mongodb`
   - **Windows:** Download from mongodb.com

2. **Start MongoDB**
   ```bash
   mongod
   ```

3. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/lifted
   ```

### Option B: MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to mongodb.com/atlas
   - Create free cluster

2. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string

3. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifted
   ```

---

## 🔐 Environment Variables Setup

### Required Variables

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/lifted

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@lifted.ke
```

### Optional Variables (For Production)

```env
# Stripe Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# M-Pesa
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379

# Cloudinary (File uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Go to Security → App passwords
   - Create new app password
   - Copy the password

3. **Update .env**
   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

---

## 🧪 Testing the API

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "LiftED API is running",
  "timestamp": "2025-10-25T...",
  "environment": "development"
}
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+254700123456",
    "role": "donor"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 🔧 Frontend Integration

### Update Frontend API URL

In your frontend `config.js` or `.env`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Example API Call from Frontend

```javascript
// Login example
async function login(email, password) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Store token
        localStorage.setItem('token', data.token);
        return data.user;
    } else {
        throw new Error(data.message);
    }
}

// Authenticated request example
async function getStudents() {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/students', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    return data.students;
}

// Create donation example
async function createDonation(studentId, amount, paymentMethod) {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            student: studentId,
            amount,
            paymentMethod,
            anonymous: false
        })
    });
    
    const data = await response.json();
    return data.donation;
}
```

---

## 🔐 Security Considerations

### Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Use environment variables (never commit .env)
- [ ] Enable rate limiting (already configured)
- [ ] Set up proper CORS origins
- [ ] Use secure headers (helmet already configured)
- [ ] Implement request logging
- [ ] Set up monitoring (PM2, New Relic, etc.)

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📦 Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create lifted-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 2: DigitalOcean

1. Create Droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Set up PM2
6. Configure Nginx

### Option 3: Render.com

1. Connect GitHub repository
2. Select Node.js environment
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Check connection string
# Ensure no typos in MONGODB_URI
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Email Not Sending
- Check Gmail app password
- Verify 2FA is enabled
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Try with different email provider

---

## 📊 API Testing Tools

### Recommended Tools
1. **Postman** - GUI API client
2. **Insomnia** - Alternative to Postman
3. **curl** - Command line
4. **Thunder Client** - VS Code extension

### Postman Collection
Import the following endpoints:

1. **Auth**
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/auth/me

2. **Students**
   - GET /api/students
   - POST /api/students
   - GET /api/students/:id
   - PUT /api/students/:id

3. **Donations**
   - POST /api/donations
   - GET /api/donations
   - GET /api/donations/:id

---

## 🎯 Next Steps

### Immediate Tasks
1. ✅ Backend setup complete
2. ⏳ Test all endpoints
3. ⏳ Connect frontend to backend
4. ⏳ Implement payment integration
5. ⏳ Set up email templates
6. ⏳ Deploy to production

### Future Enhancements
- [ ] Implement M-Pesa integration
- [ ] Add Stripe payment processing
- [ ] Set up file upload to Cloudinary
- [ ] Create admin dashboard endpoints
- [ ] Add notification system
- [ ] Implement real-time updates
- [ ] Add analytics endpoints
- [ ] Create automated tests

---

## 📚 Additional Resources

### Documentation
- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)

### Tutorials
- MongoDB University (free courses)
- Node.js Best Practices
- REST API Design Guidelines

---

## 💡 Tips

1. **Use Nodemon** in development for auto-reload
2. **Test with Postman** before integrating with frontend
3. **Check logs** for debugging (console.log statements)
4. **Use MongoDB Compass** to view database visually
5. **Keep .env secure** never commit to Git

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Health endpoint responds
- [ ] Can register new user
- [ ] Can login and receive JWT token
- [ ] Can create student profile
- [ ] Can get list of students
- [ ] Can create donation
- [ ] Email sending works (optional for dev)

---

## 🎉 You're Ready!

The backend is now fully set up and ready to use. Start the server and begin integrating with your frontend!

```bash
# Start server
npm run dev

# Server running at:
# http://localhost:5000
```

**Happy coding! 🚀**

---

*For questions or issues, refer to server/README.md or create an issue on GitHub.*


