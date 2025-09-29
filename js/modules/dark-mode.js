// /js/modules/dark-mode.js
// AICO Elektronik - Dark Mode Toggle

(function() {
  'use strict';

  const STORAGE_KEY = 'theme';
  const THEME_ATTR = 'data-theme';
  const LIGHT = 'light';
  const DARK = 'dark';

  class DarkModeToggle {
    constructor() {
      this.theme = this.getStoredTheme() || this.getPreferredTheme();
      this.toggleButton = null;
      this.init();
    }

    init() {
      // Apply theme immediately
      this.applyTheme(this.theme);
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupToggle());
      } else {
        this.setupToggle();
      }
      
      // Listen for system theme changes
      this.watchSystemTheme();
    }

    setupToggle() {
      this.toggleButton = document.getElementById('theme-toggle');
      
      if (this.toggleButton) {
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Update button aria-label
        this.updateButtonLabel();
      }
    }

    getPreferredTheme() {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return DARK;
      }
      return LIGHT;
    }

    getStoredTheme() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Unable to access localStorage:', e);
        return null;
      }
    }

    setStoredTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Unable to save theme to localStorage:', e);
      }
    }

    applyTheme(theme) {
      document.documentElement.setAttribute(THEME_ATTR, theme);
      this.theme = theme;
      
      // Update meta theme-color for mobile browsers
      this.updateMetaThemeColor(theme);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme }
      }));
    }

    updateMetaThemeColor(theme) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === DARK ? '#0B0D12' : '#041E42');
      }
    }

    updateButtonLabel() {
      if (this.toggleButton) {
        const label = this.theme === DARK ? 'Açık Tema' : 'Koyu Tema';
        this.toggleButton.setAttribute('aria-label', label);
      }
    }

    toggle() {
      const newTheme = this.theme === LIGHT ? DARK : LIGHT;
      this.applyTheme(newTheme);
      this.setStoredTheme(newTheme);
      this.updateButtonLabel();
      
      // Add transition animation
      this.animateToggle();
    }

    animateToggle() {
      // Add a subtle transition effect
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 300);
    }

    watchSystemTheme() {
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Use addEventListener if available, otherwise use addListener (deprecated but for older browsers)
        const handler = (e) => {
          // Only auto-switch if user hasn't manually set a preference
          if (!this.getStoredTheme()) {
            this.applyTheme(e.matches ? DARK : LIGHT);
            this.updateButtonLabel();
          }
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handler);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handler);
        }
      }
    }

    getCurrentTheme() {
      return this.theme;
    }

    setTheme(theme) {
      if (theme === LIGHT || theme === DARK) {
        this.applyTheme(theme);
        this.setStoredTheme(theme);
        this.updateButtonLabel();
      }
    }
  }

  // Initialize dark mode
  const darkMode = new DarkModeToggle();

  // Export to window for external access
  window.DarkMode = {
    getCurrentTheme: () => darkMode.getCurrentTheme(),
    setTheme: (theme) => darkMode.setTheme(theme),
    toggle: () => darkMode.toggle()
  };

  // Listen for theme changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      darkMode.applyTheme(e.newValue);
      darkMode.updateButtonLabel();
    }
  });

})();