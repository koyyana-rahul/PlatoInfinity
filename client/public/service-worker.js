/**
 * PWA SERVICE WORKER SETUP
 * Enables offline menu & cart caching for Plato Menu
 * Allows customers to:
 * - Browse menu & cart offline
 * - Resyncs when reconnected
 * - Downloads menu at app install
 */

const CACHE_NAME = "plato-menu-v1";
const RUNTIME_CACHE = "plato-runtime-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/styles/index.css",
  "/offline.html",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback - serve cached data
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for failed navigation
            if (request.mode === "navigate") {
              return caches.match("/offline.html");
            }
            return new Response("Offline - Please check your connection", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
        }),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (request.method === "GET" && response.ok) {
            const clonedResponse = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
      .catch(() => {
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Background sync for offline orders
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncOfflineOrders());
  }
});

async function syncOfflineOrders() {
  try {
    const db = await openDatabase();
    const offlineOrders = await getOfflineOrders(db);

    for (const order of offlineOrders) {
      try {
        const response = await fetch("/api/order/place", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": order.sessionToken,
          },
          body: JSON.stringify(order),
        });

        if (response.ok) {
          await markOrderSynced(db, order.id);
        }
      } catch (error) {
        console.error("Failed to sync order:", error);
      }
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("platoMenuDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("offlineOrders")) {
        db.createObjectStore("offlineOrders", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("menu")) {
        db.createObjectStore("menu", { keyPath: "_id" });
      }
      if (!db.objectStoreNames.contains("cart")) {
        db.createObjectStore("cart", { keyPath: "id" });
      }
    };
  });
}

function getOfflineOrders(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineOrders"], "readonly");
    const store = transaction.objectStore("offlineOrders");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markOrderSynced(db, orderId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineOrders"], "readwrite");
    const store = transaction.objectStore("offlineOrders");
    const request = store.delete(orderId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
