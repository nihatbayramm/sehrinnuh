// Public website JavaScript
// Use the local API during development and the same-origin API on Render.
const API_BASE = (() => {
    const configuredBase = window.APP_CONFIG && window.APP_CONFIG.API_BASE;
    if (configuredBase) return String(configuredBase).replace(/\/$/, '');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    return '/api';
})();

const apiUrl = endpoint => `${API_BASE}${endpoint}`;

// Mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}
navLinks.forEach(link => link.addEventListener('click', () => {
    mobileMenuBtn?.classList.remove('active');
    navMenu?.classList.remove('active');
}));

function setHeroMargin() {
    if (header && hero) {
        const height = header.offsetHeight;
        hero.style.marginTop = `${height}px`;
        hero.style.height = `calc(100vh - ${height}px)`;
    }
}
window.addEventListener('load', setHeroMargin);
window.addEventListener('resize', setHeroMargin);

// Hero slider
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    if (!heroSlides.length) return;
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    heroDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
function startSlideShow() {
    if (heroSlides.length > 1) slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
}
function stopSlideShow() { clearInterval(slideInterval); }
showSlide(0);
startSlideShow();
heroDots.forEach((dot, index) => dot.addEventListener('click', () => {
    stopSlideShow();
    showSlide(index);
    startSlideShow();
}));
hero?.addEventListener('mouseenter', stopSlideShow);
hero?.addEventListener('mouseleave', startSlideShow);

window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.pageYOffset > 100);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 82, behavior: 'smooth' });
}));

// Contact form
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        message: form.message.value.trim()
    };

    try {
        const response = await fetch(apiUrl('/messages'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Mesaj gönderilemedi');
        alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
        form.reset();
    } catch (error) {
        console.error('Contact form error:', error);
        alert('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    }
});

// Dynamic content loaded from the same Render service as the website.
async function loadDynamicContent() {
    try {
        const [contentResponse, galleryResponse] = await Promise.all([
            fetch(apiUrl('/content'), { cache: 'no-store' }),
            fetch(apiUrl('/gallery'), { cache: 'no-store' })
        ]);
        if (!contentResponse.ok || !galleryResponse.ok) throw new Error('API verisi alınamadı');

        const content = await contentResponse.json();
        const gallery = await galleryResponse.json();

        const aboutTitle = document.getElementById('dynamicAboutTitle');
        const aboutText = document.getElementById('dynamicAboutText');
        if (aboutTitle && content.about) aboutTitle.textContent = content.about.title;
        if (aboutText && content.about) {
            aboutText.innerHTML = String(content.about.text || '')
                .split('\n').filter(text => text.trim())
                .map(text => `<p>${text}</p>`).join('');
        }

        const phone = document.getElementById('dynamicContactPhone');
        const email = document.getElementById('dynamicContactEmail');
        const address = document.getElementById('dynamicContactAddress');
        if (phone && content.contact) {
            phone.innerHTML = String(content.contact.phone || '').split(',').map(value => {
                const text = value.trim();
                return `<a href="tel:${text.replace(/\s/g, '')}">${text}</a>`;
            }).join('');
        }
        if (email && content.contact) {
            email.innerHTML = String(content.contact.email || '').split(',').map(value => {
                const text = value.trim();
                return `<a href="mailto:${text}">${text}</a>`;
            }).join('');
        }
        if (address && content.contact) {
            address.innerHTML = `<p>${String(content.contact.address || '').replace(/\n/g, '<br>')}</p>`;
        }

        const programsGrid = document.getElementById('dynamicProgramsGrid');
        if (programsGrid && Array.isArray(content.programs)) {
            programsGrid.innerHTML = content.programs.map(program => `
                <div class="program-card">
                    <div class="program-icon">✦</div>
                    <h3>${program.title}</h3>
                    <p>${program.description}</p>
                </div>
            `).join('');
        }

        const galleryGrid = document.getElementById('dynamicGalleryGrid');
        if (galleryGrid && Array.isArray(gallery)) {
            galleryGrid.innerHTML = gallery.map(image => `
                <div class="gallery-item">
                    <img src="${image.url}" alt="${image.alt || ''}" class="gallery-image">
                    <div class="gallery-overlay"><h3>${image.title || ''}</h3></div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Dynamic content error:', error);
        // Keep the static HTML visible if the API is temporarily unavailable.
    }
}

document.addEventListener('DOMContentLoaded', loadDynamicContent);
