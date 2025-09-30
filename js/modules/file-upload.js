// /js/modules/file-upload.js
// AICO Elektronik - Gerber File Upload & Preview System

(function() {
  'use strict';

  const fileUploadModule = {
    uploadedFiles: [],
    currentStep: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedExtensions: ['.gbr', '.art', '.drl', '.nc', '.zip', '.rar', '.gbl', '.gtl', '.gbs', '.gts'],
    
    gerberData: {
      layers: [],
      dimensions: { width: 0, height: 0 },
      drills: 0,
      detected: false
    },

    /**
     * Initialize file upload system
     */
    init() {
      this.cacheElements();
      this.bindEvents();
      this.initializeDropzone();
      
      console.log('[File Upload] Initialized');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        // Upload area
        dropzone: document.getElementById('gerber-dropzone'),
        fileInput: document.getElementById('gerber-file-input'),
        fileList: document.getElementById('uploaded-files-list'),
        uploadBtn: document.getElementById('upload-files-btn'),
        clearBtn: document.getElementById('clear-files-btn'),

        // Stepper
        stepper: document.getElementById('upload-stepper'),
        steps: document.querySelectorAll('.step'),
        
        // Step containers
        step1: document.getElementById('step-1-upload'),
        step2: document.getElementById('step-2-preview'),
        step3: document.getElementById('step-3-calculate'),

        // Navigation
        nextBtn: document.getElementById('next-step-btn'),
        prevBtn: document.getElementById('prev-step-btn'),
        analyzeBtn: document.getElementById('analyze-gerber-btn'),

        // Preview
        previewCanvas: document.getElementById('gerber-preview-canvas'),
        layerList: document.getElementById('layer-list'),
        dimensionsDisplay: document.getElementById('dimensions-display'),
        
        // Auto-fill
        autoFillWidth: document.getElementById('auto-width'),
        autoFillHeight: document.getElementById('auto-height'),
        autoFillLayers: document.getElementById('auto-layers')
      };
    },

    /**
     * Bind events
     */
    bindEvents() {
      // File input
      if (this.elements.fileInput) {
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
      }

      // Upload button
      if (this.elements.uploadBtn) {
        this.elements.uploadBtn.addEventListener('click', () => this.uploadFiles());
      }

      // Clear button
      if (this.elements.clearBtn) {
        this.elements.clearBtn.addEventListener('click', () => this.clearFiles());
      }

      // Navigation buttons
      if (this.elements.nextBtn) {
        this.elements.nextBtn.addEventListener('click', () => this.nextStep());
      }

      if (this.elements.prevBtn) {
        this.elements.prevBtn.addEventListener('click', () => this.prevStep());
      }

      // Analyze button
      if (this.elements.analyzeBtn) {
        this.elements.analyzeBtn.addEventListener('click', () => this.analyzeGerber());
      }
    },

    /**
     * Initialize dropzone
     */
    initializeDropzone() {
      if (!this.elements.dropzone) return;

      const dropzone = this.elements.dropzone;

      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      // Highlight dropzone when dragging over
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.add('file-upload__dropzone--active');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.remove('file-upload__dropzone--active');
        });
      });

      // Handle dropped files
      dropzone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
      });

      // Click to select files
      dropzone.addEventListener('click', () => {
        this.elements.fileInput?.click();
      });
    },

    /**
     * Handle file select from input
     */
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
    },

    /**
     * Process selected files
     */
    processFiles(files) {
      const validFiles = files.filter(file => this.validateFile(file));
      
      if (validFiles.length === 0) {
        window.utils?.notify('Geçerli dosya bulunamadı', 'error');
        return;
      }

      validFiles.forEach(file => {
        // Check for duplicates
        const isDuplicate = this.uploadedFiles.some(f => 
          f.name === file.name && f.size === file.size
        );

        if (!isDuplicate) {
          this.uploadedFiles.push({
            file: file,
            id: this.generateId(),
            name: file.name,
            size: file.size,
            type: this.detectFileType(file.name),
            uploaded: false
          });
        }
      });

      this.updateFileList();
      window.utils?.notify(`${validFiles.length} dosya eklendi`, 'success');
    },

    /**
     * Validate file
     */
    validateFile(file) {
      // Check file size
      if (file.size > this.maxFileSize) {
        window.utils?.notify(`${file.name} çok büyük (max 50MB)`, 'error');
        return false;
      }

      // Check extension
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        window.utils?.notify(`${file.name} desteklenmeyen format`, 'error');
        return false;
      }

      return true;
    },

    /**
     * Detect file type from name
     */
    detectFileType(filename) {
      const ext = filename.toLowerCase();
      
      if (ext.includes('.zip') || ext.includes('.rar')) return 'archive';
      if (ext.includes('.drl') || ext.includes('.nc')) return 'drill';
      if (ext.includes('.gbl') || ext.includes('bottom')) return 'bottom-layer';
      if (ext.includes('.gtl') || ext.includes('top')) return 'top-layer';
      if (ext.includes('.gbs') || ext.includes('bsilk')) return 'bottom-silk';
      if (ext.includes('.gts') || ext.includes('tsilk')) return 'top-silk';
      
      return 'gerber';
    },

    /**
     * Generate unique ID
     */
    generateId() {
      return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Update file list display
     */
    updateFileList() {
      if (!this.elements.fileList) return;

      if (this.uploadedFiles.length === 0) {
        this.elements.fileList.innerHTML = '<p class="text-muted">Henüz dosya eklenmedi</p>';
        return;
      }

      const html = this.uploadedFiles.map(file => `
        <div class="file-item" data-file-id="${file.id}">
          <div class="file-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
          <div class="file-item__info">
            <div class="file-item__name">${file.name}</div>
            <div class="file-item__size">${this.formatFileSize(file.size)} • ${file.type}</div>
          </div>
          <button type="button" class="file-item__remove" data-file-id="${file.id}" aria-label="Dosyayı kaldır">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `).join('');

      this.elements.fileList.innerHTML = html;

      // Bind remove buttons
      this.elements.fileList.querySelectorAll('.file-item__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const fileId = e.currentTarget.dataset.fileId;
          this.removeFile(fileId);
        });
      });
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Remove file from list
     */
    removeFile(fileId) {
      this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
      this.updateFileList();
      window.utils?.notify('Dosya kaldırıldı', 'info');
    },

    /**
     * Clear all files
     */
    clearFiles() {
      this.uploadedFiles = [];
      this.updateFileList();
      if (this.elements.fileInput) {
        this.elements.fileInput.value = '';
      }
      window.utils?.notify('Tüm dosyalar temizlendi', 'info');
    },

    /**
     * Upload files to server
     */
    async uploadFiles() {
      if (this.uploadedFiles.length === 0) {
        window.utils?.notify('Lütfen önce dosya ekleyin', 'warning');
        return;
      }

      window.utils?.notify('Dosyalar yükleniyor...', 'info');

      try {
        for (let fileData of this.uploadedFiles) {
          if (!fileData.uploaded) {
            // Simulate upload (replace with actual API call)
            await this.simulateUpload(fileData);
            fileData.uploaded = true;
          }
        }

        window.utils?.notify('Tüm dosyalar başarıyla yüklendi', 'success');
        this.nextStep();
        
      } catch (error) {
        console.error('Upload error:', error);
        window.utils?.notify('Dosya yükleme hatası', 'error');
      }
    },

    /**
     * Simulate file upload
     */
    simulateUpload(fileData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Uploaded:', fileData.name);
          resolve();
        }, 500);
      });
    },

    /**
     * Analyze Gerber files
     */
    analyzeGerber() {
      window.utils?.notify('Gerber dosyaları analiz ediliyor...', 'info');

      // Simulate analysis
      setTimeout(() => {
        this.gerberData = {
          layers: this.detectLayers(),
          dimensions: { width: 100, height: 80 },
          drills: 45,
          detected: true
        };

        this.displayAnalysisResults();
        this.autoFillCalculator();
        this.renderPreview();

        window.utils?.notify('Analiz tamamlandı', 'success');
      }, 1500);
    },

    /**
     * Detect layers from files
     */
    detectLayers() {
      const layers = [];
      const layerTypes = {};

      this.uploadedFiles.forEach(file => {
        if (!layerTypes[file.type]) {
          layerTypes[file.type] = true;
          layers.push({
            name: file.name,
            type: file.type
          });
        }
      });

      return layers;
    },

    /**
     * Display analysis results
     */
    displayAnalysisResults() {
      if (this.elements.layerList) {
        const html = this.gerberData.layers.map(layer => `
          <div class="layer-item">
            <span class="layer-icon">📄</span>
            <span class="layer-name">${layer.name}</span>
            <span class="layer-type">${layer.type}</span>
          </div>
        `).join('');
        this.elements.layerList.innerHTML = html;
      }

      if (this.elements.dimensionsDisplay) {
        this.elements.dimensionsDisplay.innerHTML = `
          <div class="dimension-item">
            <span class="label">Genişlik:</span>
            <span class="value">${this.gerberData.dimensions.width} mm</span>
          </div>
          <div class="dimension-item">
            <span class="label">Yükseklik:</span>
            <span class="value">${this.gerberData.dimensions.height} mm</span>
          </div>
          <div class="dimension-item">
            <span class="label">Delikler:</span>
            <span class="value">${this.gerberData.drills}</span>
          </div>
          <div class="dimension-item">
            <span class="label">Katmanlar:</span>
            <span class="value">${this.gerberData.layers.length}</span>
          </div>
        `;
      }
    },

    /**
     * Auto-fill calculator with detected values
     */
    autoFillCalculator() {
      if (this.elements.autoFillWidth) {
        this.elements.autoFillWidth.value = this.gerberData.dimensions.width;
      }

      if (this.elements.autoFillHeight) {
        this.elements.autoFillHeight.value = this.gerberData.dimensions.height;
      }

      if (this.elements.autoFillLayers) {
        this.elements.autoFillLayers.value = this.gerberData.layers.length;
      }

      // Trigger change event to update calculator
      [this.elements.autoFillWidth, this.elements.autoFillHeight, this.elements.autoFillLayers]
        .filter(el => el)
        .forEach(el => el.dispatchEvent(new Event('change')));
    },

    /**
     * Render Gerber preview (simplified)
     */
    renderPreview() {
      if (!this.elements.previewCanvas) return;

      const canvas = this.elements.previewCanvas;
      const ctx = canvas.getContext('2d');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw simple PCB representation
      ctx.fillStyle = '#2d5e2d';
      ctx.fillRect(50, 50, 300, 240);

      // Draw traces (simplified)
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 80);
      ctx.lineTo(150, 80);
      ctx.lineTo(150, 150);
      ctx.lineTo(220, 150);
      ctx.stroke();

      // Draw pads
      ctx.fillStyle = '#daa520';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 30, 200, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw dimension text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${this.gerberData.dimensions.width}mm × ${this.gerberData.dimensions.height}mm`, 140, 30);
    },

    /**
     * Navigation - Next step
     */
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++;
        this.updateStepDisplay();
      }
    },

    /**
     * Navigation - Previous step
     */
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateStepDisplay();
      }
    },

    /**
     * Update step display
     */
    updateStepDisplay() {
      // Update stepper
      if (this.elements.steps) {
        this.elements.steps.forEach((step, index) => {
          if (index < this.currentStep) {
            step.classList.add('step--completed');
            step.classList.remove('step--active');
          } else if (index === this.currentStep - 1) {
            step.classList.add('step--active');
            step.classList.remove('step--completed');
          } else {
            step.classList.remove('step--active', 'step--completed');
          }
        });
      }

      // Show/hide step containers
      [this.elements.step1, this.elements.step2, this.elements.step3].forEach((container, index) => {
        if (container) {
          container.style.display = (index === this.currentStep - 1) ? 'block' : 'none';
        }
      });

      // Update navigation buttons
      if (this.elements.prevBtn) {
        this.elements.prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
      }

      if (this.elements.nextBtn) {
        if (this.currentStep === 3) {
          this.elements.nextBtn.textContent = 'Hesapla';
        } else {
          this.elements.nextBtn.textContent = 'İleri';
        }
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fileUploadModule.init());
  } else {
    fileUploadModule.init();
  }

  // Export to global
  window.fileUploadModule = fileUploadModule;

})();