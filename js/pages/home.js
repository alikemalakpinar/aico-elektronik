// /js/pages/home.js
// AICO Elektronik - Home Page Dynamic Content

(function() {
  'use strict';

  // ==================== Product Data ====================
  const products = [
    {
      id: 'yangin-kartlari',
      category: 'Yangın Güvenlik',
      title: 'Yangın Alarm Kartları',
      description: 'Adresli ve konvansiyonel yangın algılama sistemleri için özel tasarlanmış elektronik kartlar.',
      image: '/images/products/fire-alarm.jpg',
      features: ['EN54 Sertifikalı', '24/7 Güvenilirlik', 'Kolay Entegrasyon'],
      url: '/pages/urunler/yangin-kartlari.html'
    },
    {
      id: 'maden-kartlari',
      category: 'Maden Güvenlik',
      title: 'Maden Güvenlik Kartları',
      description: 'Zorlu maden koşullarına dayanıklı, yüksek güvenlikli kontrol ve izleme sistemleri.',
      image: '/images/products/mining.jpg',
      features: ['Ex-proof Uyumlu', 'Darbe Dayanımlı', 'Geniş Sıcaklık Aralığı'],
      url: '/pages/urunler/maden-kartlari.html'
    },
    {
      id: 'iot-kartlari',
      category: 'IoT & Bağlantı',
      title: 'IoT Kontrol Kartları',
      description: 'Nesnelerin interneti uygulamaları için gelişmiş bağlantı ve kontrol çözümleri.',
      image: '/images/products/iot.jpg',
      features: ['WiFi/BLE/LoRa', 'Düşük Güç Tüketimi', 'Cloud Entegrasyonu'],
      url: '/pages/urunler/iot-kartlari.html'
    },
    {
      id: 'kahve-makinasi',
      category: 'Endüstriyel',
      title: 'Kahve Makinası Kartları',
      description: 'Profesyonel kahve makinaları için hassas kontrol ve otomasyon kartları.',
      image: '/images/products/coffee.jpg',
      features: ['Sıcaklık Kontrolü', 'Akıllı Zamanlama', 'Enerji Yönetimi'],
      url: '/pages/urunler/kahve-makinasi-kartlari.html'
    },
    {
      id: 'otomasyon-kartlari',
      category: 'Otomasyon',
      title: 'Endüstriyel Otomasyon',
      description: 'Üretim hatları ve fabrika otomasyonu için güvenilir kontrol çözümleri.',
      image: '/images/products/automation.jpg',
      features: ['PLC Uyumlu', 'Gerçek Zamanlı', 'Modüler Yapı'],
      url: '/pages/urunler/otomasyon-kartlari.html'
    },
    {
      id: 'ses-analiz',
      category: 'Ses Teknolojisi',
      title: 'Ses Analiz Kartları',
      description: 'Ses tanıma ve analiz sistemleri için yüksek performanslı işleme kartları.',
      image: '/images/products/audio.jpg',
      features: ['DSP İşlemci', 'Düşük Gecikme', 'Çoklu Kanal'],
      url: '/pages/urunler/ses-analiz-kartlari.html'
    }
  ];

  // ==================== Service Data ====================
  const services = [
    {
      number: '01',
      title: 'PCB Tasarım',
      description: 'Proje ihtiyaçlarınıza özel, profesyonel PCB tasarım hizmeti. Altium Designer ve Eagle ile en karmaşık tasarımları hayata geçiriyoruz.',
      url: '/pages/hizmetler/pcb-tasarim.html'
    },
    {
      number: '02',
      title: 'Prototipleme',
      description: 'Hızlı prototip üretimi ile fikrinizi 48 saat içinde test edin. Single sided\'dan multi-layer\'a kadar tüm prototip ihtiyaçlarınız için.',
      url: '/pages/hizmetler/prototipleme.html'
    },
    {
      number: '03',
      title: 'Kart Dizgi (SMT/THT)',
      description: 'Son teknoloji SMT ve THT montaj hatlarımızla 01005\'e kadar komponent yerleştirme. AOI ve X-Ray kontrol ile %99.9 kalite.',
      url: '/pages/hizmetler/kart-dizgi.html'
    },
    {
      number: '04',
      title: 'Seri Üretim',
      description: 'Küçük seriden büyük hacimlere kadar esnek üretim kapasitesi. ISO 9001 kalite güvencesi ile zamanında teslimat.',
      url: '/pages/hizmetler/seri-uretim.html'
    },
    {
      number: '05',
      title: 'Test & Kalite Kontrol',
      description: 'ICT, FCT ve burn-in testleri ile %100 fonksiyonel kontrol. Her ürün sertifikalı ve izlenebilir.',
      url: '/pages/hizmetler/test-ve-kalite.html'
    }
  ];

  // ==================== Testimonial Data ====================
  const testimonials = [
    {
      text: 'AICO Elektronik ile çalışmak gerçekten keyifliydi. Yangın alarm sistemlerimiz için ürettikleri kartlar mükemmel kalitede ve zamanında teslim edildi.',
      rating: 5,
      author: 'Mehmet Yılmaz',
      role: 'Proje Müdürü, Güvenlik Sistemleri A.Ş.',
      avatar: '/images/avatars/avatar1.jpg'
    },
    {
      text: 'Maden operasyonlarımız için kritik güvenlik kartlarını AICO\'ya emanet ettik. Zorlu koşullarda bile sorunsuz çalışıyorlar. Teşekkürler!',
      rating: 5,
      author: 'Ayşe Demir',
      role: 'Teknik Direktör, Maden İşletmeleri',
      avatar: '/images/avatars/avatar2.jpg'
    },
    {
      text: 'IoT projemiz için özel tasarım yaptılar. Hem tasarım hem üretim sürecinde profesyonel destek aldık. Kesinlikle tavsiye ediyorum.',
      rating: 5,
      author: 'Can Öztürk',
      role: 'Kurucu, TechStart IoT',
      avatar: '/images/avatars/avatar3.jpg'
    }
  ];

  // ==================== Partner Logos ====================
  const partners = [
    { name: 'Siemens', logo: '/images/partners/siemens.svg' },
    { name: 'Schneider Electric', logo: '/images/partners/schneider.svg' },
    { name: 'ABB', logo: '/images/partners/abb.svg' },
    { name: 'Bosch', logo: '/images/partners/bosch.svg' },
    { name: 'Honeywell', logo: '/images/partners/honeywell.svg' }
  ];

  // ==================== Render Functions ====================

  function renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const html = products.map(product => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.title}" class="product-card__image" loading="lazy">
        <div class="product-card__content">
          <span class="product-card__category">${product.category}</span>
          <h3 class="product-card__title">${product.title}</h3>
          <p class="product-card__description">${product.description}</p>
          <ul class="product-card__features">
            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
          <a href="${product.url}" class="product-card__link">
            Detaylı İncele
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </article>
    `).join('');

    container.innerHTML = html;
  }

  function renderServices() {
    const container = document.getElementById('services-timeline');
    if (!container) return;

    const html = services.map(service => `
      <div class="service-item">
        <div class="service-item__dot"></div>
        <div class="service-item__content">
          <span class="service-item__number">${service.number}</span>
          <h3 class="service-item__title">${service.title}</h3>
          <p class="service-item__description">${service.description}</p>
          <a href="${service.url}" class="service-item__link">
            Daha Fazla Bilgi
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  function renderTestimonials() {
    const container = document.getElementById('testimonials-slider');
    if (!container) return;

    const html = testimonials.map(testimonial => `
      <article class="testimonial-card">
        <div class="testimonial-card__rating">
          ${Array(testimonial.rating).fill('★').join('')}
        </div>
        <p class="testimonial-card__text">"${testimonial.text}"</p>
        <div class="testimonial-card__author">
          <img src="${testimonial.avatar}" alt="${testimonial.author}" class="testimonial-card__avatar" loading="lazy">
          <div class="testimonial-card__info">
            <span class="testimonial-card__name">${testimonial.author}</span>
            <span class="testimonial-card__role">${testimonial.role}</span>
          </div>
        </div>
      </article>
    `).join('');

    container.innerHTML = html;
  }

  function renderPartners() {
    const container = document.getElementById('partners-logos');
    if (!container) return;

    const html = partners.map(partner => `
      <img src="${partner.logo}" alt="${partner.name}" loading="lazy">
    `).join('');

    container.innerHTML = html;
  }

  // ==================== Initialize ====================

  function init() {
    renderProducts();
    renderServices();
    renderTestimonials();
    renderPartners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();