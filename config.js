// LiftED Configuration File
// Customize these settings to match your organization's needs

const CONFIG = {
    // Brand Information
    brand: {
        name: "LiftED",
        tagline: "Lifting Students, One Dream at a Time",
        email: "info@lifted.ke",
        phone: "+254 700 000 000",
        location: "Nairobi, Kenya",
        website: "https://lifted.ke"
    },

    // Platform Settings
    platform: {
        currency: "KSh",
        currencySymbol: "₵",
        minDonation: 100,
        maxDonation: 1000000,
        applicationReviewTime: "48 hours",
        defaultCampaignDuration: 30 // days
    },

    // Payment Methods
    paymentMethods: [
        {
            id: "mpesa",
            name: "M-Pesa",
            description: "Mobile money payment",
            enabled: true
        },
        {
            id: "card",
            name: "Credit/Debit Card",
            description: "Visa, Mastercard, American Express",
            enabled: true
        },
        {
            id: "bank",
            name: "Bank Transfer",
            description: "Direct bank transfer",
            enabled: true
        }
    ],

    // Funding Types
    fundingTypes: [
        {
            id: "tuition",
            name: "Tuition Fees",
            description: "Academic tuition and fees"
        },
        {
            id: "exam",
            name: "Exam Fees",
            description: "Examination and assessment fees"
        },
        {
            id: "books",
            name: "Books & Materials",
            description: "Textbooks and learning materials"
        },
        {
            id: "accommodation",
            name: "Accommodation",
            description: "Housing and living expenses"
        },
        {
            id: "medical",
            name: "Medical Emergency",
            description: "Medical expenses and emergencies"
        },
        {
            id: "other",
            name: "Other",
            description: "Other educational expenses"
        }
    ],

    // Social Media Links
    socialMedia: {
        facebook: "https://facebook.com/lifted",
        twitter: "https://twitter.com/lifted_ke",
        instagram: "https://instagram.com/lifted_ke",
        linkedin: "https://linkedin.com/company/lifted"
    },

    // Analytics and Tracking
    analytics: {
        googleAnalyticsId: "", // Add your GA tracking ID
        facebookPixelId: "",   // Add your Facebook Pixel ID
        hotjarId: ""          // Add your Hotjar site ID
    },

    // Feature Flags
    features: {
        enableEmailNotifications: false,
        enableSMSNotifications: false,
        enableSocialSharing: true,
        enableAnonymousDonations: true,
        enableRecurringDonations: false,
        enableDonorComments: true,
        enableStudentUpdates: true
    },

    // API Endpoints (for future backend integration)
    api: {
        baseUrl: "https://api.lifted.ke",
        endpoints: {
            students: "/api/students",
            donations: "/api/donations",
            applications: "/api/applications",
            notifications: "/api/notifications"
        }
    },

    // Localization
    localization: {
        defaultLanguage: "en",
        supportedLanguages: ["en", "sw"], // English, Swahili
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h"
    },

    // Security Settings
    security: {
        enableHTTPS: true,
        enableCSP: true,
        enableHSTS: true,
        sessionTimeout: 30 // minutes
    },

    // Performance Settings
    performance: {
        enableCaching: true,
        enableCompression: true,
        enableCDN: false,
        lazyLoadImages: true
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
