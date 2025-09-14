// LiftED - Student Crowdfunding Platform JavaScript

// Global variables
let students = [];
let currentStudent = null;

// Sample student data
const sampleStudents = [
    {
        id: 1,
        firstName: "Grace",
        lastName: "Mwangi",
        course: "Medicine",
        institution: "University of Nairobi",
        year: 3,
        amountNeeded: 150000,
        amountRaised: 75000,
        story: "I'm a third-year medical student with a passion for helping underserved communities. My family has been struggling financially, and I need support to complete my studies and become a doctor who can serve rural areas.",
        fundingType: "tuition",
        urgent: true,
        daysLeft: 15,
        documents: ["admission_letter.pdf", "fee_statement.pdf"],
        progress: 50,
        email: "grace.mwangi@example.com",
        phone: "+254700123456"
    },
    {
        id: 2,
        firstName: "Peter",
        lastName: "Ochieng",
        course: "Computer Science",
        institution: "Strathmore University",
        year: 2,
        amountNeeded: 80000,
        amountRaised: 32000,
        story: "I'm studying Computer Science and have been developing mobile apps to help small businesses. I need financial support to continue my education and eventually create tech solutions for African problems.",
        fundingType: "tuition",
        urgent: false,
        daysLeft: 45,
        documents: ["admission_letter.pdf"],
        progress: 40,
        email: "peter.ochieng@example.com",
        phone: "+254700234567"
    },
    {
        id: 3,
        firstName: "Mary",
        lastName: "Wanjiku",
        course: "Engineering",
        institution: "JKUAT",
        year: 4,
        amountNeeded: 120000,
        amountRaised: 96000,
        story: "I'm in my final year of Civil Engineering. I've maintained excellent grades and have been involved in community projects. I need support to complete my final year and graduate.",
        fundingType: "tuition",
        urgent: false,
        daysLeft: 30,
        documents: ["admission_letter.pdf", "transcript.pdf"],
        progress: 80,
        email: "mary.wanjiku@example.com",
        phone: "+254700345678"
    },
    {
        id: 4,
        firstName: "David",
        lastName: "Kimani",
        course: "Business Administration",
        institution: "Kenyatta University",
        year: 1,
        amountNeeded: 60000,
        amountRaised: 12000,
        story: "I'm a first-year business student with dreams of starting my own company. My family runs a small business, and I want to learn how to scale it and create employment opportunities.",
        fundingType: "tuition",
        urgent: true,
        daysLeft: 20,
        documents: ["admission_letter.pdf"],
        progress: 20,
        email: "david.kimani@example.com",
        phone: "+254700456789"
    },
    {
        id: 5,
        firstName: "Sarah",
        lastName: "Akinyi",
        course: "Nursing",
        institution: "Moi University",
        year: 2,
        amountNeeded: 70000,
        amountRaised: 35000,
        story: "I'm studying Nursing and have been volunteering at local clinics. I want to specialize in maternal health and help reduce maternal mortality rates in rural areas.",
        fundingType: "medical",
        urgent: false,
        daysLeft: 60,
        documents: ["admission_letter.pdf", "volunteer_certificate.pdf"],
        progress: 50,
        email: "sarah.akinyi@example.com",
        phone: "+254700567890"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load sample data
    students = [...sampleStudents];
    
    // Initialize event listeners
    setupEventListeners();
    
    // Load students
    loadStudents();
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup form validation
    setupFormValidation();
    
    console.log('LiftED application initialized successfully');
}

// Event Listeners Setup
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterStudents(filter);
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Student form submission
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentFormSubmission);
    }
    
    // Donation form submission
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationFormSubmission);
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmission);
    }
    
    // Quick amount buttons
    const quickAmountButtons = document.querySelectorAll('.quick-amount');
    quickAmountButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            document.getElementById('donationAmount').value = amount;
        });
    });
    
    // Modal close on outside click
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Mobile Navigation Setup
function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Form Validation Setup
function setupFormValidation() {
    // Real-time validation for student form
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        const inputs = studentForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Real-time validation for donation form
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        const inputs = donationForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
}

// Student Management Functions
function loadStudents(filter = 'all') {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;
    
    let filteredStudents = students;
    
    if (filter !== 'all') {
        filteredStudents = students.filter(student => {
            if (filter === 'urgent') return student.urgent;
            if (filter === 'medical') return student.fundingType === 'medical';
            if (filter === 'tuition') return student.fundingType === 'tuition';
            return true;
        });
    }
    
    studentsGrid.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        studentsGrid.innerHTML = `
            <div class="no-students">
                <i class="fas fa-graduation-cap"></i>
                <h3>No students found</h3>
                <p>Try adjusting your filters or check back later for new applications.</p>
            </div>
        `;
        return;
    }
    
    filteredStudents.forEach(student => {
        const studentCard = createStudentCard(student);
        studentsGrid.appendChild(studentCard);
    });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    const progressPercentage = Math.round((student.amountRaised / student.amountNeeded) * 100);
    const urgentBadge = student.urgent ? '<div class="urgent-badge">URGENT</div>' : '';
    
    card.innerHTML = `
        <div class="student-header">
            ${urgentBadge}
            <div class="student-avatar">
                ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
            </div>
            <div class="student-name">${student.firstName} ${student.lastName}</div>
            <div class="student-course">${student.course} - ${student.institution}</div>
        </div>
        <div class="student-body">
            <div class="student-story">
                ${student.story}
            </div>
            <div class="progress-section">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-info">
                    <span class="amount-raised">KShs ${student.amountRaised.toLocaleString()}</span>
                    <span class="amount-needed">KShs ${student.amountNeeded.toLocaleString()}</span>
                </div>
            </div>
        </div>
        <div class="student-footer">
            <div class="days-left">
                <i class="fas fa-clock"></i>
                ${student.daysLeft} days left
            </div>
            <button class="donate-btn" onclick="openDonationModal(${student.id})">
                <i class="fas fa-heart"></i>
                Donate Now
            </button>
        </div>
    `;
    
    return card;
}

function filterStudents(filter) {
    loadStudents(filter);
}

// Modal Functions
function openStudentForm() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeStudentForm() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetStudentForm();
    }
}

function openDonationModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudent = student;
    const modal = document.getElementById('donationModal');
    const studentInfo = document.getElementById('donationStudentInfo');
    
    if (modal && studentInfo) {
        studentInfo.innerHTML = `
            <h3>${student.firstName} ${student.lastName}</h3>
            <p><strong>Course:</strong> ${student.course} - ${student.institution}</p>
            <p><strong>Amount Needed:</strong> KShs ${student.amountNeeded.toLocaleString()}</p>
            <p><strong>Amount Raised:</strong> KShs ${student.amountRaised.toLocaleString()}</p>
            <p><strong>Progress:</strong> ${Math.round((student.amountRaised / student.amountNeeded) * 100)}%</p>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetDonationForm();
        currentStudent = null;
    }
}

function openSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageElement = document.getElementById('successMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form Handling Functions
function handleStudentFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateStudentForm(form)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Create new student object
        const newStudent = {
            id: students.length + 1,
            firstName: formData.get('firstName') || document.getElementById('firstName').value,
            lastName: formData.get('lastName') || document.getElementById('lastName').value,
            course: document.getElementById('course').value,
            institution: document.getElementById('institution').value,
            year: parseInt(document.getElementById('year').value),
            amountNeeded: parseInt(document.getElementById('amountNeeded').value),
            amountRaised: 0,
            story: document.getElementById('story').value,
            fundingType: document.getElementById('fundingType').value,
            urgent: false,
            daysLeft: 30,
            documents: [],
            progress: 0,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        
        // Add to students array
        students.unshift(newStudent);
        
        // Reset form and close modal
        resetStudentForm();
        closeStudentForm();
        
        // Reload students
        loadStudents();
        
        // Show success message
        openSuccessModal('Your application has been submitted successfully! We will review it and get back to you within 48 hours.');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        console.log('New student application submitted:', newStudent);
    }, 2000);
}

function handleDonationFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Validate form
    if (!validateDonationForm(form)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    // Simulate donation processing
    setTimeout(() => {
        const amount = parseInt(document.getElementById('donationAmount').value);
        const donorName = document.getElementById('donorName').value;
        const donorEmail = document.getElementById('donorEmail').value;
        const message = document.getElementById('donorMessage').value;
        const anonymous = document.getElementById('anonymous').checked;
        
        // Update student's raised amount
        if (currentStudent) {
            currentStudent.amountRaised += amount;
            currentStudent.progress = Math.round((currentStudent.amountRaised / currentStudent.amountNeeded) * 100);
            
            // Update the student in the array
            const studentIndex = students.findIndex(s => s.id === currentStudent.id);
            if (studentIndex !== -1) {
                students[studentIndex] = currentStudent;
            }
        }
        
        // Reset form and close modal
        resetDonationForm();
        closeDonationModal();
        
        // Reload students to show updated progress
        loadStudents();
        
        // Show success message
        const displayName = anonymous ? 'Anonymous Donor' : donorName;
        openSuccessModal(`Thank you ${displayName}! Your donation of KShs${amount.toLocaleString()} has been processed successfully.`);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        console.log('Donation processed:', {
            amount,
            donorName,
            donorEmail,
            message,
            anonymous,
            studentId: currentStudent?.id
        });
    }, 2000);
}

function handleContactFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        openSuccessModal('Thank you for your message! We will get back to you within 24 hours.');
        
        console.log('Contact form submitted:', {
            name: formData.get('contactName') || document.getElementById('contactName').value,
            email: formData.get('contactEmail') || document.getElementById('contactEmail').value,
            message: formData.get('contactMessage') || document.getElementById('contactMessage').value
        });
    }, 1500);
}

// Form Validation Functions
function validateStudentForm(form) {
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone', 'institution', 
        'course', 'year', 'amountNeeded', 'fundingType', 'story'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate terms checkbox
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
        showFieldError(termsCheckbox, 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function validateDonationForm(form) {
    const requiredFields = ['donorName', 'donorEmail', 'donationAmount', 'paymentMethod'];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate donation amount
    const amountField = document.getElementById('donationAmount');
    if (amountField) {
        const amount = parseInt(amountField.value);
        if (amount < 100) {
            showFieldError(amountField, 'Minimum donation amount is KShs 100');
            isValid = false;
        }
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name || field.id;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^(\+254|0)[0-9]{9}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid Kenyan phone number');
            return false;
        }
    }
    
    // Number validation
    if (fieldType === 'number' && value) {
        const num = parseInt(value);
        if (isNaN(num) || num < 0) {
            showFieldError(field, 'Please enter a valid positive number');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = 'var(--coral)';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--coral)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--spacing-1)';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = 'var(--border-gray)';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Form Reset Functions
function resetStudentForm() {
    const form = document.getElementById('studentForm');
    if (form) {
        form.reset();
        
        // Clear all field errors
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => clearFieldError(field));
    }
}

function resetDonationForm() {
    const form = document.getElementById('donationForm');
    if (form) {
        form.reset();
        
        // Clear all field errors
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => clearFieldError(field));
    }
}

// Utility Functions
function scrollToStudents() {
    const studentsSection = document.getElementById('students');
    if (studentsSection) {
        studentsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to buttons
function addLoadingAnimation(button, text = 'Loading...') {
    const originalText = button.textContent;
    button.innerHTML = `<span class="loading"></span> ${text}`;
    button.disabled = true;
    
    return function removeLoading() {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Local storage functions for persistence
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Initialize with saved data if available
function loadSavedData() {
    const savedStudents = loadFromLocalStorage('lifted_students');
    if (savedStudents && savedStudents.length > 0) {
        students = savedStudents;
    }
}

// Save data periodically
function saveData() {
    saveToLocalStorage('lifted_students', students);
}

// Auto-save every 30 seconds
setInterval(saveData, 30000);

// Load saved data on initialization
loadSavedData();

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        formatCurrency,
        formatDate,
        createStudentCard
    };
}
