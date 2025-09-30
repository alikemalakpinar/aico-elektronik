// /js/pages/about.js
// AICO Elektronik - About Page Functionality

(function() {
  'use strict';

  // ==================== Counter Animation ====================
  
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-item__number[data-count]');
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };
    
    const startCounting = (element) => {
      const target = parseInt(element.dataset.count);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };
      
      updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          startCounting(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
  }

  // ==================== Scroll Animations ====================
  
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (animatedElements.length === 0) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.aos;
          const delay = element.dataset.aosDelay || 0;
          
          setTimeout(() => {
            element.classList.add('aos-animate', `aos-${animation}`);
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(element => {
      element.classList.add('aos-init');
      observer.observe(element);
    });
  }

  // ==================== Timeline Progress ====================
  
  function animateTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const timelineBar = timeline.querySelector('::before');
    
    window.addEventListener('scroll', () => {
      const timelineTop = timeline.offsetTop;
      const timelineHeight = timeline.offsetHeight;
      const scrollPosition = window.pageYOffset + window.innerHeight;
      
      if (scrollPosition > timelineTop) {
        const progress = Math.min(
          ((scrollPosition - timelineTop) / timelineHeight) * 100,
          100
        );
        
        // This would require injecting a progress bar element
        // For simplicity, we're using CSS animations
      }
    });
  }

  // ==================== Initialize ====================
  
  function init() {
    animateCounters();
    initScrollAnimations();
    animateTimeline();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();