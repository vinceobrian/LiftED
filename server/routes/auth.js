const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').matches(/^(\+254|0)[0-9]{9}$/).withMessage('Valid Kenyan phone number is required'),
    body('role').optional().isIn(['student', 'donor']).withMessage('Invalid role')
], authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], authController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', protect, [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().matches(/^(\+254|0)[0-9]{9}$/)
], authController.updateProfile);

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], authController.updatePassword);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], authController.resetPassword);

// @route   GET /api/auth/verify/:token
// @desc    Verify email
// @access  Public
router.get('/verify/:token', authController.verifyEmail);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], authController.resendVerification);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, authController.logout);

module.exports = router;


