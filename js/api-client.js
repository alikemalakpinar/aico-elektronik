// /js/api-client.js
// AICO Elektronik - API Client

(function() {
  'use strict';

  const config = window.AICO_CONFIG;
  const utils = window.AICO_UTILS;

  /**
   * API Client Class
   */
  class APIClient {
    constructor(baseURL = config.api.baseURL, timeout = config.api.timeout) {
      this.baseURL = baseURL;
      this.timeout = timeout;
      this.defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        signal: controller.signal
      };

      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle different response types
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType && contentType.includes('text/')) {
          data = await response.text();
        } else {
          data = await response.blob();
        }

        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
            data: data
          };
        }

        return {
          success: true,
          data: data,
          status: response.status,
          headers: response.headers
        };

      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw {
            success: false,
            error: 'İstek zaman aşımına uğradı',
            code: 'TIMEOUT'
          };
        }

        if (!navigator.onLine) {
          throw {
            success: false,
            error: 'İnternet bağlantısı yok',
            code: 'OFFLINE'
          };
        }

        throw {
          success: false,
          error: error.data?.message || error.statusText || 'Bir hata oluştu',
          status: error.status,
          code: error.code || 'UNKNOWN'
        };
      }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      return this.request(url, {
        method: 'GET'
      });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
      return this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
      return this.request(endpoint, {
        method: 'DELETE'
      });
    }

    /**
     * Upload file
     */
    async upload(endpoint, file, additionalData = {}) {
      const formData = new FormData();
      formData.append('file', file);

      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return this.request(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary
          'Content-Type': undefined
        }
      });
    }
  }

  // Create global instance
  const apiClient = new APIClient();

  /**
   * API Endpoints
   */
  window.AICO_API = {
    
    // ==================== Quote System ====================
    
    /**
     * Submit quote request
     */
    async submitQuote(quoteData) {
      try {
        const response = await apiClient.post(config.api.endpoints.quote, quoteData);
        
        if (response.success) {
          utils.notify('Teklifiniz başarıyla gönderildi', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'Teklif gönderilemedi', 'error');
        throw error;
      }
    },

    /**
     * Get quote by ID
     */
    async getQuote(quoteId) {
      try {
        return await apiClient.get(`${config.api.endpoints.quote}/${quoteId}`);
      } catch (error) {
        utils.notify('Teklif bilgisi alınamadı', 'error');
        throw error;
      }
    },

    // ==================== Calculator ====================
    
    /**
     * Calculate PCB price
     */
    async calculatePCBPrice(specs) {
      try {
        const response = await apiClient.post(`${config.api.endpoints.calculator}/pcb`, specs);
        return response;
      } catch (error) {
        utils.notify('Fiyat hesaplanamadı', 'error');
        throw error;
      }
    },

    /**
     * Calculate assembly price
     */
    async calculateAssemblyPrice(specs) {
      try {
        const response = await apiClient.post(`${config.api.endpoints.calculator}/assembly`, specs);
        return response;
      } catch (error) {
        utils.notify('Fiyat hesaplanamadı', 'error');
        throw error;
      }
    },

    // ==================== Contact Form ====================
    
    /**
     * Submit contact form
     */
    async submitContact(formData) {
      try {
        const response = await apiClient.post(config.api.endpoints.contact, formData);
        
        if (response.success) {
          utils.notify('Mesajınız başarıyla gönderildi', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'Mesaj gönderilemedi', 'error');
        throw error;
      }
    },

    // ==================== Newsletter ====================
    
    /**
     * Subscribe to newsletter
     */
    async subscribeNewsletter(email) {
      try {
        const response = await apiClient.post(config.api.endpoints.newsletter, { email });
        
        if (response.success) {
          utils.notify('Bültene başarıyla abone oldunuz', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'Abonelik başarısız', 'error');
        throw error;
      }
    },

    // ==================== File Upload ====================
    
    /**
     * Upload Gerber files
     */
    async uploadGerber(file, projectName = '') {
      try {
        utils.notify('Dosya yükleniyor...', 'info', 2000);
        
        const response = await apiClient.upload(
          config.api.endpoints.upload, 
          file,
          { projectName, type: 'gerber' }
        );
        
        if (response.success) {
          utils.notify('Dosya başarıyla yüklendi', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'Dosya yüklenemedi', 'error');
        throw error;
      }
    },

    /**
     * Upload BOM file
     */
    async uploadBOM(file, projectName = '') {
      try {
        utils.notify('BOM dosyası yükleniyor...', 'info', 2000);
        
        const response = await apiClient.upload(
          config.api.endpoints.upload,
          file,
          { projectName, type: 'bom' }
        );
        
        if (response.success) {
          utils.notify('BOM dosyası başarıyla yüklendi', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'BOM dosyası yüklenemedi', 'error');
        throw error;
      }
    },

    // ==================== Orders ====================
    
    /**
     * Create order
     */
    async createOrder(orderData) {
      try {
        const response = await apiClient.post(config.api.endpoints.orders, orderData);
        
        if (response.success) {
          utils.notify('Sipariş başarıyla oluşturuldu', 'success');
        }
        
        return response;
      } catch (error) {
        utils.notify(error.error || 'Sipariş oluşturulamadı', 'error');
        throw error;
      }
    },

    /**
     * Get order status
     */
    async getOrderStatus(orderId) {
      try {
        return await apiClient.get(`${config.api.endpoints.orders}/${orderId}/status`);
      } catch (error) {
        utils.notify('Sipariş durumu alınamadı', 'error');
        throw error;
      }
    },

    /**
     * Track order
     */
    async trackOrder(trackingNumber) {
      try {
        return await apiClient.get(`${config.api.endpoints.orders}/track/${trackingNumber}`);
      } catch (error) {
        utils.notify('Sipariş takibi yapılamadı', 'error');
        throw error;
      }
    }
  };

  // ==================== Network Status Monitoring ====================
  
  let isOnline = navigator.onLine;

  window.addEventListener('online', () => {
    if (!isOnline) {
      isOnline = true;
      utils.notify('İnternet bağlantısı yeniden kuruldu', 'success');
    }
  });

  window.addEventListener('offline', () => {
    if (isOnline) {
      isOnline = false;
      utils.notify('İnternet bağlantısı kesildi', 'error', 5000);
    }
  });

})();