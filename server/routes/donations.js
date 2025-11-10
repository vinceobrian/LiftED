const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

// @route   GET /api/donations
// @desc    Get all donations (admin) or user's donations
// @access  Private
router.get('/', protect, donationController.getDonations);

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private
router.get('/:id', protect, donationController.getDonation);

// @route   POST /api/donations
// @desc    Create new donation
// @access  Private
router.post('/', protect, [
    body('student').notEmpty().withMessage('Student ID is required'),
    body('amount').isInt({ min: 100 }).withMessage('Minimum donation is KSh 100'),
    body('paymentMethod').isIn(['mpesa', 'card', 'bank', 'paypal']).withMessage('Invalid payment method')
], donationController.createDonation);

// @route   GET /api/donations/student/:studentId
// @desc    Get donations for a specific student
// @access  Public
router.get('/student/:studentId', donationController.getStudentDonations);

// @route   GET /api/donations/user/:userId
// @desc    Get user's donation history
// @access  Private
router.get('/user/:userId', protect, donationController.getUserDonations);

// @route   PUT /api/donations/:id/refund
// @desc    Request donation refund
// @access  Private
router.put('/:id/refund', protect, [
    body('reason').trim().notEmpty().withMessage('Refund reason is required')
], donationController.requestRefund);

// @route   GET /api/donations/stats/summary
// @desc    Get donation statistics
// @access  Private (Admin)
router.get('/stats/summary', protect, donationController.getDonationStats);

module.exports = router;


