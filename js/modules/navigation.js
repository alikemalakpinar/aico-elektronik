// /js/modules/navigation.js
// AICO Elektronik - Navigation System

(function() {
  'use strict';

  const navigationModule = {
    currentPath: window.location.pathname,
    mobileMenuOpen: false,
    searchOpen: false,

    /**
     * Initialize navigation
     */
    init() {
      this.cacheElements();
      this.bindEvents();
      this.setActiveLinks();
      this.handleScrollBehavior();
      
      console.log('[Navigation] Initialized');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        // Mobile menu
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileMenuClose: document.getElementById('mobile-menu-close'),
        mobileMenuOverlay: document.getElementById('mobile-menu-overlay'),

        // Navigation
        navLinks: document.querySelectorAll('.nav__link'),
        dropdownTriggers: document.querySelectorAll('.nav__item--dropdown'),
        
        // Search
        searchBtn: document.getElementById('search-btn'),
        searchModal: document.getElementById('search-modal'),
        searchClose: document.getElementById('search-close'),
        searchInput: document.getElementById('search-input'),

        // Header
        header: document.querySelector('.header'),
        
        // Breadcrumbs
        breadcrumbs: document.querySelectorAll('.breadcrumb')
      };
    },

    /**
     * Bind events
     */
    bindEvents() {
      // Mobile menu toggle
      if (this.elements.mobileMenuBtn) {
        this.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
      }

      if (this.elements.mobileMenuClose) {
        this.elements.mobileMenuClose.addEventListener('click', () => this.closeMobileMenu());
      }

      if (this.elements.mobileMenuOverlay) {
        this.elements.mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
      }

      // Dropdown menus
      this.elements.dropdownTriggers.forEach(trigger => {
        const link = trigger.querySelector('.nav__link');
        
        // Desktop hover
        trigger.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 1025) {
            this.openDropdown(trigger);
          }
        });

        trigger.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 1025) {
            this.closeDropdown(trigger);
          }
        });

        // Mobile click
        if (link) {
          link.addEventListener('click', (e) => {
            if (window.innerWidth < 1025) {
              e.preventDefault();
              this.toggleDropdown(trigger);
            }
          });
        }
      });

      // Search
      if (this.elements.searchBtn) {
        this.elements.searchBtn.addEventListener('click', () => this.openSearch());
      }

      if (this.elements.searchClose) {
        this.elements.searchClose.addEventListener('click', () => this.closeSearch());
      }

      // ESC key to close menus
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeMobileMenu();
          this.closeSearch();
        }
      });

      // Close mobile menu on resize
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1025 && this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      });

      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href !== '#' && href !== '#!') {
            e.preventDefault();
            this.smoothScrollTo(href);
          }
        });
      });
    },

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    },

    /**
     * Open mobile menu
     */
    openMobileMenu() {
      this.mobileMenuOpen = true;
      
      if (this.elements.mobileMenu) {
        this.elements.mobileMenu.classList.add('mobile-menu--open');
      }
      
      if (this.elements.mobileMenuOverlay) {
        this.elements.mobileMenuOverlay.classList.add('mobile-menu__overlay--visible');
      }

      document.body.style.overflow = 'hidden';
    },

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
      this.mobileMenuOpen = false;
      
      if (this.elements.mobileMenu) {
        this.elements.mobileMenu.classList.remove('mobile-menu--open');
      }
      
      if (this.elements.mobileMenuOverlay) {
        this.elements.mobileMenuOverlay.classList.remove('mobile-menu__overlay--visible');
      }

      document.body.style.overflow = '';
    },

    /**
     * Open dropdown
     */
    openDropdown(trigger) {
      trigger.classList.add('nav__item--open');
      const dropdown = trigger.querySelector('.nav__dropdown');
      if (dropdown) {
        dropdown.style.display = 'block';
      }
    },

    /**
     * Close dropdown
     */
    closeDropdown(trigger) {
      trigger.classList.remove('nav__item--open');
      const dropdown = trigger.querySelector('.nav__dropdown');
      if (dropdown) {
        dropdown.style.display = '';
      }
    },

    /**
     * Toggle dropdown (mobile)
     */
    toggleDropdown(trigger) {
      const isOpen = trigger.classList.contains('nav__item--open');
      
      // Close all other dropdowns
      this.elements.dropdownTriggers.forEach(t => {
        if (t !== trigger) {
          this.closeDropdown(t);
        }
      });

      // Toggle current
      if (isOpen) {
        this.closeDropdown(trigger);
      } else {
        this.openDropdown(trigger);
      }
    },

    /**
     * Open search modal
     */
    openSearch() {
      this.searchOpen = true;
      
      if (this.elements.searchModal) {
        this.elements.searchModal.classList.add('search-modal--open');
      }

      // Focus input after animation
      setTimeout(() => {
        if (this.elements.searchInput) {
          this.elements.searchInput.focus();
        }
      }, 300);
    },

    /**
     * Close search modal
     */
    closeSearch() {
      this.searchOpen = false;
      
      if (this.elements.searchModal) {
        this.elements.searchModal.classList.remove('search-modal--open');
      }
    },

    /**
     * Set active navigation links
     */
    setActiveLinks() {
      const path = this.currentPath;
      
      this.elements.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === path || (href !== '/' && path.startsWith(href))) {
          link.classList.add('nav__link--active');
        } else {
          link.classList.remove('nav__link--active');
        }
      });
    },

    /**
     * Handle scroll behavior (sticky header)
     */
    handleScrollBehavior() {
      if (!this.elements.header) return;

      let lastScrollY = window.pageYOffset;
      let ticking = false;

      window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset;

        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateHeaderOnScroll(lastScrollY);
            ticking = false;
          });

          ticking = true;
        }
      }, { passive: true });
    },

    /**
     * Update header based on scroll position
     */
    updateHeaderOnScroll(scrollY) {
      const header = this.elements.header;
      
      if (scrollY > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    },

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(selector) {
      const target = document.querySelector(selector);
      
      if (target) {
        const headerHeight = this.elements.header?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        this.closeMobileMenu();
      }
    },

    /**
     * Navigate to page
     */
    navigateTo(url) {
      window.location.href = url;
    },

    /**
     * Navigate back
     */
    goBack() {
      window.history.back();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => navigationModule.init());
  } else {
    navigationModule.init();
  }

  // Export to global
  window.navigationModule = navigationModule;

})();