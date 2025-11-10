const Donation = require('../models/Donation');
const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get donations
// @route   GET /api/donations
// @access  Private
exports.getDonations = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { donor: req.user.id };
        
        const donations = await Donation.find(query)
            .populate('donor', 'firstName lastName email')
            .populate('student')
            .sort('-createdAt');

        res.json({
            success: true,
            donations,
            count: donations.length
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donations'
        });
    }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
exports.getDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'firstName lastName email')
            .populate('student');

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Check authorization
        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this donation'
            });
        }

        res.json({
            success: true,
            donation
        });
    } catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donation'
        });
    }
};

// @desc    Create donation
// @route   POST /api/donations
// @access  Private
exports.createDonation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { student, amount, paymentMethod, message, anonymous, receiveUpdates } = req.body;

        // Check if student exists and is active
        const studentProfile = await Student.findById(student);
        if (!studentProfile || !studentProfile.isActive || studentProfile.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Invalid student profile'
            });
        }

        // Generate transaction ID
        const transactionId = `LIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create donation
        const donation = await Donation.create({
            donor: req.user.id,
            student,
            amount,
            paymentMethod,
            message,
            anonymous: anonymous || false,
            receiveUpdates: receiveUpdates !== false,
            transactionId,
            paymentStatus: 'pending',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // In a real implementation, this would initiate the actual payment process
        // For now, we'll mark it as completed (simulated)
        donation.paymentStatus = 'completed';
        await donation.save();

        // Update student's raised amount and donor count
        studentProfile.amountRaised += donation.netAmount;
        studentProfile.donorCount += 1;
        
        // Check if goal reached
        if (studentProfile.amountRaised >= studentProfile.amountNeeded) {
            studentProfile.status = 'completed';
            studentProfile.completedAt = new Date();
        }
        
        await studentProfile.save();

        // Update donor statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                totalDonations: amount,
                donationCount: 1
            }
        });

        // Send confirmation email
        // (implement email notification)

        // Emit real-time update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('newDonation', {
                studentId: student,
                amount: donation.netAmount,
                anonymous
            });
        }

        res.status(201).json({
            success: true,
            message: 'Donation successful! Thank you for your generosity.',
            donation
        });
    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing donation'
        });
    }
};

// @desc    Get student donations
// @route   GET /api/donations/student/:studentId
// @access  Public
exports.getStudentDonations = async (req, res) => {
    try {
        const donations = await Donation.find({
            student: req.params.studentId,
            paymentStatus: 'completed'
        })
        .populate('donor', 'firstName lastName avatar')
        .sort('-createdAt')
        .limit(20);

        // Filter out donor info for anonymous donations
        const filteredDonations = donations.map(donation => {
            if (donation.anonymous) {
                donation.donor = null;
            }
            return donation;
        });

        res.json({
            success: true,
            donations: filteredDonations,
            count: filteredDonations.length
        });
    } catch (error) {
        console.error('Get student donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student donations'
        });
    }
};

// @desc    Get user donation history
// @route   GET /api/donations/user/:userId
// @access  Private
exports.getUserDonations = async (req, res) => {
    try {
        // Check authorization
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const donations = await Donation.find({ donor: req.params.userId })
            .populate('student')
            .sort('-createdAt');

        const totalDonated = donations.reduce((sum, donation) => {
            return sum + (donation.paymentStatus === 'completed' ? donation.amount : 0);
        }, 0);

        res.json({
            success: true,
            donations,
            count: donations.length,
            totalDonated
        });
    } catch (error) {
        console.error('Get user donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user donations'
        });
    }
};

// @desc    Request refund
// @route   PUT /api/donations/:id/refund
// @access  Private
exports.requestRefund = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Check authorization
        if (donation.donor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if refund is possible
        if (donation.paymentStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed donations can be refunded'
            });
        }

        // Check refund time limit (e.g., 7 days)
        const daysSinceDonation = (new Date() - donation.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceDonation > 7) {
            return res.status(400).json({
                success: false,
                message: 'Refund period has expired (7 days)'
            });
        }

        donation.paymentStatus = 'refunded';
        donation.refundReason = req.body.reason;
        donation.refundedAt = new Date();
        donation.refundedBy = req.user.id;
        
        await donation.save();

        // Update student's raised amount
        const student = await Student.findById(donation.student);
        if (student) {
            student.amountRaised -= donation.netAmount;
            student.donorCount -= 1;
            await student.save();
        }

        // Process actual refund
        // (implement payment gateway refund logic)

        res.json({
            success: true,
            message: 'Refund processed successfully',
            donation
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund'
        });
    }
};

// @desc    Get donation statistics
// @route   GET /api/donations/stats/summary
// @access  Private (Admin)
exports.getDonationStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments({ paymentStatus: 'completed' });
        
        const totalAmountResult = await Donation.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const totalAmount = totalAmountResult[0]?.total || 0;
        const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

        const topDonors = await Donation.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: '$donor', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            stats: {
                totalDonations,
                totalAmount,
                averageDonation,
                topDonors
            }
        });
    } catch (error) {
        console.error('Get donation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donation statistics'
        });
    }
};


