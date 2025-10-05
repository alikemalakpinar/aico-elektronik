// /js/modules/form-validation.js
// AICO Elektronik - Form Validation Module

(function() {
  'use strict';

  class FormValidator {
    constructor(form, options = {}) {
      this.form = form;
      this.options = {
        errorClass: 'error',
        errorMessageClass: 'error-message',
        successClass: 'success',
        validateOnBlur: true,
        validateOnInput: true,
        ...options
      };
      
      this.validators = this.setupValidators();
      this.init();
    }

    init() {
      if (!this.form) return;

      // Prevent default form submission
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));

      // Setup field validation
      const fields = this.form.querySelectorAll('input, textarea, select');
      fields.forEach(field => this.setupFieldValidation(field));
    }

    setupFieldValidation(field) {
      if (this.options.validateOnBlur) {
        field.addEventListener('blur', () => this.validateField(field));
      }

      if (this.options.validateOnInput) {
        field.addEventListener('input', () => {
          if (field.classList.contains(this.options.errorClass)) {
            this.validateField(field);
          }
        });
      }
    }

    setupValidators() {
      return {
        required: (value) => {
          return value.trim() !== '';
        },

        email: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },

        phone: (value) => {
          const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
          return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
        },

        minLength: (value, length) => {
          return value.length >= parseInt(length);
        },

        maxLength: (value, length) => {
          return value.length <= parseInt(length);
        },

        min: (value, min) => {
          return parseFloat(value) >= parseFloat(min);
        },

        max: (value, max) => {
          return parseFloat(value) <= parseFloat(max);
        },

        pattern: (value, pattern) => {
          const regex = new RegExp(pattern);
          return regex.test(value);
        },

        url: (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },

        number: (value) => {
          return !isNaN(value) && value.trim() !== '';
        },

        integer: (value) => {
          return Number.isInteger(parseFloat(value));
        },

        match: (value, fieldId) => {
          const matchField = this.form.querySelector(`#${fieldId}`);
          return matchField ? value === matchField.value : true;
        }
      };
    }

    validateField(field) {
      const value = field.value;
      const validations = this.getFieldValidations(field);
      
      // Clear previous errors
      this.clearFieldError(field);

      // Check each validation rule
      for (const validation of validations) {
        const isValid = this.runValidation(validation, value);
        
        if (!isValid) {
          this.showFieldError(field, validation.message);
          return false;
        }
      }

      // Field is valid
      this.showFieldSuccess(field);
      return true;
    }

    getFieldValidations(field) {
      const validations = [];

      // Required
      if (field.hasAttribute('required')) {
        validations.push({
          type: 'required',
          message: field.dataset.errorRequired || 'Bu alan zorunludur'
        });
      }

      // Email
      if (field.type === 'email') {
        validations.push({
          type: 'email',
          message: field.dataset.errorEmail || 'Geçerli bir e-posta adresi giriniz'
        });
      }

      // Phone
      if (field.type === 'tel') {
        validations.push({
          type: 'phone',
          message: field.dataset.errorPhone || 'Geçerli bir telefon numarası giriniz'
        });
      }

      // URL
      if (field.type === 'url') {
        validations.push({
          type: 'url',
          message: field.dataset.errorUrl || 'Geçerli bir URL giriniz'
        });
      }

      // Number
      if (field.type === 'number') {
        validations.push({
          type: 'number',
          message: field.dataset.errorNumber || 'Geçerli bir sayı giriniz'
        });
      }

      // Min length
      if (field.hasAttribute('minlength')) {
        validations.push({
          type: 'minLength',
          param: field.getAttribute('minlength'),
          message: field.dataset.errorMinlength || `En az ${field.getAttribute('minlength')} karakter giriniz`
        });
      }

      // Max length
      if (field.hasAttribute('maxlength')) {
        validations.push({
          type: 'maxLength',
          param: field.getAttribute('maxlength'),
          message: field.dataset.errorMaxlength || `En fazla ${field.getAttribute('maxlength')} karakter giriniz`
        });
      }

      // Min value
      if (field.hasAttribute('min')) {
        validations.push({
          type: 'min',
          param: field.getAttribute('min'),
          message: field.dataset.errorMin || `Minimum değer ${field.getAttribute('min')} olmalıdır`
        });
      }

      // Max value
      if (field.hasAttribute('max')) {
        validations.push({
          type: 'max',
          param: field.getAttribute('max'),
          message: field.dataset.errorMax || `Maximum değer ${field.getAttribute('max')} olmalıdır`
        });
      }

      // Pattern
      if (field.hasAttribute('pattern')) {
        validations.push({
          type: 'pattern',
          param: field.getAttribute('pattern'),
          message: field.dataset.errorPattern || 'Geçersiz format'
        });
      }

      // Match (password confirmation, etc.)
      if (field.dataset.match) {
        validations.push({
          type: 'match',
          param: field.dataset.match,
          message: field.dataset.errorMatch || 'Alanlar eşleşmiyor'
        });
      }

      return validations;
    }

    runValidation(validation, value) {
      const validator = this.validators[validation.type];
      
      if (!validator) {
        console.warn(`Validator not found: ${validation.type}`);
        return true;
      }

      return validator.call(this, value, validation.param);
    }

    showFieldError(field, message) {
  field.classList.add(this.options.errorClass);
  field.classList.remove(this.options.successClass);
  field.setAttribute('aria-invalid', 'true');

  // Create or update error message
  let errorElement = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);
  
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = this.options.errorMessageClass;
    errorElement.setAttribute('role', 'alert');
    field.parentElement.appendChild(errorElement);
  }

  errorElement.textContent = message;

  // Link error message to field for screen readers - DÜZELTİLDİ
  const fieldId = field.id || field.name || `field-${Date.now()}`;
  const errorId = `${fieldId}-error`;
  
  errorElement.id = errorId;
  field.setAttribute('aria-describedby', errorId);

  // Focus error for better UX
  field.focus();
}


    showFieldSuccess(field) {
      field.classList.remove(this.options.errorClass);
      field.classList.add(this.options.successClass);
      field.setAttribute('aria-invalid', 'false');
    }

    clearFieldError(field) {
      field.classList.remove(this.options.errorClass, this.options.successClass);
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');

      const errorElement = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);
      if (errorElement) {
        errorElement.remove();
      }
    }

    handleSubmit(e) {
      e.preventDefault();

      // Validate all fields
      const fields = this.form.querySelectorAll('input, textarea, select');
      let isValid = true;
      let firstInvalidField = null;

      fields.forEach(field => {
        // Skip disabled and hidden fields
        if (field.disabled || field.type === 'hidden') return;

        const fieldValid = this.validateField(field);
        
        if (!fieldValid) {
          isValid = false;
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      });

      if (isValid) {
        // Form is valid, trigger success callback
        if (this.options.onSuccess) {
          this.options.onSuccess(this.form);
        } else {
          this.form.submit();
        }
      } else {
        // Focus first invalid field
        if (firstInvalidField) {
          firstInvalidField.focus();
          
          // Scroll to field
          firstInvalidField.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }

        // Trigger error callback
        if (this.options.onError) {
          this.options.onError(this.form);
        }
      }

      return isValid;
    }

    reset() {
      const fields = this.form.querySelectorAll('input, textarea, select');
      fields.forEach(field => this.clearFieldError(field));
      this.form.reset();
    }

    addCustomValidator(name, validator, message) {
      this.validators[name] = validator;
    }
  }

  // Auto-initialize forms with data-validate attribute
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      new FormValidator(form);
    });
  });

  // Export to window
  window.FormValidator = FormValidator;

})();