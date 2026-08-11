/* ============================================
   AURÉNE Photography Website
   JavaScript — FINAL VERSION (Frontend + Backend)
   Works on: index.html, clients.html, journal.html
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STEP 1: SET YOUR BACKEND URL
    // LOCAL (testing on your computer): http://127.0.0.1:5000
    // LIVE (after deploying): https://your-app-name.onrender.com
    // ============================================
    const API_BASE = 'https://aurene-website.onrender.com';
    // ============================================
    // DOM Elements
    // ============================================
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');
    const heroImage = document.getElementById('heroImage');
    const statNumbers = document.querySelectorAll('.stat-number');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const bookingModal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalPackage = document.getElementById('modalPackage');
    const modalForm = document.getElementById('modalForm');
    const bookBtns = document.querySelectorAll('.book-btn');
    const newsletterForm = document.getElementById('newsletterForm');

    // ============================================
    // API HELPER: Sends data to your Python backend
    // ============================================
    async function apiPost(endpoint, data) {
        try {
            const response = await fetch(API_BASE + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            return { ok: response.ok, data: result };
        } catch (error) {
            console.error('API Error:', error);
            return { ok: false, error: error.message };
        }
    }

    // ============================================
    // NAVBAR: Changes style when you scroll
    // ============================================
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleNavbarScroll);

    // ============================================
    // MOBILE MENU: Hamburger button
    // ============================================
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) menuToggle.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ============================================
    // ACTIVE NAV LINK: Highlights current section
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    function setActiveNavLink() {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    if (sections.length > 0) {
        window.addEventListener('scroll', setActiveNavLink);
    }

    // ============================================
    // HERO FADE: Background image fades as you scroll
    // ============================================
    if (heroImage) {
        function fadeHeroOnScroll() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const fadeEnd = windowHeight * 0.8;
            if (scrollY <= fadeEnd) {
                const opacity = 1 - (scrollY / fadeEnd);
                const scale = 1.1 + (scrollY / windowHeight) * 0.1;
                heroImage.style.opacity = Math.max(opacity, 0);
                heroImage.style.transform = 'scale(' + scale + ')';
            } else {
                heroImage.style.opacity = 0;
            }
        }
        window.addEventListener('scroll', fadeHeroOnScroll);
    }

    // ============================================
    // PORTFOLIO FILTER: Home page only
    // ============================================
    const portfolioFilterBtns = document.querySelectorAll('.portfolio .filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            portfolioFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.transition = 'all 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // ============================================
    // CLIENTS FILTER: Clients page only
    // ============================================
    const clientsFilterBtns = document.querySelectorAll('.clients-filter .filter-btn');
    const clientCards = document.querySelectorAll('.client-card');
    clientsFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            clientsFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            clientCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // ============================================
    // ANIMATED COUNTERS: Numbers count up
    // ============================================
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 16);
    }
    if (statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const number = entry.target;
                    if (!number.classList.contains('counted')) {
                        number.classList.add('counted');
                        animateCounter(number);
                    }
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(stat => statsObserver.observe(stat));
    }

    // ============================================
    // SCROLL REVEAL: Elements fade in as you scroll
    // ============================================
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.rate-category, .service-card, .client-card, .journal-card');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }
    document.querySelectorAll('.rate-category, .service-card, .client-card, .journal-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll);

    // ============================================
    // CONTACT FORM → SENDS TO BACKEND
    // ============================================
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                package: document.getElementById('package').value,
                message: document.getElementById('message').value
            };

            const result = await apiPost('/api/contact', formData);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (result.ok && result.data.success) {
                contactForm.style.display = 'none';
                formSuccess.classList.add('show');
                setTimeout(() => {
                    contactForm.reset();
                    formSuccess.classList.remove('show');
                    contactForm.style.display = 'flex';
                }, 4000);
            } else {
                alert('Error: ' + (result.data?.error || result.error || 'Something went wrong'));
            }
        });
    }

    // ============================================
    // BOOKING MODAL → SENDS TO BACKEND
    // ============================================
    function openModal(packageName) {
        if (modalPackage) modalPackage.textContent = packageName;
        if (bookingModal) bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        if (bookingModal) bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    bookBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(this.getAttribute('data-package'));
        });
    });
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('active')) closeModal();
    });

    if (modalForm) {
        modalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Requesting...';
            submitBtn.disabled = true;

            const formData = {
                package: modalPackage.textContent,
                name: document.getElementById('modalName').value,
                email: document.getElementById('modalEmail').value,
                phone: document.getElementById('modalPhone').value,
                preferred_date: document.getElementById('modalDate').value
            };

            const result = await apiPost('/api/booking', formData);
            if (result.ok && result.data.success) {
                submitBtn.textContent = 'Request Sent!';
                submitBtn.style.background = 'var(--accent-dark)';
                setTimeout(() => {
                    closeModal();
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 1500);
            } else {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Error: ' + (result.data?.error || result.error || 'Something went wrong'));
            }
        });
    }

    // ============================================
    // NEWSLETTER → SENDS TO BACKEND
    // ============================================
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const input = this.querySelector('input');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;

            const result = await apiPost('/api/newsletter', { email: input.value });
            submitBtn.disabled = false;

            if (result.ok && result.data.success) {
                submitBtn.textContent = 'Subscribed!';
                input.value = '';
                setTimeout(() => { submitBtn.textContent = originalText; }, 2500);
            } else {
                submitBtn.textContent = result.data?.error || 'Failed';
                setTimeout(() => { submitBtn.textContent = originalText; }, 2500);
            }
        });
    }

    // ============================================
    // SMOOTH SCROLL for anchor links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // INITIALIZE
    // ============================================
    handleNavbarScroll();
    if (sections.length > 0) setActiveNavLink();
    if (heroImage) fadeHeroOnScroll();

})();