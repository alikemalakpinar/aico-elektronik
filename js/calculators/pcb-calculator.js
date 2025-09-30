// /js/calculators/pcb-calculator.js
// AICO Elektronik - PCB Price Calculator

(function() {
  'use strict';

  const pcbCalculator = {
    // Price tables (example values - adjust as needed)
    pricing: {
      basePrices: {
        1: 50, 2: 80, 4: 150, 6: 250, 8: 350, 10: 450, 12: 550
      },
      materialMultipliers: {
        'FR-4': 1.0,
        'Aluminum': 1.3,
        'Rogers': 2.5,
        'Polyimide': 2.0
      },
      thicknessMultipliers: {
        0.4: 1.2, 0.6: 1.1, 0.8: 1.0, 1.0: 1.0, 
        1.2: 1.05, 1.6: 1.1, 2.0: 1.15
      },
      colorMultipliers: {
        'Green': 1.0, 'Red': 1.05, 'Blue': 1.05,
        'Black': 1.1, 'White': 1.1, 'Yellow': 1.05
      },
      quantityDiscounts: [
        { min: 1, max: 4, discount: 0 },
        { min: 5, max: 9, discount: 0.05 },
        { min: 10, max: 49, discount: 0.10 },
        { min: 50, max: 99, discount: 0.15 },
        { min: 100, max: 499, discount: 0.20 },
        { min: 500, max: 999, discount: 0.25 },
        { min: 1000, max: Infinity, discount: 0.30 }
      ]
    },

    state: {
      width: 100,
      height: 100,
      quantity: 10,
      layers: 2,
      material: 'FR-4',
      thickness: 1.6,
      color: 'Green',
      surfaceFinish: 'HASL',
      copperThickness: '1oz'
    },

    /**
     * Initialize calculator
     */
    init() {
      this.cacheElements();
      this.bindEvents();
      this.loadSavedData();
      this.calculate();
      
      console.log('[PCB Calculator] Initialized');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        // Inputs
        width: document.getElementById('pcb-width'),
        height: document.getElementById('pcb-height'),
        quantity: document.getElementById('pcb-quantity'),
        layers: document.getElementById('pcb-layers'),
        material: document.getElementById('pcb-material'),
        thickness: document.getElementById('pcb-thickness'),
        color: document.getElementById('pcb-color'),
        surfaceFinish: document.getElementById('pcb-surface-finish'),
        copperThickness: document.getElementById('pcb-copper-thickness'),

        // Outputs
        area: document.getElementById('output-area'),
        unitPrice: document.getElementById('output-unit-price'),
        totalPrice: document.getElementById('output-total-price'),
        discount: document.getElementById('output-discount'),
        finalPrice: document.getElementById('output-final-price'),
        deliveryTime: document.getElementById('output-delivery'),

        // Buttons
        calculateBtn: document.getElementById('calculate-btn'),
        resetBtn: document.getElementById('reset-btn'),
        quoteBtn: document.getElementById('request-quote-btn'),

        // Preview
        previewCard: document.getElementById('pcb-preview-card')
      };
    },

    /**
     * Bind events
     */
    bindEvents() {
      // Input changes
      Object.keys(this.elements).forEach(key => {
        const element = this.elements[key];
        if (element && element.tagName && (element.tagName === 'INPUT' || element.tagName === 'SELECT')) {
          element.addEventListener('change', () => this.handleInputChange());
          element.addEventListener('input', () => this.handleInputChange());
        }
      });

      // Buttons
      if (this.elements.calculateBtn) {
        this.elements.calculateBtn.addEventListener('click', () => this.calculate());
      }

      if (this.elements.resetBtn) {
        this.elements.resetBtn.addEventListener('click', () => this.reset());
      }

      if (this.elements.quoteBtn) {
        this.elements.quoteBtn.addEventListener('click', () => this.requestQuote());
      }

      // Quantity slider
      if (this.elements.quantity) {
        this.elements.quantity.addEventListener('input', (e) => {
          const valueDisplay = document.getElementById('quantity-value');
          if (valueDisplay) {
            valueDisplay.textContent = e.target.value;
          }
        });
      }
    },

    /**
     * Handle input changes
     */
    handleInputChange() {
      this.updateState();
      this.calculate();
      this.saveData();
    },

    /**
     * Update state from inputs
     */
    updateState() {
      this.state.width = parseFloat(this.elements.width?.value) || 100;
      this.state.height = parseFloat(this.elements.height?.value) || 100;
      this.state.quantity = parseInt(this.elements.quantity?.value) || 10;
      this.state.layers = parseInt(this.elements.layers?.value) || 2;
      this.state.material = this.elements.material?.value || 'FR-4';
      this.state.thickness = parseFloat(this.elements.thickness?.value) || 1.6;
      this.state.color = this.elements.color?.value || 'Green';
      this.state.surfaceFinish = this.elements.surfaceFinish?.value || 'HASL';
      this.state.copperThickness = this.elements.copperThickness?.value || '1oz';
    },

    /**
     * Calculate prices
     */
    calculate() {
      // Calculate area
      const area = (this.state.width * this.state.height) / 10000; // cm²
      
      // Base price for layer count
      const basePrice = this.pricing.basePrices[this.state.layers] || 100;
      
      // Apply multipliers
      const materialMult = this.pricing.materialMultipliers[this.state.material] || 1.0;
      const thicknessMult = this.pricing.thicknessMultipliers[this.state.thickness] || 1.0;
      const colorMult = this.pricing.colorMultipliers[this.state.color] || 1.0;
      
      // Area factor (larger boards cost more)
      const areaFactor = Math.max(1, area / 100);
      
      // Calculate unit price
      const unitPrice = basePrice * materialMult * thicknessMult * colorMult * areaFactor;
      
      // Total before discount
      const totalBeforeDiscount = unitPrice * this.state.quantity;
      
      // Apply quantity discount
      const discountRate = this.getQuantityDiscount(this.state.quantity);
      const discountAmount = totalBeforeDiscount * discountRate;
      const finalPrice = totalBeforeDiscount - discountAmount;
      
      // Delivery time estimation
      const deliveryDays = this.estimateDelivery();
      
      // Update UI
      this.updateOutputs({
        area: area.toFixed(2),
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalBeforeDiscount.toFixed(2),
        discount: (discountRate * 100).toFixed(0),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        deliveryTime: deliveryDays
      });
      
      this.updatePreview();
    },

    /**
     * Get quantity discount rate
     */
    getQuantityDiscount(quantity) {
      const bracket = this.pricing.quantityDiscounts.find(
        b => quantity >= b.min && quantity <= b.max
      );
      return bracket ? bracket.discount : 0;
    },

    /**
     * Estimate delivery time
     */
    estimateDelivery() {
      let days = 3; // Base delivery
      
      if (this.state.layers > 4) days += 2;
      if (this.state.layers > 8) days += 3;
      if (this.state.material !== 'FR-4') days += 2;
      if (this.state.quantity > 100) days += 2;
      if (this.state.quantity > 500) days += 3;
      
      return days;
    },

    /**
     * Update output displays
     */
    updateOutputs(data) {
      if (this.elements.area) {
        this.elements.area.textContent = `${data.area} cm²`;
      }
      
      if (this.elements.unitPrice) {
        this.elements.unitPrice.textContent = `₺${data.unitPrice}`;
      }
      
      if (this.elements.totalPrice) {
        this.elements.totalPrice.textContent = `₺${data.totalPrice}`;
      }
      
      if (this.elements.discount) {
        this.elements.discount.textContent = `${data.discount}%`;
        const discountContainer = this.elements.discount.closest('.summary-row');
        if (discountContainer) {
          discountContainer.style.display = data.discount > 0 ? 'flex' : 'none';
        }
      }
      
      if (this.elements.finalPrice) {
        this.elements.finalPrice.textContent = `₺${data.finalPrice}`;
        // Animate price change
        this.elements.finalPrice.style.transform = 'scale(1.1)';
        setTimeout(() => {
          this.elements.finalPrice.style.transform = 'scale(1)';
        }, 200);
      }
      
      if (this.elements.deliveryTime) {
        this.elements.deliveryTime.textContent = `${data.deliveryTime} iş günü`;
      }
    },

    /**
     * Update preview card
     */
    updatePreview() {
      if (!this.elements.previewCard) return;
      
      const preview = this.elements.previewCard;
      
      // Update preview visually
      preview.style.backgroundColor = this.getColorHex(this.state.color);
      
      const specs = preview.querySelector('.preview-specs');
      if (specs) {
        specs.innerHTML = `
          <div class="spec-item">
            <span class="spec-label">Boyut:</span>
            <span class="spec-value">${this.state.width}×${this.state.height}mm</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Katman:</span>
            <span class="spec-value">${this.state.layers}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Malzeme:</span>
            <span class="spec-value">${this.state.material}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Kalınlık:</span>
            <span class="spec-value">${this.state.thickness}mm</span>
          </div>
        `;
      }
    },

    /**
     * Get color hex value
     */
    getColorHex(colorName) {
      const colors = {
        'Green': '#2d5e2d',
        'Red': '#8b1a1a',
        'Blue': '#1a3a8b',
        'Black': '#1a1a1a',
        'White': '#f5f5f5',
        'Yellow': '#ccaa00'
      };
      return colors[colorName] || '#2d5e2d';
    },

    /**
     * Reset calculator
     */
    reset() {
      this.state = {
        width: 100,
        height: 100,
        quantity: 10,
        layers: 2,
        material: 'FR-4',
        thickness: 1.6,
        color: 'Green',
        surfaceFinish: 'HASL',
        copperThickness: '1oz'
      };
      
      // Reset inputs
      if (this.elements.width) this.elements.width.value = 100;
      if (this.elements.height) this.elements.height.value = 100;
      if (this.elements.quantity) this.elements.quantity.value = 10;
      if (this.elements.layers) this.elements.layers.value = 2;
      if (this.elements.material) this.elements.material.value = 'FR-4';
      if (this.elements.thickness) this.elements.thickness.value = 1.6;
      if (this.elements.color) this.elements.color.value = 'Green';
      
      this.calculate();
      this.clearSavedData();
      
      window.utils?.notify('Hesaplayıcı sıfırlandı', 'info');
    },

    /**
     * Request quote
     */
    requestQuote() {
      const quoteData = {
        type: 'PCB',
        specifications: this.state,
        pricing: {
          unitPrice: this.elements.unitPrice?.textContent,
          totalPrice: this.elements.totalPrice?.textContent,
          finalPrice: this.elements.finalPrice?.textContent,
          deliveryTime: this.elements.deliveryTime?.textContent
        },
        timestamp: new Date().toISOString()
      };
      
      // Save to session storage
      sessionStorage.setItem('quoteRequest', JSON.stringify(quoteData));
      
      // Redirect to quote form
      window.location.href = '/pages/hesaplama/hizli-teklif.html?type=pcb';
    },

    /**
     * Save data to localStorage
     */
    saveData() {
      try {
        localStorage.setItem('pcbCalculatorState', JSON.stringify(this.state));
      } catch (e) {
        console.warn('[PCB Calculator] Could not save state:', e);
      }
    },

    /**
     * Load saved data
     */
    loadSavedData() {
      try {
        const saved = localStorage.getItem('pcbCalculatorState');
        if (saved) {
          const data = JSON.parse(saved);
          this.state = { ...this.state, ...data };
          
          // Restore input values
          Object.keys(this.state).forEach(key => {
            const element = this.elements[key];
            if (element) {
              element.value = this.state[key];
            }
          });
        }
      } catch (e) {
        console.warn('[PCB Calculator] Could not load saved state:', e);
      }
    },

    /**
     * Clear saved data
     */
    clearSavedData() {
      try {
        localStorage.removeItem('pcbCalculatorState');
      } catch (e) {
        console.warn('[PCB Calculator] Could not clear saved state:', e);
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pcbCalculator.init());
  } else {
    pcbCalculator.init();
  }

  // Export to global
  window.pcbCalculator = pcbCalculator;

})();