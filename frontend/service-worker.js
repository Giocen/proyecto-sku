// Evento 'install' para agregar los recursos esenciales a la caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('sku-cache-v1').then((cache) => {
      return cache.addAll([
        '/', // Página principal
        '/index.html', // Página principal HTML
        '/style.css', // Estilos CSS
        '/app.js', // Lógica de JavaScript
        '/manifest.json', // Manifesto de la aplicación
        '/assets/icon-192.png', // Icono 192px
        '/assets/icon-512.png' // Icono 512px
      ]);
    })
  );
});

// Evento 'activate' para limpiar cachés antiguas y mantener solo la versión actual
self.addEventListener('activate', (e) => {
  const cacheWhitelist = ['sku-cache-v1']; // Añadir más cachés si tienes versiones anteriores
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Eliminar cachés antiguas
          }
        })
      );
    })
  );
});

// Evento 'fetch' para manejar las solicitudes y las respuestas desde la caché
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Si hay una respuesta en la caché, devolverla
      if (response) {
        return response;
      }

      // Si no, hacer una solicitud de red
      return fetch(e.request).catch(() => {
        // Si la red falla (por ejemplo, si no hay conexión), intentar devolver un recurso de respaldo
        if (e.request.url.includes('.html')) {
          return caches.match('/offline.html'); // Página offline si es una solicitud HTML
        }
      });
    })
  );
});