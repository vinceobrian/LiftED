/**
 * LiftED Production Configuration
 * Update these values for your production deployment
 */

const CONFIG = {
    // ============================================
    // DEPLOYMENT CONFIGURATION
    // ============================================
    
    // Backend URL (where Render API is hosted)
    // Development: http://localhost:5000
    // Production: https://lifted-backend.onrender.com
    BACKEND_URL: process.env.VITE_API_BASE_URL || 
                 process.env.NEXT_PUBLIC_API_BASE_URL || 
                 'http://localhost:5000',
    
    // Frontend URL (where Vercel frontend is hosted)
    // Development: http://localhost:3000
    // Production: https://lifted.vercel.app
    FRONTEND_URL: typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000',
    
    // ============================================
    // SERVICES
    // ============================================
    
    // MongoDB Atlas configuration
    MONGODB: {
        // Connection string format:
        // mongodb+srv://username:password@cluster.mongodb.net/lifted
        // Get from: mongodb.com/cloud/atlas
        ATLAS_CLUSTER: 'cluster.mongodb.net',
        DATABASE_NAME: 'lifted'
    },
    
    // Stripe configuration
    STRIPE: {
        // Get from: stripe.com/dashboard/apikeys
        // Use sk_live_* and pk_live_* for production
        PUBLISHABLE_KEY_DEV: 'pk_test_4eC39HqLyjWDarhtT657A1B2',
        PUBLISHABLE_KEY_PROD: 'pk_live_REPLACE_WITH_LIVE_KEY',
        
        // Test mode: use test keys
        // Live mode: use live keys (sk_live_*, pk_live_*)
        MODE: 'test' // or 'live'
    },
    
    // M-Pesa configuration (Daraja API)
    MPESA: {
        SHORTCODE: '174379',
        // Get from: developer.safaricom.co.ke
        CONSUMER_KEY_SANDBOX: 'test_key',
        CONSUMER_KEY_LIVE: 'REPLACE_WITH_LIVE_KEY'
    },
    
    // Email configuration
    EMAIL: {
        // Gmail: use app password from myaccount.google.com
        // SendGrid: use API key from sendgrid.com
        PROVIDER: 'gmail', // or 'sendgrid'
        FROM: 'noreply@lifted.ke'
    },
    
    // Cloudinary file storage
    CLOUDINARY: {
        // Get from: cloudinary.com/console
        CLOUD_NAME: 'lifted_dev',
        UPLOAD_PRESET: 'lifted_uploads'
    },
    
    // ============================================
    // SECURITY
    // ============================================
    
    // Rate limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100 // per window
    },
    
    // JWT token
    JWT: {
        EXPIRE: '7d',
        // Secret should be at least 32 characters
        // Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        SECRET: 'REPLACE_WITH_SECURE_SECRET'
    },
    
    // CORS settings
    CORS: {
        // Development
        ORIGINS_DEV: [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000'
        ],
        
        // Production
        ORIGINS_PROD: [
            'https://lifted.vercel.app',
            'https://lifted-backend.onrender.com',
            'https://lifted.ke' // your custom domain
        ]
    },
    
    // ============================================
    // ENVIRONMENT DETECTION
    // ============================================
    
    IS_PRODUCTION: typeof process !== 'undefined' 
        ? process.env.NODE_ENV === 'production'
        : false,
    
    IS_DEVELOPMENT: typeof process !== 'undefined'
        ? process.env.NODE_ENV === 'development'
        : true,
    
    // ============================================
    // API ENDPOINTS
    // ============================================
    
    API: {
        STUDENTS: '/students',
        DONATIONS: '/donations',
        PAYMENTS: '/payments',
        AUTH: '/auth',
        USERS: '/users',
        NOTIFICATIONS: '/notifications',
        UPLOAD: '/upload'
    },
    
    // ============================================
    // FEATURE FLAGS
    // ============================================
    
    FEATURES: {
        // Enable payment processing
        ENABLE_STRIPE: true,
        ENABLE_MPESA: false, // Enable M-Pesa when credentials ready
        
        // Enable notifications
        ENABLE_EMAIL: true,
        ENABLE_NOTIFICATIONS: true,
        
        // Enable file uploads
        ENABLE_UPLOADS: true,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        
        // Enable admin panel
        ENABLE_ADMIN: true
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get appropriate Stripe key based on environment
 */
CONFIG.getStripeKey = function() {
    return this.IS_PRODUCTION ? this.STRIPE.PUBLISHABLE_KEY_PROD : this.STRIPE.PUBLISHABLE_KEY_DEV;
};

/**
 * Get CORS origins based on environment
 */
CONFIG.getCorsOrigins = function() {
    return this.IS_PRODUCTION ? this.CORS.ORIGINS_PROD : this.CORS.ORIGINS_DEV;
};

/**
 * Get complete API URL
 */
CONFIG.getApiUrl = function(endpoint) {
    return this.BACKEND_URL + '/api' + endpoint;
};

/**
 * Validate configuration
 */
CONFIG.validate = function() {
    const errors = [];
    
    if (!this.BACKEND_URL) errors.push('BACKEND_URL is not set');
    if (!this.JWT.SECRET || this.JWT.SECRET === 'REPLACE_WITH_SECURE_SECRET') {
        errors.push('JWT_SECRET must be configured');
    }
    
    if (errors.length > 0) {
        console.error('Configuration errors:', errors);
        return false;
    }
    
    return true;
};

// Export for use in Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
