// /js/modules/parallax.js
// AICO Elektronik - Parallax Scroll Effects System

(function() {
  'use strict';

  const parallaxModule = {
    elements: [],
    rafId: null,
    lastScrollY: 0,
    ticking: false,
    reducedMotion: false,

    /**
     * Initialize parallax system
     */
    init() {
      // Check for reduced motion preference
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (this.reducedMotion) {
        console.log('[Parallax] Reduced motion enabled - parallax disabled');
        return;
      }

      this.collectElements();
      this.bindEvents();
      this.update();
      
      console.log('[Parallax] Initialized with', this.elements.length, 'elements');
    },

    /**
     * Collect all parallax elements
     * Usage: <div data-parallax="0.5" data-parallax-direction="vertical">
     */
    collectElements() {
      const layers = document.querySelectorAll('[data-parallax]');
      
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.parallax) || 0.5;
        const direction = layer.dataset.parallaxDirection || 'vertical';
        const offset = parseFloat(layer.dataset.parallaxOffset) || 0;
        
        this.elements.push({
          element: layer,
          speed: speed,
          direction: direction,
          offset: offset,
          initialTop: layer.offsetTop,
          rect: layer.getBoundingClientRect()
        });
      });
    },

    /**
     * Bind scroll events with passive listener
     */
    bindEvents() {
      window.addEventListener('scroll', () => {
        this.lastScrollY = window.pageYOffset;
        this.requestTick();
      }, { passive: true });

      // Re-collect elements on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.elements = [];
          this.collectElements();
        }, 250);
      }, { passive: true });
    },

    /**
     * Request animation frame (throttle)
     */
    requestTick() {
      if (!this.ticking) {
        this.rafId = requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    },

    /**
     * Update parallax positions
     */
    update() {
      this.ticking = false;
      const scrollY = this.lastScrollY;
      const windowHeight = window.innerHeight;

      this.elements.forEach(item => {
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        
        // Check if element is in viewport (with buffer)
        const isInViewport = rect.top < windowHeight + 200 && rect.bottom > -200;
        
        if (isInViewport) {
          // Calculate scroll progress (0 to 1)
          const scrollProgress = (scrollY - elementTop + windowHeight) / (windowHeight + elementHeight);
          
          // Calculate movement based on direction
          const movement = (scrollProgress - 0.5) * 100 * item.speed + item.offset;
          
          // Apply transform based on direction
          switch (item.direction) {
            case 'vertical':
              item.element.style.transform = `translate3d(0, ${movement}px, 0)`;
              break;
              
            case 'horizontal':
              item.element.style.transform = `translate3d(${movement}px, 0, 0)`;
              break;
              
            case 'scale':
              const scale = 1 + (scrollProgress * item.speed * 0.5);
              const clampedScale = Math.max(0.5, Math.min(1.5, scale));
              item.element.style.transform = `scale(${clampedScale})`;
              break;
              
            case 'rotate':
              const rotation = scrollProgress * item.speed * 360;
              item.element.style.transform = `rotate(${rotation}deg)`;
              break;
              
            case 'opacity':
              const opacity = 1 - (Math.abs(scrollProgress - 0.5) * 2 * item.speed);
              item.element.style.opacity = Math.max(0, Math.min(1, opacity));
              break;
              
            default:
              item.element.style.transform = `translate3d(0, ${movement}px, 0)`;
          }
        }
      });
    },

    /**
     * Destroy parallax system
     */
    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      
      // Reset all transforms
      this.elements.forEach(item => {
        item.element.style.transform = '';
        item.element.style.opacity = '';
      });
      
      this.elements = [];
      console.log('[Parallax] Destroyed');
    },

    /**
     * Pause parallax
     */
    pause() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    },

    /**
     * Resume parallax
     */
    resume() {
      if (!this.reducedMotion) {
        this.update();
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      parallaxModule.init();
    });
  } else {
    parallaxModule.init();
  }

  // Export to global scope
  window.parallaxModule = parallaxModule;

})();

