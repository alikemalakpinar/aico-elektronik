// /js/main.js
// AICO Elektronik - Main JavaScript

(function() {
  'use strict';

  // ==================== Utility Functions ====================
  
  // Debounce function for performance optimization
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ==================== Component Loader ====================
  
  async function loadComponent(containerId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const html = await response.text();
      const container = document.getElementById(containerId);
      
      if (container) {
        container.innerHTML = html;
        
        // Execute any inline scripts in the loaded component
        const scripts = container.getElementsByTagName('script');
        Array.from(scripts).forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.body.appendChild(newScript);
          document.body.removeChild(newScript);
        });
        
        // Reinitialize event listeners for the new content
        initializeComponentEvents(container);
      }
    } catch (error) {
      console.error(`Failed to load component ${componentPath}:`, error);
    }
  }

  // Initialize events for dynamically loaded components
  function initializeComponentEvents(container) {
    // Initialize dropdowns
    const dropdownTriggers = container.querySelectorAll('[aria-expanded]');
    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', handleDropdownToggle);
    });
    
    // Initialize other component-specific events
    if (container.id === 'header-container') {
      initializeHeader();
    }
  }

  // ==================== Header Functionality ====================
  
  function initializeHeader() {
    const header = document.querySelector('.header__nav');
    const menuToggle = document.getElementById('menu-toggle');
    const headerMenu = document.getElementById('header-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const languageSwitcher = document.querySelector('.language-switcher__toggle');
    
    // Sticky header on scroll
    if (header) {
      let lastScroll = 0;
      
      window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
          header.classList.add('scrolled');
          
          // Hide/show header based on scroll direction
          if (currentScroll > lastScroll && currentScroll > 300) {
            header.style.transform = 'translateY(-100%)';
          } else {
            header.style.transform = 'translateY(0)';
          }
        } else {
          header.classList.remove('scrolled');
          header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
      }, 100));
    }
    
    // Mobile menu toggle
    if (menuToggle && headerMenu) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        headerMenu.classList.toggle('show');
        document.body.classList.toggle('menu-open');
      });
    }
    
    // Theme toggle
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Trigger custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
      });
    }
    
    // Language switcher
    if (languageSwitcher) {
      languageSwitcher.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = languageSwitcher.getAttribute('aria-expanded') === 'true';
        languageSwitcher.setAttribute('aria-expanded', !isExpanded);
      });
      
      // Close on outside click
      document.addEventListener('click', () => {
        languageSwitcher.setAttribute('aria-expanded', 'false');
      });
    }
    
    // Dropdown menus
    const dropdownItems = document.querySelectorAll('.nav-menu__item--has-dropdown');
    
    dropdownItems.forEach(item => {
      const trigger = item.querySelector('.nav-menu__link');
      
      if (trigger) {
        // Desktop: hover
        if (window.innerWidth >= 1024) {
          item.addEventListener('mouseenter', () => {
            trigger.setAttribute('aria-expanded', 'true');
          });
          
          item.addEventListener('mouseleave', () => {
            trigger.setAttribute('aria-expanded', 'false');
          });
        } else {
          // Mobile: click
          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            
            // Close other dropdowns
            document.querySelectorAll('.nav-menu__item--has-dropdown .nav-menu__link').forEach(otherTrigger => {
              if (otherTrigger !== trigger) {
                otherTrigger.setAttribute('aria-expanded', 'false');
              }
            });
            
            trigger.setAttribute('aria-expanded', !isExpanded);
          });
        }
      }
    });
  }

  // ==================== Parallax Effect ====================
  
  function initializeParallax() {
    const parallaxElements = document.querySelectorAll('[data-speed]');
    
    if (parallaxElements.length === 0) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      parallaxElements.forEach(el => {
        el.style.transform = 'none';
      });
      return;
    }
    
    function updateParallax() {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }
    
    window.addEventListener('scroll', throttle(updateParallax, 16)); // 60fps
    updateParallax(); // Initial call
  }

  // ==================== Counter Animation ====================
  
  function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (counters.length === 0) return;
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };
    
    const startCounting = (element) => {
      const target = parseInt(element.dataset.count);
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };
      
      updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          startCounting(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
  }

  // ==================== Back to Top Button ====================
  
  function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', throttle(() => {
      if (window.pageYOffset > 500) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }, 200));
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==================== Smooth Scroll for Anchor Links ====================
  
  function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          const headerHeight = document.querySelector('.header__nav')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==================== Lazy Loading ====================
  
  function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length === 0) return;
    
    const imageObserverOptions = {
      threshold: 0,
      rootMargin: '50px'
    };
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, imageObserverOptions);
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ==================== Form Validation ====================
  
  function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
          const errorMsg = field.parentElement.querySelector('.error-message');
          
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            if (!errorMsg) {
              const error = document.createElement('span');
              error.className = 'error-message';
              error.textContent = 'Bu alan zorunludur';
              field.parentElement.appendChild(error);
            }
          } else {
            field.classList.remove('error');
            if (errorMsg) {
              errorMsg.remove();
            }
          }
          
          // Email validation
          if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
              isValid = false;
              field.classList.add('error');
              
              if (!errorMsg) {
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = 'Geçerli bir e-posta adresi giriniz';
                field.parentElement.appendChild(error);
              }
            }
          }
          
          // Phone validation
          if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(field.value) || field.value.length < 10) {
              isValid = false;
              field.classList.add('error');
              
              if (!errorMsg) {
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = 'Geçerli bir telefon numarası giriniz';
                field.parentElement.appendChild(error);
              }
            }
          }
        });
        
        if (isValid) {
          // Submit form or show success message
          this.submit();
        }
      });
      
      // Clear error on input
      form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', function() {
          if (this.classList.contains('error')) {
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) {
              errorMsg.remove();
            }
          }
        });
      });
    });
  }

  // ==================== Cookie Consent ====================
  
  function initializeCookieConsent() {
    const cookieConsent = document.querySelector('.cookie-consent');
    
    if (!cookieConsent) return;
    
    // Check if consent was already given
    if (localStorage.getItem('cookieConsent') === 'accepted') {
      cookieConsent.style.display = 'none';
      return;
    }
    
    // Show cookie consent after delay
    setTimeout(() => {
      cookieConsent.classList.add('show');
    }, 2000);
    
    // Handle accept button
    const acceptBtn = cookieConsent.querySelector('.cookie-consent__accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieConsent.classList.remove('show');
        setTimeout(() => {
          cookieConsent.style.display = 'none';
        }, 300);
      });
    }
    
    // Handle reject button
    const rejectBtn = cookieConsent.querySelector('.cookie-consent__reject');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieConsent.classList.remove('show');
        setTimeout(() => {
          cookieConsent.style.display = 'none';
        }, 300);
      });
    }
  }

  // ==================== AOS (Animate On Scroll) Alternative ====================
  
  function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (animatedElements.length === 0) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.aos;
          const delay = element.dataset.aosDelay || 0;
          
          setTimeout(() => {
            element.classList.add('aos-animate', `aos-${animation}`);
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(element => {
      element.classList.add('aos-init');
      observer.observe(element);
    });
  }

  // ==================== Handle Dropdown Toggle ====================
  
  function handleDropdownToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const trigger = e.currentTarget;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    // Close other dropdowns
    document.querySelectorAll('[aria-expanded="true"]').forEach(otherTrigger => {
      if (otherTrigger !== trigger) {
        otherTrigger.setAttribute('aria-expanded', 'false');
      }
    });
    
    trigger.setAttribute('aria-expanded', !isExpanded);
  }

  // ==================== Initialize Everything ====================
  
  function init() {
    // Load components
    const componentsToLoad = [
      { id: 'header-container', path: '/components/header.html' },
      { id: 'footer-container', path: '/components/footer.html' },
      { id: 'newsletter-container', path: '/components/newsletter.html' },
      { id: 'whatsapp-button-container', path: '/components/whatsapp-button.html' },
      { id: 'cookie-consent-container', path: '/components/cookie-consent.html' }
    ];
    
    componentsToLoad.forEach(component => {
      if (document.getElementById(component.id)) {
        loadComponent(component.id, component.path);
      }
    });
    
    // Initialize features after components are loaded
    setTimeout(() => {
      initializeParallax();
      initializeCounters();
      initializeBackToTop();
      initializeSmoothScroll();
      initializeLazyLoading();
      initializeFormValidation();
      initializeCookieConsent();
      initializeScrollAnimations();
    }, 500);
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Reinitialize header for mobile/desktop switch
        initializeHeader();
      }, 250);
    });
  }

  // ==================== Service Worker Registration ====================
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful:', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed:', err);
        });
    });
  }

  // ==================== Start the Application ====================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export functions for global use
  window.AICO = {
    loadComponent,
    debounce,
    throttle
  };

})();