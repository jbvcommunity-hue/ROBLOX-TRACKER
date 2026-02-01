// Configuration for backend API
const CONFIG = {
    // IMPORTANT: Replace this with your actual backend server URL
    // Examples:
    // - https://your-backend.herokuapp.com
    // - https://api.yoursite.com
    // - https://your-repl.replit.app
    
    BACKEND_URL: 'https://roblox-tracker-9jjf.onrender.com/',
    
    // If your backend is on the same domain, you can use:
    // BACKEND_URL: window.location.origin
    
    // For development/testing:
    // BACKEND_URL: 'http://localhost:3000'
};

// Don't change this - it exports the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
