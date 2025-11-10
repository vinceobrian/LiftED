const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    institution: {
        type: String,
        required: [true, 'Institution is required'],
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
    yearOfStudy: {
        type: Number,
        required: [true, 'Year of study is required'],
        min: 1,
        max: 10
    },
    studentId: {
        type: String,
        trim: true
    },
    amountNeeded: {
        type: Number,
        required: [true, 'Amount needed is required'],
        min: [1000, 'Minimum amount is KSh 1,000']
    },
    amountRaised: {
        type: Number,
        default: 0
    },
    fundingType: {
        type: String,
        enum: ['tuition', 'exam', 'books', 'accommodation', 'medical', 'research', 'other'],
        required: [true, 'Funding type is required']
    },
    story: {
        type: String,
        required: [true, 'Story is required'],
        minlength: [100, 'Story must be at least 100 characters'],
        maxlength: [2000, 'Story cannot exceed 2000 characters']
    },
    documents: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    urgent: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date
    },
    achievements: [{
        type: String
    }],
    // Verification documents
    admissionLetter: {
        fileUrl: String,
        verified: {
            type: Boolean,
            default: false
        }
    },
    feeStatement: {
        fileUrl: String,
        verified: {
            type: Boolean,
            default: false
        }
    },
    // Admin notes
    adminNotes: String,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    // Campaign tracking
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    donorCount: {
        type: Number,
        default: 0
    },
    // Milestones and updates
    updates: [{
        title: String,
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    completedAt: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate progress percentage
studentSchema.virtual('progressPercentage').get(function() {
    return Math.min(Math.round((this.amountRaised / this.amountNeeded) * 100), 100);
});

// Calculate remaining amount
studentSchema.virtual('remainingAmount').get(function() {
    return Math.max(this.amountNeeded - this.amountRaised, 0);
});

// Calculate days left
studentSchema.virtual('daysLeft').get(function() {
    if (!this.deadline) return null;
    const now = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

// Ensure virtuals are included
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Index for search optimization
studentSchema.index({ course: 'text', institution: 'text', story: 'text' });
studentSchema.index({ status: 1, isActive: 1 });
studentSchema.index({ urgent: -1, createdAt: -1 });

module.exports = mongoose.model('Student', studentSchema);


