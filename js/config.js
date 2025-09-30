// /js/config.js
// AICO Elektronik - Global Configuration

(function() {
  'use strict';

  window.AICO_CONFIG = {
    // API Configuration
    api: {
      baseURL: '/api',
      timeout: 30000,
      endpoints: {
        quote: '/quote',
        calculator: '/calculator',
        contact: '/contact',
        newsletter: '/newsletter',
        upload: '/upload',
        orders: '/orders'
      }
    },

    // Contact Information
    contact: {
      phone: '+90 (212) 345 67 89',
      email: 'info@aicoelektronik.com',
      whatsapp: '902123456789',
      address: {
        street: 'Organize Sanayi Bölgesi 1. Cadde No:123',
        city: 'İstanbul',
        postalCode: '34000',
        country: 'Türkiye'
      }
    },

    // Social Media Links
    social: {
      linkedin: 'https://linkedin.com/company/aico-elektronik',
      twitter: 'https://twitter.com/aicoelektronik',
      youtube: 'https://youtube.com/@aicoelektronik',
      instagram: 'https://instagram.com/aicoelektronik'
    },

    // Calculator Defaults
    calculator: {
      pcb: {
        minWidth: 10,
        maxWidth: 500,
        minHeight: 10,
        maxHeight: 500,
        minQuantity: 1,
        maxQuantity: 10000,
        defaultQuantity: 10,
        layers: [1, 2, 4, 6, 8, 10, 12],
        materials: ['FR-4', 'Aluminum', 'Rogers', 'Polyimide'],
        thickness: [0.4, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0],
        colors: ['Green', 'Red', 'Blue', 'Black', 'White', 'Yellow']
      },
      assembly: {
        minComponents: 1,
        maxComponents: 1000,
        types: ['SMT', 'THT', 'Mixed'],
        sides: ['Single', 'Double']
      }
    },

    // File Upload Settings
    upload: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/pdf',
        'image/jpeg',
        'image/png'
      ],
      gerberExtensions: ['.gbr', '.art', '.drl', '.nc', '.zip', '.rar']
    },

    // Animation Settings
    animation: {
      duration: {
        fast: 150,
        normal: 250,
        slow: 350
      },
      easing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },

    // Localization
    locale: {
      default: 'tr',
      available: ['tr', 'en'],
      currency: 'TRY',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH:mm'
    },

    // Feature Flags
    features: {
      darkMode: true,
      animations: true,
      parallax: true,
      analytics: true,
      chatBot: false,
      pwa: true
    },

    // SEO
    seo: {
      siteName: 'AICO Elektronik',
      siteUrl: 'https://www.aicoelektronik.com',
      defaultTitle: 'AICO Elektronik | PCB Tasarım ve Üretim',
      titleSeparator: '|',
      defaultDescription: 'Endüstriyel PCB tasarım, üretim ve montaj hizmetleri',
      defaultImage: '/images/og-image.jpg',
      twitterHandle: '@aicoelektronik'
    },

    // Google Analytics
    analytics: {
      gaId: 'G-XXXXXXXXXX', // Replace with actual GA ID
      enabled: true
    },

    // Version
    version: '1.0.0',
    buildDate: '2025-01-15'
  };

})();