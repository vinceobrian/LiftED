# Production Deployment Checklist

## Pre-Deployment (Do This First)

### Code Quality
- [ ] All code pushed to GitHub
- [ ] No `.env` files committed
- [ ] `package.json` has correct scripts
- [ ] No hardcoded credentials in code
- [ ] Error handling is comprehensive
- [ ] CORS is properly configured
- [ ] All routes have proper validation

### Documentation
- [ ] README.md has production instructions
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Setup guide created
- [ ] Troubleshooting guide created

### Testing (Local)
- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Student form submits successfully
- [ ] Donation form works end-to-end
- [ ] Contact form works
- [ ] Newsletter signup works
- [ ] No console errors in browser
- [ ] Responsive design verified

---

## Database Setup (MongoDB Atlas)

### Cluster Configuration
- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Cluster name: `lifted-production`
- [ ] Region selected (close to users)
- [ ] Replica set enabled (auto)
- [ ] Backups enabled (auto)

### Security Configuration
- [ ] Database user created: `lifted_user`
- [ ] Strong password set (32+ characters)
- [ ] User role: `Editor`
- [ ] Network access configured
- [ ] IP whitelist updated
- [ ] Connection string obtained
- [ ] Test connection successful

### Data Setup
- [ ] Database initialized
- [ ] Collections created (students, donations, users, etc.)
- [ ] Indexes created
- [ ] Seed data loaded (optional)
- [ ] Test records created

---

## Backend Deployment (Render)

### Git Repository
- [ ] GitHub account created
- [ ] Repository created: `lifted`
- [ ] All code pushed to `main` branch
- [ ] `.gitignore` properly configured
- [ ] No large files (use .gitignore)
- [ ] Branch protection enabled (optional)

### Render Service Setup
- [ ] Render account created
- [ ] GitHub connected
- [ ] Repository connected: `lifted`
- [ ] Service name: `lifted-backend`
- [ ] Runtime: Node
- [ ] Region selected
- [ ] Auto-deploy enabled

### Environment Variables (Render)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = MongoDB connection string
- [ ] `JWT_SECRET` = Generated 32+ char secret
- [ ] `CLIENT_URL` = Frontend Vercel URL
- [ ] `EMAIL_HOST` = `smtp.gmail.com` or SendGrid
- [ ] `EMAIL_PORT` = `587`
- [ ] `EMAIL_USER` = Your email
- [ ] `EMAIL_PASSWORD` = App password or API key
- [ ] `EMAIL_FROM` = `noreply@lifted.ke`
- [ ] `STRIPE_SECRET_KEY` = Live key (sk_live_)
- [ ] `STRIPE_PUBLISHABLE_KEY` = Live key (pk_live_)
- [ ] `STRIPE_WEBHOOK_SECRET` = Webhook secret
- [ ] `MPESA_CONSUMER_KEY` = M-Pesa key (if enabled)
- [ ] `MPESA_CONSUMER_SECRET` = M-Pesa secret (if enabled)
- [ ] `MPESA_PASSKEY` = M-Pesa passkey (if enabled)
- [ ] `MPESA_SHORTCODE` = `174379`
- [ ] `CLOUDINARY_CLOUD_NAME` = Cloudinary account
- [ ] `CLOUDINARY_API_KEY` = Cloudinary key
- [ ] `CLOUDINARY_API_SECRET` = Cloudinary secret
- [ ] `ADMIN_EMAIL` = Admin email
- [ ] `ADMIN_PASSWORD` = Strong password

### Deployment
- [ ] Initial deployment triggered
- [ ] Build logs checked (no errors)
- [ ] Deployment logs checked (no errors)
- [ ] Service shows as "Live"
- [ ] Get backend URL: `https://lifted-backend.onrender.com`
- [ ] Health endpoint working: `https://lifted-backend.onrender.com/health`

### Post-Deployment
- [ ] MongoDB connection verified in logs
- [ ] All routes accessible
- [ ] Error handling working
- [ ] Logs aggregated and readable
- [ ] Auto-deploy on push working

---

## Frontend Deployment (Vercel)

### Vercel Project Setup
- [ ] Vercel account created
- [ ] GitHub connected
- [ ] Project imported: `lifted`
- [ ] Project name: `lifted`
- [ ] Framework: `Other`
- [ ] Build command: Leave empty
- [ ] Output directory: `./`

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_API_BASE_URL` = Backend URL
  - Example: `https://lifted-backend.onrender.com/api`
- [ ] `VITE_API_BASE_URL` = Backend URL
- [ ] Set for: Production, Preview, Development

### Deployment
- [ ] Initial deployment triggered
- [ ] Build logs checked (no errors)
- [ ] Deployment successful
- [ ] Frontend URL obtained: `https://lifted.vercel.app`
- [ ] Auto-deploy on push enabled

### Post-Deployment
- [ ] Frontend loads successfully
- [ ] No 404 errors
- [ ] API calls reach backend
- [ ] Browser console shows no errors
- [ ] Performance is acceptable

---

## Backend Updates (After Frontend Deployed)

### Update CORS
- [ ] Go to Render → `lifted-backend` → Environment
- [ ] Update `CLIENT_URL` = Frontend URL
  - Example: `https://lifted.vercel.app`
- [ ] Save (triggers auto-redeploy)
- [ ] Wait for redeploy to complete

---

## Integration Testing

### Backend Health Checks
```powershell
# Test health endpoint
curl https://lifted-backend.onrender.com/health

# Expected response:
# {
#   "success": true,
#   "message": "LiftED API is running",
#   "environment": "production"
# }
```
- [ ] Health endpoint responds
- [ ] Environment shows "production"
- [ ] Response time acceptable

### Frontend Health Checks
```
1. Visit https://lifted.vercel.app
2. Press F12 to open developer console
3. Check for errors
```
- [ ] Page loads without errors
- [ ] API calls are made to backend
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] Performance is acceptable

### API Endpoint Tests
```powershell
# Test GET /api/students
curl https://lifted-backend.onrender.com/api/students

# Test GET /api/donations/stats/summary
curl https://lifted-backend.onrender.com/api/donations/stats/summary

# Test POST /api/notifications (contact form)
curl -X POST https://lifted-backend.onrender.com/api/notifications `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test\"}"
```
- [ ] All GET endpoints work
- [ ] All POST endpoints work
- [ ] Status codes correct
- [ ] Responses properly formatted

### Form Submission Tests (Frontend)

#### Student Application
- [ ] Form loads
- [ ] All fields validate
- [ ] Submit creates record in MongoDB
- [ ] Confirmation message shows
- [ ] API logs show request

#### Donation
- [ ] Form loads
- [ ] Amount validates
- [ ] Stripe modal appears
- [ ] Payment processes
- [ ] Confirmation shows
- [ ] Record in MongoDB
- [ ] Email notification sent

#### Contact Form
- [ ] Form loads
- [ ] Validates required fields
- [ ] Submits to backend
- [ ] Success message shows
- [ ] Email sent to admin

#### Newsletter Signup
- [ ] Form loads
- [ ] Email validates
- [ ] Submits successfully
- [ ] Confirmation shows
- [ ] Email added to list

---

## Third-Party Service Configuration

### Email (Gmail)
- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] `EMAIL_USER` set in Render
- [ ] `EMAIL_PASSWORD` set in Render
- [ ] Test email sent successfully
- [ ] Emails reaching destination

### Stripe
- [ ] Stripe account created
- [ ] Live API keys generated (sk_live_, pk_live_)
- [ ] Keys added to Render environment
- [ ] Webhook endpoint created
- [ ] Webhook events configured
- [ ] Webhook secret added
- [ ] Test transaction successful

### Cloudinary (Optional)
- [ ] Cloudinary account created
- [ ] API credentials obtained
- [ ] Credentials added to Render
- [ ] Test upload successful
- [ ] Images loading from Cloudinary URL

### M-Pesa (Optional - Kenya)
- [ ] Daraja API account created
- [ ] Consumer key obtained
- [ ] Consumer secret obtained
- [ ] Passkey obtained
- [ ] Credentials added to Render
- [ ] Test request successful

---

## Monitoring & Logging

### Render Dashboard
- [ ] Logs visible and readable
- [ ] Error monitoring enabled
- [ ] Performance metrics visible
- [ ] Auto-redeploy working
- [ ] Alerts configured (optional)

### Vercel Dashboard
- [ ] Deployment history visible
- [ ] Performance monitoring active
- [ ] Error tracking enabled
- [ ] Analytics visible
- [ ] SSL certificate valid

### MongoDB Atlas
- [ ] Connection visible in logs
- [ ] Query performance monitored
- [ ] Storage usage monitored
- [ ] Alerts configured
- [ ] Backups visible

---

## Security Verification

### Sensitive Data
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No connection strings in code
- [ ] `.env` files not committed
- [ ] Git history cleaned (if needed)

### Production Configuration
- [ ] NODE_ENV = `production` on Render
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] HTTPS enforced (automatic on Render/Vercel)

### Credentials
- [ ] Admin password changed from default
- [ ] All API keys are production keys
- [ ] JWT secret is strong (32+ chars)
- [ ] Database password is strong
- [ ] 2FA enabled on all service accounts

---

## Performance Verification

### Frontend Performance
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals good
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Lighthouse score > 80

### Backend Performance
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Concurrent users supported

### Database Performance
- [ ] Query execution < 100ms
- [ ] Indexes optimized
- [ ] Storage usage acceptable
- [ ] Backup strategy working
- [ ] Replication working (MongoDB Atlas)

---

## Backup & Recovery

### Database Backups
- [ ] MongoDB Atlas backups enabled
- [ ] Backup frequency: daily
- [ ] Backup retention: 30 days
- [ ] Test restore procedure
- [ ] Backup location verified

### Code Backup
- [ ] Code pushed to GitHub
- [ ] Branch protection enabled
- [ ] Release tags created
- [ ] Rollback plan documented

---

## Post-Launch

### Monitoring
- [ ] Set up email alerts for errors
- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Review user activity
- [ ] Monitor infrastructure costs

### Maintenance
- [ ] Schedule regular backups
- [ ] Plan for updates/patches
- [ ] Security scans scheduled
- [ ] Dependencies audited monthly
- [ ] Admin password rotated quarterly

### Optimization
- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Identify bottlenecks
- [ ] Plan improvements
- [ ] Document lessons learned

---

## Custom Domain (Optional)

### Domain Registration
- [ ] Domain registered (e.g., lifted.ke)
- [ ] Domain registrar has access
- [ ] Auto-renewal enabled

### Frontend Domain (Vercel)
- [ ] Custom domain added in Vercel
- [ ] DNS records added
- [ ] SSL certificate provisioned
- [ ] Domain resolves correctly
- [ ] Redirect from old domain (if any)

### Backend Domain (Render)
- [ ] Custom domain added in Render
- [ ] DNS records added
- [ ] SSL certificate provisioned
- [ ] Domain resolves correctly
- [ ] Update backend environment variables

### DNS Configuration
- [ ] A records pointing to Vercel
- [ ] A records pointing to Render
- [ ] CNAME records configured
- [ ] TTL set appropriately
- [ ] DNS propagation complete (check propagationchecker.com)

---

## Final Verification

- [ ] Frontend loads at production URL
- [ ] Backend API responds at production URL
- [ ] Forms submit successfully
- [ ] Payments process correctly
- [ ] Emails send successfully
- [ ] Database records created
- [ ] Logs aggregated properly
- [ ] Monitoring dashboards working
- [ ] Backups functional
- [ ] SSL certificates valid
- [ ] Performance acceptable
- [ ] All team members notified

---

## Status Summary

**Current Status**: [ ] Ready for Production

**Completion Date**: _______________

**Deployed By**: _______________

**Deployment Notes**: 
```
[Add any deployment notes here]
```

---

## Rollback Plan

If anything goes wrong:

1. **Frontend Rollback**
   - Go to Vercel → Deployments
   - Click previous successful deployment
   - Click "Redeploy"

2. **Backend Rollback**
   - Go to Render → Service
   - Click recent deployment
   - Click "Restart"

3. **Database Rollback**
   - Go to MongoDB Atlas → Backups
   - Select backup point-in-time
   - Click "Restore"

---

**Deployment Documentation Created**: November 2025
**Last Updated**: [Automatic]
**Version**: 1.0
