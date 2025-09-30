// /js/main.js
// AICO Elektronik - Main Application Entry Point

(function() {
  'use strict';

  const app = {
    version: '1.0.0',
    initialized: false,

    /**
     * Initialize application
     */
    async init() {
      if (this.initialized) return;

      console.log(`[AICO App] Starting v${this.version}`);

      try {
        // Load components
        await this.loadComponents();

        // Initialize core modules
        this.initializeModules();

        // Setup global event listeners
        this.setupGlobalListeners();

        // Initialize page-specific features
        this.initializePageFeatures();

        this.initialized = true;
        console.log('[AICO App] Initialization complete');

      } catch (error) {
        console.error('[AICO App] Initialization failed:', error);
      }
    },

    /**
     * Load HTML components (header, footer, etc.)
     */
    async loadComponents() {
      const components = [
        { id: 'header-container', url: '/components/header.html' },
        { id: 'footer-container', url: '/components/footer.html' }
      ];

      const loadPromises = components.map(async (component) => {
        const container = document.getElementById(component.id);
        if (container) {
          try {
            const response = await fetch(component.url);
            if (response.ok) {
              const html = await response.text();
              container.innerHTML = html;
              console.log(`[Components] Loaded: ${component.url}`);
            }
          } catch (error) {
            console.error(`[Components] Failed to load ${component.url}:`, error);
          }
        }
      });

      await Promise.all(loadPromises);

      // Re-initialize navigation after header is loaded
      if (window.navigationModule) {
        setTimeout(() => window.navigationModule.init(), 100);
      }
    },

    /**
     * Initialize core modules
     */
    initializeModules() {
      const modules = [
        'darkModeModule',
        'lazyLoadModule',
        'parallaxModule',
        'morphModule',
        'microAnimations',
        'navigationModule'
      ];

      modules.forEach(moduleName => {
        if (window[moduleName] && typeof window[moduleName].init === 'function') {
          try {
            // Skip if already initialized
            if (!window[moduleName].initialized) {
              window[moduleName].init();
              console.log(`[Modules] Initialized: ${moduleName}`);
            }
          } catch (error) {
            console.error(`[Modules] Failed to initialize ${moduleName}:`, error);
          }
        }
      });
    },

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
      // Handle external links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="http"]');
        if (link && !link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });

      // Performance monitoring
      if (window.config?.features?.analytics) {
        this.monitorPerformance();
      }

      // Service Worker registration
      if ('serviceWorker' in navigator && window.config?.features?.pwa) {
        this.registerServiceWorker();
      }

      // Handle online/offline status
      window.addEventListener('online', () => {
        window.utils?.notify('İnternet bağlantısı yeniden kuruldu', 'success');
      });

      window.addEventListener('offline', () => {
        window.utils?.notify('İnternet bağlantısı kesildi', 'warning');
      });
    },

    /**
     * Initialize page-specific features
     */
    initializePageFeatures() {
      const path = window.location.pathname;

      // Home page
      if (path === '/' || path === '/index.html') {
        this.initHomePage();
      }

      // Calculator pages
      if (path.includes('/hesaplama/pcb-hesapla')) {
        this.initPCBCalculator();
      }

      if (path.includes('/hesaplama/dizgi-hesapla')) {
        this.initAssemblyCalculator();
      }

      if (path.includes('/hesaplama/gerber-yukle')) {
        this.initFileUpload();
      }

      // Product pages
      if (path.includes('/urunler/')) {
        this.initProductPage();
      }

      // Contact page
      if (path.includes('/iletisim')) {
        this.initContactPage();
      }

      // Blog pages
      if (path.includes('/blog/')) {
        this.initBlogPage();
      }
    },

    /**
     * Initialize home page features
     */
    initHomePage() {
      console.log('[Page] Initializing home page features');
      
      // Home page dynamic content is loaded by home.js
      // Add any additional home page specific logic here
    },

    /**
     * Initialize PCB calculator
     */
    initPCBCalculator() {
      console.log('[Page] Initializing PCB calculator');
      
      if (window.pcbCalculator) {
        // Calculator initializes itself
      }
    },

    /**
     * Initialize Assembly calculator
     */
    initAssemblyCalculator() {
      console.log('[Page] Initializing Assembly calculator');
      
      if (window.assemblyCalculator) {
        // Calculator initializes itself
      }
    },

    /**
     * Initialize file upload
     */
    initFileUpload() {
      console.log('[Page] Initializing file upload');
      
      if (window.fileUploadModule) {
        // Module initializes itself
      }
    },

    /**
     * Initialize product page
     */
    initProductPage() {
      console.log('[Page] Initializing product page features');
      
      // Product gallery
      this.initProductGallery();
      
      // Product tabs
      this.initProductTabs();
    },

    /**
     * Initialize product gallery
     */
    initProductGallery() {
      const gallery = document.querySelector('.product-gallery');
      if (!gallery) return;

      const thumbnails = gallery.querySelectorAll('.gallery-thumbnail');
      const mainImage = gallery.querySelector('.gallery-main img');

      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          
          // Update main image
          if (mainImage) {
            mainImage.src = thumb.dataset.full || thumb.src;
          }
        });
      });
    },

    /**
     * Initialize product tabs
     */
    initProductTabs() {
      const tabContainers = document.querySelectorAll('.tabs');
      
      tabContainers.forEach(container => {
        const triggers = container.querySelectorAll('.tabs__trigger');
        const panels = container.querySelectorAll('.tabs__panel');

        triggers.forEach(trigger => {
          trigger.addEventListener('click', () => {
            const targetId = trigger.dataset.tab;
            
            // Update triggers
            triggers.forEach(t => t.classList.remove('tabs__trigger--active'));
            trigger.classList.add('tabs__trigger--active');
            
            // Update panels
            panels.forEach(panel => {
              if (panel.id === targetId) {
                panel.classList.add('tabs__panel--active');
              } else {
                panel.classList.remove('tabs__panel--active');
              }
            });
          });
        });
      });
    },

    /**
     * Initialize contact page
     */
    initContactPage() {
      console.log('[Page] Initializing contact page');
      
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleContactFormSubmit(e.target);
        });
      }
    },

    /**
     * Handle contact form submission
     */
    async handleContactFormSubmit(form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        window.utils?.notify('Mesajınız gönderiliyor...', 'info');

        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        window.utils?.notify('Mesajınız başarıyla gönderildi!', 'success');
        form.reset();

      } catch (error) {
        console.error('Form submission error:', error);
        window.utils?.notify('Mesaj gönderilemedi. Lütfen tekrar deneyin.', 'error');
      }
    },

    /**
     * Initialize blog page
     */
    initBlogPage() {
      console.log('[Page] Initializing blog page');
      
      // Blog search
      const searchInput = document.getElementById('blog-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filterBlogPosts(e.target.value);
        });
      }

      // Category filters
      const categoryFilters = document.querySelectorAll('.category-filter');
      categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
          e.preventDefault();
          const category = filter.dataset.category;
          this.filterByCategory(category);
        });
      });
    },

    /**
     * Filter blog posts by search term
     */
    filterBlogPosts(searchTerm) {
      const posts = document.querySelectorAll('.blog-card');
      const term = searchTerm.toLowerCase();

      posts.forEach(post => {
        const title = post.querySelector('.blog-card__title')?.textContent.toLowerCase() || '';
        const excerpt = post.querySelector('.blog-card__excerpt')?.textContent.toLowerCase() || '';
        
        if (title.includes(term) || excerpt.includes(term)) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    },

    /**
     * Filter blog posts by category
     */
    filterByCategory(category) {
      const posts = document.querySelectorAll('.blog-card');
      
      posts.forEach(post => {
        const postCategory = post.dataset.category;
        
        if (category === 'all' || postCategory === category) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    },

    /**
     * Register service worker
     */
    async registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[PWA] Service Worker registered:', registration);
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    },

    /**
     * Monitor performance
     */
    monitorPerformance() {
      if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`[Performance] Page load time: ${loadTime}ms`);
          }, 0);
        });
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }

  // Export to global
  window.app = app;

})();

// ==================== Global Error Handler ====================

window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// ==================== Console Welcome Message ====================

console.log(
  '%c🎨 AICO Elektronik',
  'font-size: 24px; font-weight: bold; color: #F4633A;'
);
console.log(
  '%cPCB Tasarım ve Üretim Çözümleri',
  'font-size: 14px; color: #041E42;'
);
console.log(
  '%cwww.aicoelektronik.com',
  'font-size: 12px; color: #10069F;'
);