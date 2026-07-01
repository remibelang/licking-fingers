// API Configuration
const api_base_url = window.location.origin; // Uses current domain
const API_BASE_URL = api_base_url; // Alias for compatibility (uppercase)

// Or set manually: const api_base_url = "http://localhost:8000";

// Firebase Configuration - African Cuisine
// NOTE: These are DUMMY values - replace with real Firebase credentials later

const firebaseConfig = {
    apiKey: "AIzaSyDummyKey123456789",
    authDomain: "mamas-kitchen-dummy.firebaseapp.com",
    projectId: "mamas-kitchen-dummy",
    storageBucket: "mamas-kitchen-dummy.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy123456",
    measurementId: "G-DUMMY12345"
};

// Initialize Firebase when SDK is loaded
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized (dummy mode)');
    }
} else {
    console.warn('Firebase SDK not loaded - config ready for when it is');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, api_base_url, API_BASE_URL };
}
