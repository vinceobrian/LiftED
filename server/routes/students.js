const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const studentController = require('../controllers/studentController');
const { protect, authorize, checkVerified } = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all approved students
// @access  Public
router.get('/', studentController.getAllStudents);

// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Public
router.get('/:id', studentController.getStudent);

// @route   POST /api/students
// @desc    Create student profile/application
// @access  Private (Students only)
router.post('/', protect, authorize('student', 'admin'), [
    body('institution').trim().notEmpty().withMessage('Institution is required'),
    body('course').trim().notEmpty().withMessage('Course is required'),
    body('yearOfStudy').isInt({ min: 1, max: 10 }).withMessage('Valid year of study is required'),
    body('amountNeeded').isInt({ min: 1000 }).withMessage('Amount needed must be at least KSh 1,000'),
    body('fundingType').isIn(['tuition', 'exam', 'books', 'accommodation', 'medical', 'research', 'other']),
    body('story').isLength({ min: 100, max: 2000 }).withMessage('Story must be between 100 and 2000 characters')
], studentController.createStudent);

// @route   PUT /api/students/:id
// @desc    Update student profile
// @access  Private (Student owner or Admin)
router.put('/:id', protect, studentController.updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student profile
// @access  Private (Student owner or Admin)
router.delete('/:id', protect, studentController.deleteStudent);

// @route   GET /api/students/user/:userId
// @desc    Get student profile by user ID
// @access  Private
router.get('/user/:userId', protect, studentController.getStudentByUser);

// @route   POST /api/students/:id/update
// @desc    Add update to student profile
// @access  Private (Student owner only)
router.post('/:id/update', protect, [
    body('title').trim().notEmpty().withMessage('Update title is required'),
    body('message').trim().notEmpty().withMessage('Update message is required')
], studentController.addUpdate);

// @route   PUT /api/students/:id/approve
// @desc    Approve student application
// @access  Private (Admin only)
router.put('/:id/approve', protect, authorize('admin'), studentController.approveStudent);

// @route   PUT /api/students/:id/reject
// @desc    Reject student application
// @access  Private (Admin only)
router.put('/:id/reject', protect, authorize('admin'), [
    body('reason').trim().notEmpty().withMessage('Rejection reason is required')
], studentController.rejectStudent);

// @route   GET /api/students/search/:query
// @desc    Search students
// @access  Public
router.get('/search/:query', studentController.searchStudents);

// @route   GET /api/students/filter/:category
// @desc    Filter students by category
// @access  Public
router.get('/filter/:category', studentController.filterStudents);

// @route   PUT /api/students/:id/view
// @desc    Increment view count
// @access  Public
router.put('/:id/view', studentController.incrementViews);

// @route   PUT /api/students/:id/share
// @desc    Increment share count
// @access  Public
router.put('/:id/share', studentController.incrementShares);

module.exports = router;


