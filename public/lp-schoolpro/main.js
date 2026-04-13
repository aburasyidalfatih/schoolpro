/* ================================================================
   SchoolPro Landing Page — JavaScript
   Scroll Reveal | Counter Animation | Navbar | Mobile Menu
   ================================================================ */

function initLandingPage() {
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCounterAnimation();
  initSmoothScroll();
  initActiveNav();
  initCardTilt();
  initScrollProgress();
  initHeroCanvas();
  initFAQ();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}

/* ========================
   Navbar Scroll Effect
   ======================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ========================
   Mobile Menu
   ======================== */
function initMobileMenu() {
  const toggle = document.getElementById('navbar-toggle');
  const links = document.getElementById('navbar-links');
  const overlay = document.getElementById('mobile-overlay');
  if (!toggle || !links) return;

  const close = () => {
    toggle.classList.remove('active');
    links.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isActive = links.classList.contains('active');
    if (isActive) {
      close();
    } else {
      toggle.classList.add('active');
      links.classList.add('active');
      if (overlay) overlay.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  if (overlay) {
    overlay.addEventListener('click', close);
  }

  // Close on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ========================
   Scroll Reveal
   ======================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // Stagger children if parent has reveal-stagger
        if (entry.target.classList.contains('reveal-stagger')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('active');
            }, i * 100);
          });
        }

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ========================
   Counter Animation
   ======================== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(easedProgress * target);

      el.textContent = prefix + current.toLocaleString('id-ID') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString('id-ID') + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ========================
   Smooth Scroll
   ======================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });
}

/* ========================
   Active Nav Highlighting
   ======================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;

  let navTicking = false;

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(() => {
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
          const sectionTop = section.offsetTop - navbarHeight - 50;
          const sectionHeight = section.offsetHeight;
          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });

        navTicking = false;
      });
      navTicking = true;
    }
  }, { passive: true });
}

/* ========================
   Card 3D Tilt Effect
   ======================== */
function initCardTilt() {
  const cards = document.querySelectorAll('.bento-card, .pricing-card, .testimonial-card');
  if (!cards.length) return;

  // Only apply on desktop
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -3; // max 3 deg
      const rotateY = ((x - centerX) / centerX) * 3;  // max 3 deg
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
      card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease-out';
      card.style.zIndex = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

/* ========================
   Scroll Progress Indicator
   ======================== */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* ========================
   Theme Toggle (Light/Dark Mode)
   ======================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Initialize theme on load
  setTheme(getPreferredTheme());

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

/* ========================
   Hero Canvas Constellation
   ======================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  let isLightMode = false;
  
  // Mouse interaction tracker
  let mouse = { x: null, y: null, radius: 180 };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    // The hero section is the parent
    const hero = document.getElementById('hero');
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  function initParticles() {
    particles = [];
    // Adjust density based on screen. Fewer particles on small screens.
    const numParticles = Math.min(Math.floor((width * height) / 14000), 120);
    
    for (let i = 0; i < numParticles; i++) {
        // Randomly assign one of our hero accent colors
        const colorType = Math.random();
        particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2, // speed
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 1.5 + 0.5,
        colorType: colorType
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    
    // Draw connections first
    particles.forEach((p, index) => {
      // Connect to other particles
      for (let j = index + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          // Fade line based on distance
          const opacity = (1 - dist / 130) * 0.4;
          ctx.strokeStyle = isLightMode 
             ? `rgba(99, 102, 241, ${opacity})` // Indigo
             : `rgba(6, 182, 212, ${opacity})`; // Cyan
          ctx.lineWidth = 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      
      // Connect to mouse if close enough
      if (mouse.x != null) {
        let dx = p.x - mouse.x;
        let dy = p.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          ctx.beginPath();
          const opacity = (1 - dist / mouse.radius) * 0.8;
          ctx.strokeStyle = isLightMode
            ? `rgba(99, 102, 241, ${opacity})`
            : `rgba(16, 185, 129, ${opacity})`; // Emerald near mouse
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          
          // Repel gently
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }
    });

    // Draw nodes/particles on top
    particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off boundaries
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      
      // Determine colors based on type
      let fillColor;
      if (isLightMode) {
        fillColor = p.colorType > 0.5 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(16, 185, 129, 0.6)';
      } else {
        fillColor = p.colorType > 0.6 ? 'rgba(16, 185, 129, 0.8)' : (p.colorType > 0.3 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(99, 102, 241, 0.8)');
      }
      
      ctx.fillStyle = fillColor;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // Handle Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  draw();
}

/* ========================
   NEW: FAQ Accordion
   ======================== */
function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (!faqQuestions.length) return;

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      // Close all others
      faqQuestions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        const answer = q.nextElementSibling;
        answer.style.maxHeight = null;
      });

      // Toggle current
      if (!isExpanded) {
        question.setAttribute('aria-expanded', 'true');
        const answer = question.nextElementSibling;
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}
