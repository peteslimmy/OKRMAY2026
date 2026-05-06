// Jest setup to handle Vite-specific globals and environment
// This file must use plain JavaScript (no TypeScript syntax)

// Define importMeta for Vite compatibility
Object.defineProperty(globalThis, 'importMeta', {
  value: {
    env: {
      PROD: false,
      DEV: true,
      MODE: 'test'
    }
  },
  writable: true
});

// Mock localStorage
var localStorageMock = {
  getItem: function() { return null; },
  setItem: function() { },
  removeItem: function() { },
  clear: function() { }
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
var sessionStorageMock = {
  getItem: function() { return null; },
  setItem: function() { },
  removeItem: function() { },
  clear: function() { }
};
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock
});