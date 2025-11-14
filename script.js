let students = [];
let statistics = {};

// API base - automatically detects environment
// Development: http://localhost:5000/api
// Production: uses window.__API_BASE__ or current domain
function getAPIBase() {
    if (window.__API_BASE__) {
        return window.__API_BASE__ + '/api';
    }
    
    // In production on Vercel, use the Render backend
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // For Vercel deployment, use your Render backend URL
        const backendUrl = window.location.hostname.includes('vercel') 
            ? 'https://lifted-backend.onrender.com'
            : `${window.location.protocol}//${window.location.hostname}`;
        return backendUrl + '/api';
    }
    
    return 'http://localhost:5000/api';
}

const API_BASE = getAPIBase();

// Auth helpers
function getAuthToken() {
    return localStorage.getItem('token');
}
function setAuthToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}

// Wrapper for fetch that injects Authorization header when token is present
async function apiFetch(path, options = {}) {
    const headers = options.headers || {};
    // If body is not FormData, default to JSON
    if (!(options.body instanceof FormData)) {
        headers['Accept'] = headers['Accept'] || 'application/json';
        if (options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
    }

    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    options.headers = headers;

    const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    return fetch(url, options);
}

// Wire login/register/logout forms if present
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const orig = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Signing in...';
            try {
                const email = loginForm.querySelector('input[name="email"]').value;
                const password = loginForm.querySelector('input[name="password"]').value;
                const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
                if (!res.ok) throw new Error('Invalid credentials');
                const json = await res.json();
                if (json.token) {
                    setAuthToken(json.token);
                    showSuccessModal('Signed in successfully');
                    // Optionally reload to reflect auth state
                    setTimeout(() => window.location.reload(), 800);
                }
            } catch (err) {
                console.error('Login failed', err);
                showSuccessModal('Sign in failed. Please check your credentials and try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = orig;
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const orig = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Registering...';
            try {
                const formData = new FormData(registerForm);
                // send as FormData to allow file uploads if present
                const res = await apiFetch('/auth/register', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Registration failed');
                const json = await res.json();
                showSuccessModal('Registration successful. Please check your email to verify your account.');
                registerForm.reset();
            } catch (err) {
                console.error('Registration failed', err);
                showSuccessModal('Registration failed. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = orig;
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setAuthToken(null);
            showSuccessModal('Signed out');
            setTimeout(() => window.location.reload(), 400);
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);

    // Fetch data and initialize the app
    try {
        const response = await fetch('demo-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        students = data.students;
        statistics = data.statistics;
        initializePage();
    } catch (error) {
        console.error('Failed to load demo data:', error);
        const studentProfilesContainer = document.getElementById('studentsGrid');
        if (studentProfilesContainer) {
            studentProfilesContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load student data.</h3>
                    <p>Please try refreshing the page. If the problem persists, please contact support.</p>
                </div>`;
        }
    }
});

// Mobile Navigation
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on nav links
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    });
});

// Theme Management
document.querySelector('.theme-switch').addEventListener('click', toggleTheme);

// Fetch data from backend and initialize the app (run asynchronously)
// Attempt to load live data from backend; fall back to demo-data if backend is unavailable
(async function fetchBackendData() {
    try {
        const response = await apiFetch('/students');
        if (response.ok) {
            const data = await response.json();
            students = data.students || data;
            // Optionally fetch statistics from backend if available
            try {
                const statsRes = await apiFetch('/statistics');
                if (statsRes.ok) {
                    statistics = await statsRes.json();
                }
            } catch (err) {
                console.warn('Failed to load statistics from backend:', err);
            }
        }
    } catch (error) {
        console.info('Backend not reachable, using demo data. Error:', error.message || error);
    } finally {
        // Initialize the page using whichever data is available (demo-data or backend)
        initializePage();
    }
})();

// Display student profiles with optional filter
function displayStudentProfiles(filter = 'all') {
    const container = document.getElementById('studentsGrid');
    if (!container) return;

    let filteredStudents = students;

    if (filter === 'urgent') {
        filteredStudents = students.filter(s => s.urgent);
    } else if (filter !== 'all') {
        filteredStudents = students.filter(s => s.fundingType === filter);
    }

    if (filteredStudents.length === 0) {
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1;">
                <i class="fas fa-inbox"></i>
                <h3>No students found</h3>
                <p>There are currently no students in this category. Please check back soon!</p>
            </div>`;
        return;
    }

    container.innerHTML = filteredStudents.map(student => createStudentCard(student)).join('');
}

function createStudentCard(student) {
    const progressPercentage = student.progress || Math.min((student.amountRaised / student.amountNeeded) * 100, 100);
    const remainingAmount = Math.max(student.amountNeeded - student.amountRaised, 0);
    
    return `
        <div class="student-card fade-in" data-id="${student.id}">
            <div class="student-image">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="student-info">
                <h3>${student.firstName} ${student.lastName}</h3>
                <p class="course"><strong>${student.course}</strong></p>
                <p class="university">${student.institution} • Year ${student.year}</p>
                <p class="story">${student.story.substring(0, 80)}...</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: KSh ${student.amountRaised.toLocaleString()}</span>
                        <span>${Math.round(progressPercentage)}%</span>
                    </div>
                </div>
                <p style="margin-bottom: 0.5rem; font-weight: 600; color: var(--accent-coral);">
                    Still needed: KSh ${remainingAmount.toLocaleString()}
                </p>
                ${student.urgent ? '<p style="margin: 0.5rem 0; color: var(--accent-coral); font-weight: 600;"><i class="fas fa-exclamation-circle"></i> URGENT</p>' : ''}
                ${student.daysLeft ? `<p style="margin: 0.5rem 0; color: var(--accent-coral); font-size: 0.85rem;"><i class="fas fa-clock"></i> ${student.daysLeft} days left</p>` : ''}
            </div>
            <div class="student-actions">
                <button class="btn btn-primary" onclick="openDonationModal(${student.id})">
                    <i class="fas fa-hand-holding-heart"></i> Donate
                </button>
            </div>
        </div>
    `;
}

// Enhanced Filter functionality with smooth transitions
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayStudentProfiles(button.dataset.filter);
    });
});

// Modal functions with enhanced UX
function openStudentForm() {
    const modal = document.getElementById('studentModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
    
    // Focus management
    modal.querySelector('#firstName').focus();
}

function closeStudentForm() {
    const modal = document.getElementById('studentModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function openDonationModal(studentId) {
    document.getElementById('donationForm').dataset.studentId = studentId;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const progressPercentage = student.progress || Math.min((student.amountRaised / student.amountNeeded) * 100, 100);
    const remainingAmount = Math.max(student.amountNeeded - student.amountRaised, 0);
    
    document.getElementById('donationStudentInfo').innerHTML = `
        <div class="student-card" style="margin-bottom: 2rem; animation: none;">
            <div class="student-image">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="student-info">
                <h3>${student.firstName} ${student.lastName}</h3>
                <p class="course"><strong>${student.course}</strong></p>
                <p class="university">${student.institution} • Year ${student.year}</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: KSh ${student.amountRaised.toLocaleString()}</span>
                        <span>${Math.round(progressPercentage)}%</span>
                    </div>
                </div>
                <p style="margin-bottom: 0; font-weight: 600; color: var(--accent-coral);">
                    Still needed: KSh ${remainingAmount.toLocaleString()}
                </p>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('donationModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
    
    // Focus management
    modal.querySelector('#donorName').focus();

    // Ensure form is visible and confirmation is hidden
    document.getElementById('donationForm').style.display = 'block';
    document.getElementById('donationConfirmation').style.display = 'none';
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Enhanced Quick amount buttons functionality with smooth transitions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quick-amount')) {
        document.querySelectorAll('.quick-amount').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const amountInput = document.getElementById('donationAmount');
        amountInput.value = e.target.dataset.amount;
        
        // Add visual feedback
        amountInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            amountInput.style.transform = 'scale(1)';
        }, 200);
    }
});

// Enhanced Form submissions with loading states
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    let valid = true;
    let errorMessages = [];

    // Required fields
    const requiredFields = [
        {id: 'firstName', name: 'First Name'},
        {id: 'lastName', name: 'Last Name'},
        {id: 'email', name: 'Email'},
        {id: 'phone', name: 'Phone'},
        {id: 'course', name: 'Course'},
        {id: 'institution', name: 'Institution'},
        {id: 'year', name: 'Year'}
    ];
    requiredFields.forEach(field => {
        const el = document.getElementById(field.id);
        if (!el.value.trim()) {
            valid = false;
            errorMessages.push(`${field.name} is required.`);
            el.classList.add('input-error');
        } else {
            el.classList.remove('input-error');
        }
    });

    // Email format
    const emailEl = document.getElementById('email');
    if (emailEl.value && !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
        valid = false;
        errorMessages.push('Please enter a valid email address.');
        emailEl.classList.add('input-error');
    }

    // Phone format (simple validation)
    const phoneEl = document.getElementById('phone');
    if (phoneEl.value && !/^\d{7,15}$/.test(phoneEl.value.replace(/\D/g, ''))) {
        valid = false;
        errorMessages.push('Please enter a valid phone number.');
        phoneEl.classList.add('input-error');
    }

    // File validation
    const documentsInput = document.getElementById('documents');
    if (documentsInput) {
        const maxSize = parseInt(documentsInput.getAttribute('data-max-size'), 10);
        for (let file of documentsInput.files) {
            if (file.size > maxSize) {
                valid = false;
                errorMessages.push('Each file must be less than 5MB.');
            }
        }
    }

    // Show errors if any
    const errorContainer = document.getElementById('studentFormErrors');
    if (errorContainer) {
        errorContainer.innerHTML = errorMessages.map(msg => `<div class='form-error'>${msg}</div>`).join('');
        errorContainer.style.display = errorMessages.length ? 'block' : 'none';
    }

    if (!valid) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Submitting...</span></div>';
    submitBtn.disabled = true;

    // Submit student application to backend
    (async () => {
        try {
            const formData = new FormData(this);
            const res = await apiFetch('/students', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            const json = await res.json();
            closeStudentForm();
            showSuccessModal('Your application has been submitted successfully! Our team will review it within 2-3 business days and contact you with next steps.');
            this.reset();
            this.querySelectorAll('.quick-amount').forEach(btn => btn.classList.remove('active'));
            if (errorContainer) errorContainer.style.display = 'none';
        } catch (err) {
            console.error('Student submission failed', err);
            showSuccessModal('Failed to submit application. Please try again later.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    })();
});

document.getElementById('donationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;
    let errorMessages = [];

    // Required fields
    const donorName = document.getElementById('donorName');
    const donorEmail = document.getElementById('donorEmail');
    const donorPhone = document.getElementById('donorPhone');
    const donationAmount = document.getElementById('donationAmount');
    if (!donorName.value.trim()) {
        valid = false;
        errorMessages.push('Name is required.');
        donorName.classList.add('input-error');
    } else {
        donorName.classList.remove('input-error');
    }
    if (!donorEmail.value.trim()) {
        valid = false;
        errorMessages.push('Email is required.');
        donorEmail.classList.add('input-error');
    } else {
        donorEmail.classList.remove('input-error');
    }
    if (donorEmail.value && !/^\S+@\S+\.\S+$/.test(donorEmail.value)) {
        valid = false;
        errorMessages.push('Please enter a valid email address.');
        donorEmail.classList.add('input-error');
    }
    if (!donorPhone.value.trim()) {
        valid = false;
        errorMessages.push('Phone is required.');
        donorPhone.classList.add('input-error');
    } else {
        donorPhone.classList.remove('input-error');
    }
    if (donorPhone.value && !/^\d{7,15}$/.test(donorPhone.value.replace(/\D/g, ''))) {
        valid = false;
        errorMessages.push('Please enter a valid phone number.');
        donorPhone.classList.add('input-error');
    }
    if (!donationAmount.value.trim() || parseInt(donationAmount.value) < 100) {
        valid = false;
        errorMessages.push('Minimum donation is KSh 100.');
        donationAmount.classList.add('input-error');
    } else {
        donationAmount.classList.remove('input-error');
    }

    // Show errors if any
    const errorContainer = document.getElementById('donationFormErrors');
    if (errorContainer) {
        errorContainer.innerHTML = errorMessages.map(msg => `<div class='form-error'>${msg}</div>`).join('');
        errorContainer.style.display = errorMessages.length ? 'block' : 'none';
    }

    if (!valid) return;

    // Populate confirmation details and wait for final confirmation before sending
    const studentId = parseInt(this.dataset.studentId);
    const student = students.find(s => s.id === studentId) || {};
    const paymentMethodEl = document.getElementById('paymentMethod');
    const paymentMethod = paymentMethodEl.options[paymentMethodEl.selectedIndex].text;

    document.getElementById('confirmStudentName').textContent = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    document.getElementById('confirmAmount').textContent = `KSh ${parseInt(donationAmount.value).toLocaleString()}`;
    document.getElementById('confirmPaymentMethod').textContent = paymentMethod;

    // Switch views (final send happens when user clicks confirm)
    document.getElementById('donationForm').style.display = 'none';
    document.getElementById('donationConfirmation').style.display = 'block';
    if (errorContainer) errorContainer.style.display = 'none';
});

// Handle back button on confirmation screen
document.getElementById('backToDonationForm').addEventListener('click', () => {
    document.getElementById('donationConfirmation').style.display = 'none';
    document.getElementById('donationForm').style.display = 'block';
});

// Handle final confirmation and payment
document.getElementById('confirmDonationBtn').addEventListener('click', function() {
    const submitBtn = this;
    const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"><div class="spinner" style="border-color: var(--bg-primary); border-top-color: var(--text-inverse);"></div><span>Processing...</span></div>';
    submitBtn.disabled = true;

    // Send donation to backend
    (async () => {
        try {
            const donationForm = document.getElementById('donationForm');
            const studentId = parseInt(donationForm.dataset.studentId);
            const payload = {
                student: studentId.toString(), // MongoDB expects string ID
                donorName: document.getElementById('donorName').value,
                donorEmail: document.getElementById('donorEmail').value,
                donorPhone: document.getElementById('donorPhone').value || '',
                amount: parseInt(document.getElementById('donationAmount').value),
                paymentMethod: document.getElementById('paymentMethod').value,
                message: document.getElementById('donorMessage').value || '',
                anonymous: document.getElementById('anonymous').checked || false,
                receiveUpdates: document.getElementById('updates').checked !== false
            };

            const res = await apiFetch('/donations', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || `Server responded ${res.status}`);
            }

            closeDonationModal();
            showSuccessModal('Thank you for your generous donation! You will receive a confirmation email shortly with payment details and tax receipt information.');

            // Reset form and button
            donationForm.reset();
            donationForm.querySelectorAll('.quick-amount').forEach(btn => btn.classList.remove('active'));

        } catch (err) {
            console.error('Donation failed', err);
            showSuccessModal('Failed to process donation. Please try again later. Error: ' + err.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Reset views
            setTimeout(() => {
                document.getElementById('donationForm').style.display = 'block';
                document.getElementById('donationConfirmation').style.display = 'none';
            }, 500);
        }
    })();
});


document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Sending...</span></div>';
    submitBtn.disabled = true;
    
        // Send contact message to backend
        (async () => {
            try {
                const payload = {
                    name: this.querySelector('input[name="name"]').value,
                    email: this.querySelector('input[name="email"]').value,
                    message: this.querySelector('textarea[name="message"]').value
                };
                const res = await apiFetch('/notifications', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                showSuccessModal('Your message has been sent successfully! We will get back to you within 24 hours.');
                this.reset();
            } catch (err) {
                console.error('Contact send failed', err);
                showSuccessModal('Failed to send message. Please try again later.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        })();
});

// Newsletter form submission
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    if (!emailInput.value.trim()) {
        showSuccessModal('Please enter a valid email address.');
        return;
    }

    submitBtn.innerHTML = '<div class="loading"><div class="spinner" style="border-color: var(--bg-primary); border-top-color: var(--text-inverse);"></div></div>';
    submitBtn.disabled = true;
    
        // Send newsletter subscription to backend
        (async () => {
            try {
                const payload = { email: emailInput.value };
                const res = await apiFetch('/notifications/newsletter', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                showSuccessModal('Thank you for subscribing to our newsletter! You will receive updates about our students and success stories.');
                this.reset();
            } catch (err) {
                console.error('Newsletter subscribe failed', err);
                showSuccessModal('Failed to subscribe. Please try again later.');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        })();
});

function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    document.getElementById('successMessage').textContent = message;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

// Smooth scroll to students section
function scrollToStudents() {
    document.getElementById('students').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a subtle transition effect
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        body.style.transition = '';
    }, 300);
}

// Intersection Observer for animations
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced accessibility features
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            if (modal.id === 'studentModal') closeStudentForm();
            else if (modal.id === 'donationModal') closeDonationModal();
            else if (modal.id === 'successModal') closeSuccessModal();
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'studentModal') closeStudentForm();
        else if (e.target.id === 'donationModal') closeDonationModal();
        else if (e.target.id === 'successModal') closeSuccessModal();
    }
});

// Initialize page
function initializePage() {
    displayStudentProfiles();
    observeElements();
    
    // Add loading animation to hero stats
    const statsMap = {
        'students-supported': statistics.totalStudents,
        'total-raised': statistics.totalRaised,
        'success-rate': statistics.successRate
    };

    document.querySelectorAll('.stat h3').forEach(statEl => {
        const key = statEl.id;
        const finalValue = statsMap[key];
        const suffix = statEl.dataset.suffix || '';
        let currentValue = 0;
        const increment = Math.max(finalValue / 100, 1);
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                statEl.textContent = finalValue.toLocaleString() + suffix;
                clearInterval(counter);
            } else {
                statEl.textContent = Math.floor(currentValue).toLocaleString() + suffix;
            }
        }, 20);
    });
}

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add smooth transitions to form inputs
document.querySelectorAll('input, textarea, select').forEach(input => {
    input.style.transition = 'all 0.3s ease';
    
    input.addEventListener('focus', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Enhanced donation amount input with validation
const donationAmountInput = document.getElementById('donationAmount');
if (donationAmountInput) {
    donationAmountInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value < 100 && value > 0) {
            this.style.borderColor = 'var(--accent-coral)';
            this.setCustomValidity('Minimum donation is KSh 100');
        } else {
            this.style.borderColor = '';
            this.setCustomValidity('');
        }
    });
}

// Add ripple effect to buttons
document.querySelectorAll('.btn, .filter-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});