// /service-worker.js
// AICO Elektronik - Service Worker for PWA

const CACHE_VERSION = 'aico-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/reset.css',
  '/css/variables.css',
  '/css/typography.css',
  '/css/utilities.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/main.css',
  '/css/dark-mode.css',
  '/css/responsive.css',
  '/css/components/header.css',
  '/css/components/footer.css',
  '/js/config.js',
  '/js/utils.js',
  '/js/api-client.js',
  '/js/main.js',
  '/js/modules/dark-mode.js',
  '/js/modules/lazy-load.js',
  '/components/header.html',
  '/components/footer.html',
  '/components/newsletter.html',
  '/components/whatsapp-button.html',
  '/components/cookie-consent.html',
  '/pwa/offline.html'
];

// Maximum cache items
const MAX_CACHE_ITEMS = {
  dynamic: 50,
  images: 100
};

// ==================== Install Event ====================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
        // Kullanıcıya bildirim göster
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ERROR',
              message: 'Service Worker yüklenemedi'
            });
          });
        });
      })
  );
});

// ==================== Activate Event ====================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('aico-') && name !== CACHE_STATIC)
          .map(name => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[Service Worker] Activation complete');
      return self.clients.claim();
    })
    .catch((error) => {
      console.error('[Service Worker] Activation failed:', error);
    })
  );
});

// ==================== Fetch Event ====================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests (handle them separately)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetchWithNetworkFallback(request));
    return;
  }

  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_IMAGES, MAX_CACHE_ITEMS.images));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_STATIC));
  } else {
    event.respondWith(networkFirstStrategy(request, CACHE_DYNAMIC, MAX_CACHE_ITEMS.dynamic));
  }
});

// ==================== Caching Strategies ====================

/**
 * Cache First Strategy - Good for static assets
 */
async function cacheFirstStrategy(request, cacheName, maxItems = null) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      
      // Limit cache size if specified
      if (maxItems) {
        await limitCacheSize(cacheName, maxItems);
      }
      
      await cache.put(request, responseClone);
    }

    return networkResponse;

  } catch (error) {
    console.error('[Service Worker] Cache first strategy failed:', error);
    
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/pwa/offline.html');
    }
    
    throw error;
  }
}

/**
 * Network First Strategy - Good for dynamic content
 */
async function networkFirstStrategy(request, cacheName, maxItems = null) {
  try {
    console.log('[Service Worker] Network first:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      
      // Limit cache size if specified
      if (maxItems) {
        await limitCacheSize(cacheName, maxItems);
      }
      
      await cache.put(request, responseClone);
    }

    return networkResponse;

  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/pwa/offline.html');
    }
    
    throw error;
  }
}

/**
 * Network only with fallback - For API requests
 */
async function fetchWithNetworkFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[Service Worker] API request failed:', error);
    
    // Return custom offline response for API
    return new Response(
      JSON.stringify({
        success: false,
        error: 'İnternet bağlantısı yok',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// ==================== Helper Functions ====================

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  return request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font' ||
         /\.(css|js|woff|woff2|ttf|eot)$/i.test(request.url);
}

/**
 * Limit cache size
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    console.log(`[Service Worker] Deleting ${itemsToDelete} items from ${cacheName}`);
    
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ==================== Background Sync ====================

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncQuotes());
  }
});

async function syncQuotes() {
  try {
    // Get pending quotes from IndexedDB
    // Send them to server
    console.log('[Service Worker] Syncing quotes...');
    // Implementation depends on your backend
  } catch (error) {
    console.error('[Service Worker] Quote sync failed:', error);
  }
}

// ==================== Push Notifications ====================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'AICO Elektronik';
  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==================== Message Handler ====================

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});