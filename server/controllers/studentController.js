const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all approved students
// @route   GET /api/students
// @access  Public
exports.getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', urgent, fundingType } = req.query;
        
        const query = { status: 'approved', isActive: true };
        
        if (urgent === 'true') query.urgent = true;
        if (fundingType) query.fundingType = fundingType;

        const students = await Student.find(query)
            .populate('user', 'firstName lastName avatar')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort)
            .exec();

        const count = await Student.countDocuments(query);

        res.json({
            success: true,
            students,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'firstName lastName email phone avatar')
            .populate('verifiedBy', 'firstName lastName');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
};

// @desc    Create student profile
// @route   POST /api/students
// @access  Public
exports.createStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Extract student data
        const {
            institution,
            course,
            yearOfStudy,
            year,
            amountNeeded,
            fundingType,
            story,
            firstName,
            lastName,
            email,
            phone,
            studentId,
            urgent,
            daysLeft
        } = req.body;

        // Determine year (accept both yearOfStudy and year)
        const studentYear = year || yearOfStudy || 1;

        // For public submissions (not authenticated), create or find user
        let userId = req.user?.id;
        
        if (!userId) {
            // Check if user exists by email
            let user = await User.findOne({ email });
            
            if (!user) {
                // Create new user for public application
                // Generate a temporary password
                const tempPassword = Math.random().toString(36).slice(-8);
                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password: tempPassword,
                    role: 'student',
                    verified: false // Require email verification
                });
            }
            userId = user._id;
        }

        // Check if user already has a pending student profile
        const existingProfile = await Student.findOne({ 
            user: userId,
            status: { $in: ['pending', 'approved'] }
        });
        
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active student application'
            });
        }

        const studentData = {
            user: userId,
            institution,
            course,
            yearOfStudy: studentYear,
            amountNeeded: parseInt(amountNeeded),
            fundingType: fundingType || 'tuition',
            story,
            studentId: studentId || undefined,
            urgent: urgent === 'true' || urgent === true || false,
            daysLeft: daysLeft ? parseInt(daysLeft) : 30,
            status: 'pending' // Require admin approval
        };

        const student = await Student.create(studentData);

        // Update user with student profile reference
        await User.findByIdAndUpdate(userId, { studentProfile: student._id });

        // Populate user data before sending response
        await student.populate('user', 'firstName lastName email phone');

        // Send confirmation email to student
        // (implement email notification with next steps)

        res.status(201).json({
            success: true,
            message: 'Student profile created successfully. Your application is pending review. You will receive an email confirmation shortly.',
            student: {
                id: student._id,
                firstName: student.firstName || firstName,
                lastName: student.lastName || lastName,
                course: student.course,
                institution: student.institution,
                status: student.status,
                amountNeeded: student.amountNeeded
            }
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Student owner or Admin)
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check authorization
        if (student.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        // Don't allow updating certain fields if approved
        if (student.status === 'approved') {
            const restrictedFields = ['amountNeeded', 'fundingType', 'institution', 'course'];
            restrictedFields.forEach(field => delete req.body[field]);
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email');

        res.json({
            success: true,
            message: 'Student profile updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student profile'
        });
    }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private (Student owner or Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check authorization
        if (student.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this profile'
            });
        }

        // Soft delete - just mark as inactive
        student.isActive = false;
        await student.save();

        res.json({
            success: true,
            message: 'Student profile deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student profile'
        });
    }
};

// @desc    Get student by user ID
// @route   GET /api/students/user/:userId
// @access  Private
exports.getStudentByUser = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.params.userId })
            .populate('user', 'firstName lastName email phone avatar');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Get student by user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student profile'
        });
    }
};

// @desc    Add update to student profile
// @route   POST /api/students/:id/update
// @access  Private (Student owner only)
exports.addUpdate = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check authorization
        if (student.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add updates to this profile'
            });
        }

        student.updates.push({
            title: req.body.title,
            message: req.body.message
        });

        await student.save();

        // Notify donors (implement notification logic here)

        res.json({
            success: true,
            message: 'Update added successfully',
            student
        });
    } catch (error) {
        console.error('Add update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding update'
        });
    }
};

// @desc    Approve student application
// @route   PUT /api/students/:id/approve
// @access  Private (Admin only)
exports.approveStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student.status = 'approved';
        student.verifiedBy = req.user.id;
        student.verifiedAt = new Date();
        
        await student.save();

        // Send approval email to student
        // (implement email notification)

        res.json({
            success: true,
            message: 'Student application approved',
            student
        });
    } catch (error) {
        console.error('Approve student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving student'
        });
    }
};

// @desc    Reject student application
// @route   PUT /api/students/:id/reject
// @access  Private (Admin only)
exports.rejectStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student.status = 'rejected';
        student.adminNotes = req.body.reason;
        
        await student.save();

        // Send rejection email to student
        // (implement email notification)

        res.json({
            success: true,
            message: 'Student application rejected',
            student
        });
    } catch (error) {
        console.error('Reject student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting student'
        });
    }
};

// @desc    Search students
// @route   GET /api/students/search/:query
// @access  Public
exports.searchStudents = async (req, res) => {
    try {
        const students = await Student.find({
            $text: { $search: req.params.query },
            status: 'approved',
            isActive: true
        }).populate('user', 'firstName lastName avatar');

        res.json({
            success: true,
            students,
            count: students.length
        });
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching students'
        });
    }
};

// @desc    Filter students by category
// @route   GET /api/students/filter/:category
// @access  Public
exports.filterStudents = async (req, res) => {
    try {
        const { category } = req.params;
        const query = { status: 'approved', isActive: true };

        if (category === 'urgent') {
            query.urgent = true;
        } else {
            query.fundingType = category;
        }

        const students = await Student.find(query)
            .populate('user', 'firstName lastName avatar')
            .sort('-createdAt');

        res.json({
            success: true,
            students,
            count: students.length
        });
    } catch (error) {
        console.error('Filter students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error filtering students'
        });
    }
};

// @desc    Increment view count
// @route   PUT /api/students/:id/view
// @access  Public
exports.incrementViews = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        
        res.json({
            success: true
        });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating views'
        });
    }
};

// @desc    Increment share count
// @route   PUT /api/students/:id/share
// @access  Public
exports.incrementShares = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
        
        res.json({
            success: true
        });
    } catch (error) {
        console.error('Increment shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating shares'
        });
    }
};


