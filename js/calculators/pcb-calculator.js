// /js/calculators/pcb-calculator.js
// AICO Elektronik - PCB Price Calculator

(function() {
  'use strict';

  const config = window.AICO_CONFIG;
  const utils = window.AICO_UTILS;
  const api = window.AICO_API;

  // ==================== Pricing Configuration ====================
  
  const PRICING = {
    // Base prices per square cm
    basePricePerSqCm: {
      1: 0.15,
      2: 0.25,
      4: 0.45,
      6: 0.70,
      8: 1.00,
      10: 1.40,
      12: 1.80
    },

    // Material multipliers
    materials: {
      fr4: 1.0,
      aluminum: 1.5,
      rogers: 2.5,
      polyimide: 2.0
    },

    // Surface finish costs (per board)
    surfaceFinish: {
      hasl: 2.0,
      'hasl-lf': 2.5,
      enig: 8.0,
      osp: 1.5
    },

    // Production time multipliers
    productionTime: {
      standard: 1.0,
      express: 1.3,
      urgent: 1.6
    },

    // Quantity discounts
    quantityDiscounts: [
      { min: 1, max: 9, discount: 0 },
      { min: 10, max: 49, discount: 0.05 },
      { min: 50, max: 99, discount: 0.10 },
      { min: 100, max: 499, discount: 0.15 },
      { min: 500, max: 999, discount: 0.20 },
      { min: 1000, max: Infinity, discount: 0.25 }
    ],

    // Setup fee
    setupFee: 150,
    
    // Minimum order value
    minimumOrder: 200
  };

  // ==================== Calculator Class ====================
  
  class PCBCalculator {
    constructor() {
      this.form = document.getElementById('pcb-calculator-form');
      this.priceData = {
        layers: 2,
        quantity: 10,
        width: 100,
        height: 100,
        material: 'fr4',
        thickness: 1.6,
        surface: 'hasl',
        soldermaskColor: 'green',
        silkscreenColor: 'white',
        productionTime: 'standard'
      };
      
      this.init();
    }

    init() {
      if (!this.form) return;

      // Bind form inputs
      this.bindFormInputs();
      
      // Initial calculation
      this.calculate();
      
      // Load FAQ
      this.loadFAQ();
      
      // Bind action buttons
      this.bindActions();
    }

    bindFormInputs() {
      // Get all form inputs
      const inputs = this.form.querySelectorAll('input, select');
      
      inputs.forEach(input => {
        input.addEventListener('change', () => this.handleInputChange(input));
        input.addEventListener('input', () => {
          if (input.type === 'number' || input.type === 'text') {
            utils.debounce(() => this.handleInputChange(input), 300)();
          }
        });
      });
    }

    handleInputChange(input) {
      const name = input.name || input.id;
      let value = input.value;

      // Handle different input types
      if (input.type === 'number') {
        value = parseFloat(value);
      } else if (input.type === 'radio') {
        if (!input.checked) return;
      }

      // Update price data
      switch (name) {
        case 'layers':
          this.priceData.layers = parseInt(value);
          break;
        case 'quantity':
          this.priceData.quantity = value;
          break;
        case 'width':
          this.priceData.width = value;
          this.updateDimensionPreview();
          break;
        case 'height':
          this.priceData.height = value;
          this.updateDimensionPreview();
          break;
        case 'material':
          this.priceData.material = value;
          break;
        case 'thickness':
          this.priceData.thickness = value;
          break;
        case 'surface':
          this.priceData.surface = value;
          break;
        case 'soldermask-color':
          this.priceData.soldermaskColor = value;
          break;
        case 'silkscreen-color':
          this.priceData.silkscreenColor = value;
          break;
        case 'production-time':
          this.priceData.productionTime = value;
          break;
      }

      // Recalculate
      this.calculate();
    }

    calculate() {
      // Calculate area in square cm
      const area = (this.priceData.width * this.priceData.height) / 100;
      
      // Base price
      const basePrice = area * PRICING.basePricePerSqCm[this.priceData.layers];
      
      // Material multiplier
      const materialMultiplier = PRICING.materials[this.priceData.material];
      
      // Surface finish cost per board
      const surfaceCost = PRICING.surfaceFinish[this.priceData.surface];
      
      // Production time multiplier
      const timeMultiplier = PRICING.productionTime[this.priceData.productionTime];
      
      // Calculate price per board
      let pricePerBoard = (basePrice * materialMultiplier + surfaceCost) * timeMultiplier;
      
      // Total before discount
      let totalBeforeDiscount = pricePerBoard * this.priceData.quantity;
      
      // Add setup fee for small quantities
      if (this.priceData.quantity < 50) {
        totalBeforeDiscount += PRICING.setupFee;
      }
      
      // Apply quantity discount
      const discountRate = this.getQuantityDiscount(this.priceData.quantity);
      const discountAmount = totalBeforeDiscount * discountRate;
      
      // Final total
      let finalTotal = totalBeforeDiscount - discountAmount;
      
      // Apply minimum order
      if (finalTotal < PRICING.minimumOrder) {
        finalTotal = PRICING.minimumOrder;
      }
      
      // Update UI
      this.updatePriceSummary({
        basePrice: pricePerBoard * this.priceData.quantity,
        surfaceFinish: surfaceCost * this.priceData.quantity,
        discount: discountAmount,
        total: finalTotal,
        pricePerBoard: pricePerBoard
      });
    }

    getQuantityDiscount(quantity) {
      const discount = PRICING.quantityDiscounts.find(d => 
        quantity >= d.min && quantity <= d.max
      );
      return discount ? discount.discount : 0;
    }

    updatePriceSummary(prices) {
      // Update specs
      document.getElementById('summary-layers').textContent = `${this.priceData.layers} Katman`;
      document.getElementById('summary-dimensions').textContent = 
        `${this.priceData.width} x ${this.priceData.height} mm`;
      document.getElementById('summary-quantity').textContent = `${this.priceData.quantity} adet`;
      
      const materialNames = {
        fr4: 'FR-4',
        aluminum: 'Alüminyum',
        rogers: 'Rogers',
        polyimide: 'Polyimide'
      };
      document.getElementById('summary-material').textContent = materialNames[this.priceData.material];
      
      // Update prices
      document.getElementById('price-base').textContent = utils.formatCurrency(prices.basePrice);
      document.getElementById('price-surface').textContent = utils.formatCurrency(prices.surfaceFinish);
      document.getElementById('price-discount').textContent = 
        prices.discount > 0 ? `-${utils.formatCurrency(prices.discount)}` : utils.formatCurrency(0);
      
      // Update total
      const totalElement = document.querySelector('#total-price .amount');
      if (totalElement) {
        totalElement.textContent = utils.formatNumber(prices.total, 2);
      }
      
      // Save prices for later use
      this.currentPrices = prices;
    }

    updateDimensionPreview() {
      const box = document.getElementById('dimension-box');
      if (!box) return;

      const maxSize = 200; // px
      const width = this.priceData.width;
      const height = this.priceData.height;
      
      // Calculate scale
      const scale = Math.min(maxSize / width, maxSize / height);
      
      // Update box size
      box.style.width = `${width * scale}px`;
      box.style.height = `${height * scale}px`;
      
      // Update label
      const label = box.querySelector('.dimension-label');
      if (label) {
        label.textContent = `${width} x ${height} mm`;
      }
    }

    bindActions() {
      // Request quote button
      const quoteBtn = document.getElementById('request-quote');
      if (quoteBtn) {
        quoteBtn.addEventListener('click', () => this.requestQuote());
      }

      // Save calculation button
      const saveBtn = document.getElementById('save-calculation');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveCalculation());
      }

      // Form submit
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });
    }

    async requestQuote() {
      if (!this.currentPrices) {
        utils.notify('Lütfen önce hesaplama yapın', 'warning');
        return;
      }

      // Prepare quote data
      const quoteData = {
        type: 'pcb',
        specifications: this.priceData,
        pricing: this.currentPrices,
        date: new Date().toISOString()
      };

      try {
        // Save to localStorage for quote page
        utils.storage.set('pending-quote', quoteData);
        
        // Redirect to quote page
        window.location.href = '/pages/hesaplama/hizli-teklif.html';
      } catch (error) {
        console.error('Quote request failed:', error);
        utils.notify('Teklif isteği gönderilemedi', 'error');
      }
    }

    saveCalculation() {
      if (!this.currentPrices) {
        utils.notify('Lütfen önce hesaplama yapın', 'warning');
        return;
      }

      const calculation = {
        type: 'pcb',
        specifications: this.priceData,
        pricing: this.currentPrices,
        date: new Date().toISOString()
      };

      // Get existing calculations
      const saved = utils.storage.get('saved-calculations', []);
      
      // Add new calculation
      saved.push(calculation);
      
      // Keep only last 10
      if (saved.length > 10) {
        saved.shift();
      }
      
      // Save
      utils.storage.set('saved-calculations', saved);
      
      utils.notify('Hesaplama kaydedildi', 'success');
    }

    loadFAQ() {
      const faqContainer = document.getElementById('calculator-faq');
      if (!faqContainer) return;

      const faqItems = [
        {
          question: 'Minimum sipariş miktarı nedir?',
          answer: 'Minimum sipariş miktarımız 1 adettir. Ancak 50 adetin altındaki siparişler için kurulum ücreti uygulanmaktadır.'
        },
        {
          question: 'Teslimat süresi ne kadar?',
          answer: 'Standart teslimat süresi 7-10 iş günüdür. Hızlı üretim (3-5 gün) ve acil üretim (24-48 saat) seçeneklerimiz de mevcuttur.'
        },
        {
          question: 'Hangi dosya formatlarını kabul ediyorsunuz?',
          answer: 'Gerber (RS-274X), Eagle, Altium Designer, KiCad ve diğer standart PCB tasarım dosyalarını kabul ediyoruz.'
        },
        {
          question: 'Fiyatlara KDV dahil mi?',
          answer: 'Hayır, gösterilen fiyatlar KDV hariçtir. Faturada %20 KDV eklenir.'
        },
        {
          question: 'Prototip üretimi yapıyor musunuz?',
          answer: 'Evet, 1 adetten başlayarak prototip üretimi yapıyoruz. Prototip hizmetimiz hızlı teslimat ve uygun fiyat avantajları sunar.'
        }
      ];

      const html = faqItems.map((item, index) => `
        <div class="accordion__item">
          <button class="accordion__trigger" aria-expanded="false">
            <span>${item.question}</span>
            <svg class="accordion__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div class="accordion__content">
            <div class="accordion__body">
              ${item.answer}
            </div>
          </div>
        </div>
      `).join('');

      faqContainer.innerHTML = html;

      // Initialize accordion
      this.initAccordion(faqContainer);
    }

    initAccordion(container) {
      const triggers = container.querySelectorAll('.accordion__trigger');
      
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item = trigger.parentElement;
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          
          // Close all others
          triggers.forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            t.parentElement.classList.remove('accordion__item--active');
          });
          
          // Toggle current
          if (!isExpanded) {
            trigger.setAttribute('aria-expanded', 'true');
            item.classList.add('accordion__item--active');
          }
        });
      });
    }
  }

  // ==================== Initialize ====================

  function init() {
    new PCBCalculator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();