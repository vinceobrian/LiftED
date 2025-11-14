const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Donation amount is required'],
        min: [100, 'Minimum donation is KSh 100']
    },
    currency: {
        type: String,
        default: 'KES',
        enum: ['KES', 'USD', 'EUR', 'GBP']
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'bank', 'paypal'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    mpesaReceiptNumber: String,
    stripePaymentIntentId: String,
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    receiveUpdates: {
        type: Boolean,
        default: true
    },
    // Fee breakdown
    platformFee: {
        type: Number,
        default: 0
    },
    paymentProcessingFee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    // Receipt and tax
    receiptSent: {
        type: Boolean,
        default: false
    },
    receiptSentAt: Date,
    taxDeductible: {
        type: Boolean,
        default: false
    },
    // Tracking
    ipAddress: String,
    userAgent: String,
    // Refund information
    refundReason: String,
    refundedAt: Date,
    refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate net amount before saving
donationSchema.pre('save', function(next) {
    if (this.isNew) {
        // Platform takes 5% fee
        this.platformFee = this.amount * 0.05;
        // Payment processing fee varies by method
        if (this.paymentMethod === 'mpesa') {
            this.paymentProcessingFee = this.amount * 0.01; // 1%
        } else if (this.paymentMethod === 'card') {
            this.paymentProcessingFee = this.amount * 0.029 + 30; // Stripe fees
        }
        this.netAmount = this.amount - this.platformFee - this.paymentProcessingFee;
    }
    next();
});

// Index for query optimization
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ student: 1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });
// transactionId is already unique via schema definition above

module.exports = mongoose.model('Donation', donationSchema);


