// Theme Management
const themeToggle = document.querySelector('.theme-switch');
const body = document.body;

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);

function toggleTheme() {
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

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Enhanced Student Data
const students = [
    {
        name: "John Mwangi",
        course: "Computer Science",
        university: "University of Nairobi",
        year: "3rd Year",
        amountNeeded: 75000,
        amountRaised: 45000,
        story: "John is a brilliant computer science student with a passion for software development. Despite maintaining a first-class average, he faces financial challenges that threaten his education. He comes from a single-parent household and has been working part-time to support his studies.",
        category: "tuition",
        urgent: true,
        achievements: ["Dean's List 2024", "Best Programming Project Award", "Volunteer Tutor"]
    },
    {
        name: "Mary Atieno",
        course: "Medicine",
        university: "Kenyatta University",
        year: "4th Year",
        amountNeeded: 120000,
        amountRaised: 80000,
        story: "Mary dreams of becoming a doctor to serve her rural community. She has consistently ranked in the top 5% of her class but struggles with the high cost of medical school. Her determination and academic excellence make her a promising future physician.",
        category: "tuition",
        urgent: false,
        achievements: ["Clinical Excellence Award", "Research Publication", "Community Health Volunteer"]
    },
    {
        name: "David Ochieng",
        course: "Mechanical Engineering",
        university: "Jomo Kenyatta University",
        year: "Final Year",
        amountNeeded: 60000,
        amountRaised: 25000,
        story: "David is an innovative engineering student working on sustainable energy solutions. His final year project focuses on affordable solar technology for rural communities. He needs support to complete his thesis and graduate.",
        category: "tuition",
        urgent: true,
        achievements: ["Innovation Challenge Winner", "Patent Application Filed", "Engineering Society President"]
    },
    {
        name: "Grace Wanjiku",
        course: "Nursing",
        university: "Moi University",
        year: "2nd Year",
        amountNeeded: 45000,
        amountRaised: 30000,
        story: "Grace is passionate about maternal health and hopes to specialize in midwifery. She comes from a rural background and understands the healthcare challenges in underserved areas. Her compassion and dedication make her an exceptional nursing student.",
        category: "medical",
        urgent: false,
        achievements: ["Clinical Skills Excellence", "Student Nurse Association Leader", "Health Outreach Volunteer"]
    },
    {
        name: "Paul Kamau",
        course: "Education (Mathematics)",
        university: "Kenyatta University",
        year: "3rd Year",
        amountNeeded: 40000,
        amountRaised: 15000,
        story: "Paul is training to become a mathematics teacher with a special focus on making math accessible to students from disadvantaged backgrounds. He has already started a free tutoring program in his community and plans to expand it after graduation.",
        category: "tuition",
        urgent: true,
        achievements: ["Outstanding Student Teacher", "Math Olympiad Coordinator", "Peer Tutor of the Year"]
    },
    {
        name: "Susan Adhiambo",
        course: "Business Administration",
        university: "Strathmore University",
        year: "Final Year",
        amountNeeded: 85000,
        amountRaised: 55000,
        story: "Susan is an aspiring entrepreneur with a business plan to create employment opportunities in her rural community. She has already started a small agricultural cooperative and needs to complete her degree to scale her business impact.",
        category: "tuition",
        urgent: false,
        achievements: ["Business Plan Competition Winner", "Entrepreneurship Club Founder", "Microfinance Intern"]
    },
    {
        name: "Kevin Otieno",
        course: "Information Technology",
        university: "Technical University of Kenya",
        year: "2nd Year",
        amountNeeded: 55000,
        amountRaised: 20000,
        story: "Kevin is passionate about using technology to solve local problems. He has developed a mobile app for farmers and is working on digital literacy programs for his community. Despite his talent, financial constraints threaten his continued education.",
        category: "tuition",
        urgent: true,
        achievements: ["Hackathon Winner", "Mobile App Developer", "Digital Literacy Trainer"]
    },
    {
        name: "Faith Nyong'o",
        course: "Environmental Science",
        university: "University of Eldoret",
        year: "3rd Year",
        amountNeeded: 50000,
        amountRaised: 35000,
        story: "Faith is dedicated to environmental conservation and climate change mitigation. She leads campus sustainability initiatives and conducts research on renewable energy. Her work has already influenced policy recommendations at the county level.",
        category: "tuition",
        urgent: false,
        achievements: ["Environmental Research Grant", "Sustainability Project Leader", "Climate Action Ambassador"]
    }
];

// Enhanced function to display student profiles with animations
function displayStudentProfiles(filter = "all") {
    const studentProfilesContainer = document.getElementById('studentsGrid');
    
    // Add loading state
    studentProfilesContainer.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading students...</span></div>';
    
    setTimeout(() => {
        studentProfilesContainer.innerHTML = '';
        
        const filteredStudents = filter === "all" 
            ? students 
            : students.filter(student => 
                filter === "urgent" ? student.urgent : student.category === filter
            );
        
        filteredStudents.forEach((student, index) => {
            const progressPercentage = Math.min((student.amountRaised / student.amountNeeded) * 100, 100);
            const remainingAmount = Math.max(student.amountNeeded - student.amountRaised, 0);
            
            const studentCard = document.createElement('div');
            studentCard.classList.add('student-card');
            studentCard.style.animationDelay = `${index * 0.1}s`;
            
            studentCard.innerHTML = `
                ${student.urgent ? '<div class="urgent-badge"><i class="fas fa-exclamation-circle"></i> Urgent</div>' : ''}
                <div class="student-image">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p class="course"><strong>${student.course}</strong></p>
                    <p class="university">${student.university} • ${student.year}</p>
                    <p>${student.story}</p>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>Raised: KSh ${student.amountRaised.toLocaleString()}</span>
                            <span>${Math.round(progressPercentage)}%</span>
                        </div>
                        <div class="progress-text">
                            <span style="color: var(--accent-coral); font-weight: 600;">
                                Still needed: KSh ${remainingAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    ${student.achievements ? `
                        <div style="margin-bottom: 1rem;">
                            <small style="color: var(--text-secondary); font-weight: 500;">Recent Achievements:</small>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
                                ${student.achievements.slice(0, 2).map(achievement => 
                                    `<span style="background: var(--primary-blue-light); color: var(--primary-blue); padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 500;">${achievement}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <button class="btn btn-primary" onclick="openDonationModal(${students.indexOf(student)})" style="width: 100%;">
                        <i class="fas fa-heart"></i>
                        Support ${student.name.split(' ')[0]}
                    </button>
                </div>
            `;
            
            studentProfilesContainer.appendChild(studentCard);
        });

        // Re-trigger animations
        observeElements();
    }, 500);
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

function openDonationModal(studentIndex) {
    const student = students[studentIndex];
    const progressPercentage = Math.min((student.amountRaised / student.amountNeeded) * 100, 100);
    const remainingAmount = Math.max(student.amountNeeded - student.amountRaised, 0);
    
    document.getElementById('donationStudentInfo').innerHTML = `
        <div class="student-card" style="margin-bottom: 2rem; animation: none;">
            <div class="student-image">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="student-info">
                <h3>${student.name}</h3>
                <p class="course"><strong>${student.course}</strong></p>
                <p class="university">${student.university} • ${student.year}</p>
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
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Submitting...</span></div>';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        closeStudentForm();
        showSuccessModal('Your application has been submitted successfully! Our team will review it within 2-3 business days and contact you with next steps.');
        
        // Reset form and button
        this.reset();
        // Remove active state from quick-amount buttons (if any)
        this.querySelectorAll('.quick-amount').forEach(btn => btn.classList.remove('active'));
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

document.getElementById('donationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Processing...</span></div>';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        closeDonationModal();
        showSuccessModal('Thank you for your generous donation! You will receive a confirmation email shortly with payment details and tax receipt information.');
        
        // Reset form and button
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2500);
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Sending...</span></div>';
    submitBtn.disabled = true;
    
    // Simulate email sending
    setTimeout(() => {
        showSuccessModal('Your message has been sent successfully! We will get back to you within 24 hours.');
        
        // Reset form and button
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
});

// Newsletter form submission
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    if (!emailInput) {
        showSuccessModal('Email input not found. Please try again later.');
        return;
    }
    if (!emailInput.value.trim()) {
        showSuccessModal('Please enter a valid email address.');
        return;
    }
    submitBtn.classList.add('loading');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    // Simulate subscription process
    setTimeout(() => {
        showSuccessModal('Thank you for subscribing to our newsletter! You will receive updates about our students and success stories.');
        
        // Reset form and button
        this.reset();
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }, 1500);
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
document.addEventListener('DOMContentLoaded', () => {
    displayStudentProfiles();
    observeElements();
    
    // Add loading animation to hero stats
    const stats = document.querySelectorAll('.stat h3');
    stats.forEach((stat, index) => {
        const finalValue = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/[\d,]/g, '');
        let currentValue = 0;
        const increment = finalValue / 50;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                stat.textContent = finalValue.toLocaleString() + suffix;
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(currentValue).toLocaleString() + suffix;
            }
        }, 50);
    });
});

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

// Add CSS animation for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);