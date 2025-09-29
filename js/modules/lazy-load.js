// /js/modules/lazy-load.js
// AICO Elektronik - Lazy Loading Module

(function() {
  'use strict';

  class LazyLoader {
    constructor(options = {}) {
      this.options = {
        root: null,
        rootMargin: '50px',
        threshold: 0,
        loadingClass: 'loading',
        loadedClass: 'loaded',
        errorClass: 'error',
        ...options
      };

      this.observer = null;
      this.init();
    }

    init() {
      // Check for IntersectionObserver support
      if (!('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        this.loadAllImages();
        return;
      }

      // Create observer
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          root: this.options.root,
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );

      // Observe all lazy elements
      this.observeElements();
    }

    observeElements() {
      // Images with data-src
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => this.observer.observe(img));

      // Background images with data-bg
      const lazyBackgrounds = document.querySelectorAll('[data-bg]');
      lazyBackgrounds.forEach(el => this.observer.observe(el));

      // Iframes with data-src
      const lazyIframes = document.querySelectorAll('iframe[data-src]');
      lazyIframes.forEach(iframe => this.observer.observe(iframe));

      // Videos with data-src
      const lazyVideos = document.querySelectorAll('video[data-src]');
      lazyVideos.forEach(video => this.observer.observe(video));
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }

    loadElement(element) {
      const tagName = element.tagName.toLowerCase();

      element.classList.add(this.options.loadingClass);

      switch (tagName) {
        case 'img':
          this.loadImage(element);
          break;
        case 'iframe':
          this.loadIframe(element);
          break;
        case 'video':
          this.loadVideo(element);
          break;
        default:
          this.loadBackgroundImage(element);
      }
    }

    loadImage(img) {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;

      if (!src) {
        console.warn('No data-src found for image:', img);
        return;
      }

      // Create temporary image to preload
      const tempImg = new Image();

      tempImg.onload = () => {
        img.src = src;
        
        if (srcset) {
          img.srcset = srcset;
        }

        img.classList.remove(this.options.loadingClass);
        img.classList.add(this.options.loadedClass);

        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;

        // Dispatch custom event
        img.dispatchEvent(new CustomEvent('lazyloaded'));
      };

      tempImg.onerror = () => {
        img.classList.remove(this.options.loadingClass);
        img.classList.add(this.options.errorClass);
        
        // Set fallback image if specified
        if (img.dataset.fallback) {
          img.src = img.dataset.fallback;
        }

        img.dispatchEvent(new CustomEvent('lazyerror'));
      };

      tempImg.src = src;
      if (srcset) {
        tempImg.srcset = srcset;
      }
    }

    loadBackgroundImage(element) {
      const bg = element.dataset.bg;

      if (!bg) {
        console.warn('No data-bg found for element:', element);
        return;
      }

      // Preload background image
      const tempImg = new Image();

      tempImg.onload = () => {
        element.style.backgroundImage = `url('${bg}')`;
        element.classList.remove(this.options.loadingClass);
        element.classList.add(this.options.loadedClass);

        delete element.dataset.bg;

        element.dispatchEvent(new CustomEvent('lazyloaded'));
      };

      tempImg.onerror = () => {
        element.classList.remove(this.options.loadingClass);
        element.classList.add(this.options.errorClass);
        element.dispatchEvent(new CustomEvent('lazyerror'));
      };

      tempImg.src = bg;
    }

    loadIframe(iframe) {
      const src = iframe.dataset.src;

      if (!src) {
        console.warn('No data-src found for iframe:', iframe);
        return;
      }

      iframe.src = src;
      iframe.classList.remove(this.options.loadingClass);
      iframe.classList.add(this.options.loadedClass);

      delete iframe.dataset.src;

      iframe.addEventListener('load', () => {
        iframe.dispatchEvent(new CustomEvent('lazyloaded'));
      });
    }

    loadVideo(video) {
      const src = video.dataset.src;
      const poster = video.dataset.poster;

      if (!src) {
        console.warn('No data-src found for video:', video);
        return;
      }

      if (poster) {
        video.poster = poster;
        delete video.dataset.poster;
      }

      // Load video source
      const source = document.createElement('source');
      source.src = src;
      source.type = video.dataset.type || 'video/mp4';
      
      video.appendChild(source);
      video.load();

      video.classList.remove(this.options.loadingClass);
      video.classList.add(this.options.loadedClass);

      delete video.dataset.src;

      video.addEventListener('loadeddata', () => {
        video.dispatchEvent(new CustomEvent('lazyloaded'));
      });
    }

    loadAllImages() {
      // Fallback for browsers without IntersectionObserver
      const lazyElements = document.querySelectorAll('[data-src], [data-bg]');
      
      lazyElements.forEach(element => {
        this.loadElement(element);
      });
    }

    refresh() {
      // Re-observe new elements
      if (this.observer) {
        this.observeElements();
      }
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Auto-initialize on DOMContentLoaded
  let lazyLoader;

  function initLazyLoad() {
    lazyLoader = new LazyLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

  // Export to window
  window.LazyLoader = LazyLoader;
  window.refreshLazyLoad = () => {
    if (lazyLoader) {
      lazyLoader.refresh();
    }
  };

  // Listen for dynamic content
  const observeMutations = () => {
    const mutationObserver = new MutationObserver(() => {
      if (lazyLoader) {
        lazyLoader.refresh();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  if ('MutationObserver' in window) {
    observeMutations();
  }

})();