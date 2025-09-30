// /js/utils.js
// AICO Elektronik - Utility Functions

(function() {
  'use strict';

  window.AICO_UTILS = {
    
    // ==================== DOM Utilities ====================
    
    /**
     * Query selector with optional context
     */
    $: (selector, context = document) => {
      return context.querySelector(selector);
    },

    /**
     * Query selector all with optional context
     */
    $$: (selector, context = document) => {
      return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Create element with attributes and children
     */
    createElement: (tag, attributes = {}, children = []) => {
      const element = document.createElement(tag);
      
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
          element.className = value;
        } else if (key === 'dataset') {
          Object.entries(value).forEach(([dataKey, dataValue]) => {
            element.dataset[dataKey] = dataValue;
          });
        } else if (key.startsWith('on')) {
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else {
          element.setAttribute(key, value);
        }
      });

      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          element.appendChild(child);
        }
      });

      return element;
    },

    // ==================== String Utilities ====================

    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Convert to URL-friendly slug
     */
    slugify: (str) => {
      const trMap = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 
        'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
      };
      
      return str
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    /**
     * Truncate string with ellipsis
     */
    truncate: (str, length = 100, suffix = '...') => {
      if (str.length <= length) return str;
      return str.substring(0, length - suffix.length) + suffix;
    },

    // ==================== Number Utilities ====================

    /**
     * Format number with thousands separator
     */
    formatNumber: (num, decimals = 0) => {
      return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    },

    /**
     * Format currency
     */
    formatCurrency: (amount, currency = 'TRY') => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },

    /**
     * Clamp number between min and max
     */
    clamp: (num, min, max) => {
      return Math.min(Math.max(num, min), max);
    },

    /**
     * Generate random number between min and max
     */
    random: (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // ==================== Date Utilities ====================

    /**
     * Format date
     */
    formatDate: (date, format = 'DD.MM.YYYY') => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
    },

    /**
     * Get relative time string
     */
    timeAgo: (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      
      const intervals = {
        yıl: 31536000,
        ay: 2592000,
        hafta: 604800,
        gün: 86400,
        saat: 3600,
        dakika: 60,
        saniye: 1
      };

      for (const [name, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
          return `${interval} ${name} önce`;
        }
      }

      return 'Az önce';
    },

    // ==================== Validation Utilities ====================

    /**
     * Validate email
     */
    isValidEmail: (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },

    /**
     * Validate phone (Turkish format)
     */
    isValidPhone: (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length === 10 || cleaned.length === 11;
    },

    /**
     * Validate URL
     */
    isValidURL: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    // ==================== Array Utilities ====================

    /**
     * Remove duplicates from array
     */
    unique: (array) => {
      return [...new Set(array)];
    },

    /**
     * Group array by key
     */
    groupBy: (array, key) => {
      return array.reduce((result, item) => {
        const group = item[key];
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
      }, {});
    },

    /**
     * Chunk array into smaller arrays
     */
    chunk: (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },

    // ==================== Object Utilities ====================

    /**
     * Deep clone object
     */
    clone: (obj) => {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Deep merge objects
     */
    merge: (...objects) => {
      const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
      
      return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
          if (isObject(prev[key]) && isObject(obj[key])) {
            prev[key] = window.AICO_UTILS.merge(prev[key], obj[key]);
          } else {
            prev[key] = obj[key];
          }
        });
        return prev;
      }, {});
    },

    // ==================== Storage Utilities ====================

    /**
     * LocalStorage with JSON support
     */
    storage: {
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          console.error('Storage set error:', e);
          return false;
        }
      },

      get: (key, defaultValue = null) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
          console.error('Storage get error:', e);
          return defaultValue;
        }
      },

      remove: (key) => {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          console.error('Storage remove error:', e);
          return false;
        }
      },

      clear: () => {
        try {
          localStorage.clear();
          return true;
        } catch (e) {
          console.error('Storage clear error:', e);
          return false;
        }
      }
    },

    // ==================== URL Utilities ====================

    /**
     * Get query parameter
     */
    getQueryParam: (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },

    /**
     * Set query parameter
     */
    setQueryParam: (param, value) => {
      const url = new URL(window.location);
      url.searchParams.set(param, value);
      window.history.pushState({}, '', url);
    },

    /**
     * Parse query string to object
     */
    parseQueryString: (queryString = window.location.search) => {
      const params = new URLSearchParams(queryString);
      const result = {};
      for (const [key, value] of params) {
        result[key] = value;
      }
      return result;
    },

    // ==================== File Utilities ====================

    /**
     * Format file size
     */
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Get file extension
     */
    getFileExtension: (filename) => {
      return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    /**
     * Check file type
     */
    isFileType: (filename, types) => {
      const ext = window.AICO_UTILS.getFileExtension(filename).toLowerCase();
      return types.some(type => type.toLowerCase() === ext);
    },

    // ==================== Async Utilities ====================

    /**
     * Debounce function
     */
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function
     */
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Sleep/delay function
     */
    sleep: (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ==================== Cookie Utilities ====================

    /**
     * Cookie management
     */
    cookie: {
      set: (name, value, days = 365) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
      },

      get: (name) => {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      },

      delete: (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      }
    },

    // ==================== Notification Utilities ====================

    /**
     * Show toast notification
     */
    notify: (message, type = 'info', duration = 3000) => {
      const notification = window.AICO_UTILS.createElement('div', {
        class: `notification notification--${type}`,
        role: 'alert',
        'aria-live': 'polite'
      }, [message]);

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('notification--show');
      }, 10);

      setTimeout(() => {
        notification.classList.remove('notification--show');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, duration);
    },

    // ==================== Scroll Utilities ====================

    /**
     * Smooth scroll to element
     */
    scrollTo: (target, offset = 0) => {
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
      
      if (!element) return;

      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    },

    /**
     * Check if element is in viewport
     */
    isInViewport: (element, offset = 0) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= -offset &&
        rect.left >= -offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
      );
    },

    // ==================== Device Detection ====================

    /**
     * Device information
     */
    device: {
      isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTablet: () => /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
      isDesktop: () => !window.AICO_UTILS.device.isMobile() && !window.AICO_UTILS.device.isTablet(),
      isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      getOrientation: () => window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    },

    // ==================== Copy to Clipboard ====================

    /**
     * Copy text to clipboard
     */
    copyToClipboard: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        window.AICO_UTILS.notify('Panoya kopyalandı', 'success');
        return true;
      } catch (err) {
        console.error('Copy failed:', err);
        window.AICO_UTILS.notify('Kopyalama başarısız', 'error');
        return false;
      }
    },

    // ==================== Generate ID ====================

    /**
     * Generate unique ID
     */
    generateId: (prefix = 'id') => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

  };

})();