// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        // Reset nav link colors
        navLinks.forEach(l => l.style.color = '');
    });
});

// Dynamically set hero margin-top based on header height
function setHeroMargin() {
    if (header && hero) {
        const headerHeight = header.offsetHeight;
        hero.style.marginTop = headerHeight + 'px';
        hero.style.height = `calc(100vh - ${headerHeight}px)`;
    }
}

// Set on load and resize
window.addEventListener('load', setHeroMargin);
window.addEventListener('resize', setHeroMargin);

// Hero Slider
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    heroSlides.forEach((slide, i) => {
        slide.classList.remove('active');
        heroDots[i].classList.remove('active');
    });
    
    heroSlides[index].classList.add('active');
    heroDots[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    showSlide(currentSlide);
}

function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideShow() {
    clearInterval(slideInterval);
}

// Initialize slider
showSlide(0);
startSlideShow();

// Click on dots to change slide
heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        stopSlideShow();
        showSlide(index);
        startSlideShow();
    });
});

// Pause slideshow on hover
const heroSection = document.querySelector('.hero');
heroSection.addEventListener('mouseenter', stopSlideShow);
heroSection.addEventListener('mouseleave', startSlideShow);

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 82;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
const animatedElements = document.querySelectorAll('.program-card, .feature-item, .gallery-item');
animatedElements.forEach(el => observer.observe(el));

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    let activeFound = false;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 115;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.style.color = '');
            if (navLink) {
                navLink.style.color = 'var(--primary-color)';
                activeFound = true;
            }
        }
    });
    
    // Reset if no section is active
    if (!activeFound) {
        navLinks.forEach(link => link.style.color = '');
    }
});

// Form validation (if contact form is added later)
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Add loading state to buttons
function addLoadingState(button, originalText) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Yükleniyor...';
    button.classList.add('loading');
}

function removeLoadingState(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
    button.classList.remove('loading');
}

// Lazy load images (for performance)
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Console welcome message
console.log('%cÖzel Şehr-i Nuh Özel Eğitim ve Rehabilitasyon Merkezi', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cWeb sitesine hoş geldiniz!', 'color: #10b981; font-size: 14px;');