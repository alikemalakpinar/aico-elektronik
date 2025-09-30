// /js/calculators/assembly-calculator.js
// AICO Elektronik - PCB Assembly Calculator

(function() {
  'use strict';

  const assemblyCalculator = {
    // Pricing configuration
    pricing: {
      setup: {
        SMT: 150,
        THT: 100,
        Mixed: 200
      },
      componentPrices: {
        SMT: { 'single': 0.05, 'double': 0.08 },
        THT: { 'single': 0.15, 'double': 0.25 },
        Mixed: { 'single': 0.12, 'double': 0.20 }
      },
      stencilPrice: 80,
      testingPrices: {
        'none': 0,
        'visual': 2,
        'aoi': 5,
        'functional': 10
      }
    },

    state: {
      pcbQuantity: 10,
      assemblyType: 'SMT',
      sides: 'single',
      componentCount: 50,
      uniqueComponents: 20,
      needsStencil: true,
      testing: 'visual',
      bomProvided: false
    },

    /**
     * Initialize calculator
     */
    init() {
      this.cacheElements();
      this.bindEvents();
      this.loadSavedData();
      this.calculate();
      
      console.log('[Assembly Calculator] Initialized');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        // Inputs
        pcbQuantity: document.getElementById('assembly-quantity'),
        assemblyType: document.getElementById('assembly-type'),
        sides: document.getElementById('assembly-sides'),
        componentCount: document.getElementById('component-count'),
        uniqueComponents: document.getElementById('unique-components'),
        needsStencil: document.getElementById('needs-stencil'),
        testing: document.getElementById('testing-level'),
        bomProvided: document.getElementById('bom-provided'),

        // Outputs
        setupCost: document.getElementById('output-setup-cost'),
        componentCost: document.getElementById('output-component-cost'),
        stencilCost: document.getElementById('output-stencil-cost'),
        testingCost: document.getElementById('output-testing-cost'),
        unitCost: document.getElementById('output-unit-cost'),
        totalCost: document.getElementById('output-total-cost'),
        deliveryTime: document.getElementById('output-assembly-delivery'),

        // Buttons
        calculateBtn: document.getElementById('calculate-assembly-btn'),
        resetBtn: document.getElementById('reset-assembly-btn'),
        quoteBtn: document.getElementById('request-assembly-quote-btn'),

        // File upload
        bomFile: document.getElementById('bom-file'),
        bomFileLabel: document.getElementById('bom-file-label')
      };
    },

    /**
     * Bind events
     */
    bindEvents() {
      // Input changes
      ['pcbQuantity', 'assemblyType', 'sides', 'componentCount', 'uniqueComponents', 'testing'].forEach(key => {
        const element = this.elements[key];
        if (element) {
          element.addEventListener('change', () => this.handleInputChange());
          element.addEventListener('input', () => this.handleInputChange());
        }
      });

      // Checkbox changes
      if (this.elements.needsStencil) {
        this.elements.needsStencil.addEventListener('change', () => this.handleInputChange());
      }
      
      if (this.elements.bomProvided) {
        this.elements.bomProvided.addEventListener('change', () => this.handleInputChange());
      }

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

      // BOM file upload
      if (this.elements.bomFile) {
        this.elements.bomFile.addEventListener('change', (e) => this.handleBOMUpload(e));
      }

      // Real-time component count display
      if (this.elements.componentCount) {
        this.elements.componentCount.addEventListener('input', (e) => {
          const display = document.getElementById('component-count-value');
          if (display) display.textContent = e.target.value;
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
      this.state.pcbQuantity = parseInt(this.elements.pcbQuantity?.value) || 10;
      this.state.assemblyType = this.elements.assemblyType?.value || 'SMT';
      this.state.sides = this.elements.sides?.value || 'single';
      this.state.componentCount = parseInt(this.elements.componentCount?.value) || 50;
      this.state.uniqueComponents = parseInt(this.elements.uniqueComponents?.value) || 20;
      this.state.needsStencil = this.elements.needsStencil?.checked || false;
      this.state.testing = this.elements.testing?.value || 'visual';
      this.state.bomProvided = this.elements.bomProvided?.checked || false;
    },

    /**
     * Calculate assembly costs
     */
    calculate() {
      // Setup cost (one-time)
      const setupCost = this.pricing.setup[this.state.assemblyType] || 150;
      
      // Component placement cost per unit
      const componentRate = this.pricing.componentPrices[this.state.assemblyType][this.state.sides];
      const componentCostPerUnit = this.state.componentCount * componentRate;
      const totalComponentCost = componentCostPerUnit * this.state.pcbQuantity;
      
      // Stencil cost (one-time, only for SMT)
      const stencilCost = (this.state.assemblyType === 'SMT' || this.state.assemblyType === 'Mixed') && this.state.needsStencil
        ? this.pricing.stencilPrice
        : 0;
      
      // Testing cost per unit
      const testingCostPerUnit = this.pricing.testingPrices[this.state.testing] || 0;
      const totalTestingCost = testingCostPerUnit * this.state.pcbQuantity;
      
      // Total costs
      const totalOneTimeCosts = setupCost + stencilCost;
      const unitCost = componentCostPerUnit + testingCostPerUnit;
      const totalCost = totalOneTimeCosts + (unitCost * this.state.pcbQuantity);
      
      // Delivery estimation
      const deliveryDays = this.estimateDelivery();
      
      // Update UI
      this.updateOutputs({
        setupCost: setupCost.toFixed(2),
        componentCost: totalComponentCost.toFixed(2),
        stencilCost: stencilCost.toFixed(2),
        testingCost: totalTestingCost.toFixed(2),
        unitCost: unitCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        deliveryTime: deliveryDays
      });
    },

    /**
     * Estimate delivery time
     */
    estimateDelivery() {
      let days = 5; // Base assembly time
      
      if (this.state.componentCount > 100) days += 2;
      if (this.state.componentCount > 200) days += 3;
      if (this.state.sides === 'double') days += 2;
      if (this.state.assemblyType === 'Mixed') days += 2;
      if (this.state.testing === 'functional') days += 2;
      if (!this.state.bomProvided) days += 3; // BOM preparation time
      
      return days;
    },

    /**
     * Update output displays
     */
    updateOutputs(data) {
      if (this.elements.setupCost) {
        this.elements.setupCost.textContent = `₺${data.setupCost}`;
      }
      
      if (this.elements.componentCost) {
        this.elements.componentCost.textContent = `₺${data.componentCost}`;
      }
      
      if (this.elements.stencilCost) {
        this.elements.stencilCost.textContent = `₺${data.stencilCost}`;
        const stencilRow = this.elements.stencilCost.closest('.summary-row');
        if (stencilRow) {
          stencilRow.style.display = parseFloat(data.stencilCost) > 0 ? 'flex' : 'none';
        }
      }
      
      if (this.elements.testingCost) {
        this.elements.testingCost.textContent = `₺${data.testingCost}`;
      }
      
      if (this.elements.unitCost) {
        this.elements.unitCost.textContent = `₺${data.unitCost}`;
      }
      
      if (this.elements.totalCost) {
        this.elements.totalCost.textContent = `₺${data.totalCost}`;
        // Animate price change
        this.elements.totalCost.style.transform = 'scale(1.1)';
        setTimeout(() => {
          this.elements.totalCost.style.transform = 'scale(1)';
        }, 200);
      }
      
      if (this.elements.deliveryTime) {
        this.elements.deliveryTime.textContent = `${data.deliveryTime} iş günü`;
      }
    },

    /**
     * Handle BOM file upload
     */
    handleBOMUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Update label
      if (this.elements.bomFileLabel) {
        this.elements.bomFileLabel.textContent = file.name;
      }
      
      // Parse BOM if it's a CSV or Excel file
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.parseBOMFile(file);
      }
      
      // Mark BOM as provided
      if (this.elements.bomProvided) {
        this.elements.bomProvided.checked = true;
      }
      
      this.handleInputChange();
      window.utils?.notify('BOM dosyası yüklendi', 'success');
    },

    /**
     * Parse BOM file (basic parsing)
     */
    parseBOMFile(file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        
        // Simple CSV parsing (count lines)
        if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim());
          const componentCount = Math.max(0, lines.length - 1); // Exclude header
          
          if (this.elements.componentCount && componentCount > 0) {
            this.elements.componentCount.value = componentCount;
            this.handleInputChange();
          }
        }
      };
      
      reader.readAsText(file);
    },

    /**
     * Reset calculator
     */
    reset() {
      this.state = {
        pcbQuantity: 10,
        assemblyType: 'SMT',
        sides: 'single',
        componentCount: 50,
        uniqueComponents: 20,
        needsStencil: true,
        testing: 'visual',
        bomProvided: false
      };
      
      // Reset inputs
      Object.keys(this.state).forEach(key => {
        const element = this.elements[key];
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = this.state[key];
          } else {
            element.value = this.state[key];
          }
        }
      });
      
      // Reset file input
      if (this.elements.bomFile) {
        this.elements.bomFile.value = '';
      }
      if (this.elements.bomFileLabel) {
        this.elements.bomFileLabel.textContent = 'BOM Dosyası Seçin';
      }
      
      this.calculate();
      this.clearSavedData();
      
      window.utils?.notify('Hesaplayıcı sıfırlandı', 'info');
    },

    /**
     * Request quote
     */
    requestQuote() {
      const quoteData = {
        type: 'Assembly',
        specifications: this.state,
        pricing: {
          setupCost: this.elements.setupCost?.textContent,
          totalCost: this.elements.totalCost?.textContent,
          unitCost: this.elements.unitCost?.textContent,
          deliveryTime: this.elements.deliveryTime?.textContent
        },
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('quoteRequest', JSON.stringify(quoteData));
      window.location.href = '/pages/hesaplama/hizli-teklif.html?type=assembly';
    },

    /**
     * Save data
     */
    saveData() {
      try {
        localStorage.setItem('assemblyCalculatorState', JSON.stringify(this.state));
      } catch (e) {
        console.warn('[Assembly Calculator] Could not save state:', e);
      }
    },

    /**
     * Load saved data
     */
    loadSavedData() {
      try {
        const saved = localStorage.getItem('assemblyCalculatorState');
        if (saved) {
          const data = JSON.parse(saved);
          this.state = { ...this.state, ...data };
          
          // Restore inputs
          Object.keys(this.state).forEach(key => {
            const element = this.elements[key];
            if (element) {
              if (element.type === 'checkbox') {
                element.checked = this.state[key];
              } else {
                element.value = this.state[key];
              }
            }
          });
        }
      } catch (e) {
        console.warn('[Assembly Calculator] Could not load saved state:', e);
      }
    },

    /**
     * Clear saved data
     */
    clearSavedData() {
      try {
        localStorage.removeItem('assemblyCalculatorState');
      } catch (e) {
        console.warn('[Assembly Calculator] Could not clear saved state:', e);
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => assemblyCalculator.init());
  } else {
    assemblyCalculator.init();
  }

  // Export to global
  window.assemblyCalculator = assemblyCalculator;

})();