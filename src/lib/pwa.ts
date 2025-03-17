export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
    const sw = '/sw.js';
    
    // Register the service worker
    navigator.serviceWorker
      .register(sw)
      .then((registration) => {
        console.log('Service Worker registered: ', registration);
        
        // Check for updates at the start
        registration.update();
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
          console.log('Checking for Service Worker update');
        }, 1000 * 60 * 60);
      })
      .catch((error) => {
        console.error('Service Worker registration failed: ', error);
      });
  }
}

// Function to store data in IndexedDB for offline access
export function saveDataForOffline(key: string, data: any) {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const dbName = 'realEstateCrmOfflineDB';
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      // Store the data with the specified key
      store.put({ id: key, value: data, timestamp: new Date().getTime() });
      
      console.log(`Data saved offline with key: ${key}`);
    };
    
    request.onerror = (event: any) => {
      console.error('Error opening IndexedDB:', event.target.error);
    };
  }
}

// Function to get data from IndexedDB
export function getOfflineData(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const dbName = 'realEstateCrmOfflineDB';
      const request = indexedDB.open(dbName, 1);
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['offlineData'], 'readonly');
        const store = transaction.objectStore('offlineData');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(getRequest.result.value);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = (error: any) => {
          reject(error);
        };
      };
      
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    } else {
      reject(new Error('IndexedDB not supported'));
    }
  });
}

// Function to check online status
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// Function to detect network changes
export function setupNetworkDetection(onlineCallback: () => void, offlineCallback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }
  return () => {};
} 