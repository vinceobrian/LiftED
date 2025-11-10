const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, (req, res) => {
    res.json({ success: true, message: 'Get notifications endpoint' });
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, (req, res) => {
    res.json({ success: true, message: 'Mark notification as read endpoint' });
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, (req, res) => {
    res.json({ success: true, message: 'Delete notification endpoint' });
});

module.exports = router;


