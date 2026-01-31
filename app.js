// App State
let currentUser = null;
let authToken = null;

// API Base URL - loaded from config.js
const API_URL = CONFIG.BACKEND_URL;

// Check if backend URL is configured
if (API_URL === 'YOUR_BACKEND_URL_HERE') {
    console.warn('⚠️ WARNING: Backend URL not configured! Please edit config.js with your backend server URL');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is already logged in
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (authToken && username) {
        currentUser = { username };
        // If on login/signup page, redirect to main app
        if (window.location.pathname.includes('log-in') || window.location.pathname.includes('sign-up')) {
            window.location.href = '/';
        } else {
            showApp();
        }
    } else {
        // If on main page but not logged in, redirect to login
        if (!window.location.pathname.includes('log-in') && !window.location.pathname.includes('sign-up')) {
            // Only redirect if we're on the main page
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = '/log-in.html';
            }
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginBtn = document.getElementById('login-submit');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        const loginPassword = document.getElementById('login-password');
        if (loginPassword) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleLogin();
            });
        }
    }
    
    // Signup form
    const signupBtn = document.getElementById('signup-submit');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
        const signupConfirm = document.getElementById('signup-password-confirm');
        if (signupConfirm) {
            signupConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSignup();
            });
        }
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Search
    const searchInput = document.getElementById('game-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Clear error messages
function clearErrors() {
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    if (loginError) {
        loginError.classList.remove('show');
        loginError.textContent = '';
    }
    if (signupError) {
        signupError.classList.remove('show');
        signupError.textContent = '';
    }
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Handle Login
async function handleLogin() {
    clearErrors();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showError('login-error', 'Please fill in all fields');
        return;
    }
    
    const submitBtn = document.getElementById('login-submit');
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUser.username);
            
            // Redirect to main app
            window.location.href = '/';
        } else {
            showError('login-error', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', '❌ Network error. Check if your backend server is running and the URL in config.js is correct.');
    } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}

// Handle Signup
async function handleSignup() {
    clearErrors();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    
    // Validation
    if (!username || !email || !password || !passwordConfirm) {
        showError('signup-error', 'Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showError('signup-error', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== passwordConfirm) {
        showError('signup-error', 'Passwords do not match');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('signup-error', 'Please enter a valid email');
        return;
    }
    
    const submitBtn = document.getElementById('signup-submit');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Account created, redirect to login
            window.location.href = '/log-in.html?success=Account created! Please log in.';
        } else {
            showError('signup-error', data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('signup-error', '❌ Network error. Check if your backend server is running and the URL in config.js is correct.');
    } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    authToken = null;
    currentUser = null;
    
    window.location.href = '/log-in.html';
}

// Show app (for main page only)
function showApp() {
    const app = document.getElementById('app');
    if (app) {
        app.classList.remove('hidden');
        
        if (currentUser) {
            const userDisplay = document.getElementById('user-display');
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${currentUser.username}!`;
            }
        }
        
        loadGames();
        startPlayerCountUpdate();
    }
}

// Load Games
function loadGames() {
    const gamesContainer = document.getElementById('games-list');
    if (!gamesContainer) return;
    
    // Sample ROBLOX game data
    const games = [
        { id: 1, name: 'Adopt Me!', icon: '🐾', players: 245678, visits: '45.2B' },
        { id: 2, name: 'Brookhaven', icon: '🏡', players: 189234, visits: '32.8B' },
        { id: 3, name: 'Tower of Hell', icon: '🗼', players: 156789, visits: '28.1B' },
        { id: 4, name: 'Blox Fruits', icon: '🍊', players: 234567, visits: '41.3B' },
        { id: 5, name: 'Pet Simulator X', icon: '🐶', players: 145678, visits: '25.4B' },
        { id: 6, name: 'Murder Mystery 2', icon: '🔪', players: 98765, visits: '18.9B' },
        { id: 7, name: 'Jailbreak', icon: '🚔', players: 87654, visits: '16.2B' },
        { id: 8, name: 'Arsenal', icon: '🔫', players: 76543, visits: '14.7B' },
    ];
    
    gamesContainer.innerHTML = games.map(game => `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-thumbnail">${game.icon}</div>
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-stats">
                    <div class="game-stat">
                        <div class="live-indicator"></div>
                        <span>${formatNumber(game.players)}</span>
                    </div>
                    <div class="game-stat">
                        👁️ <span>${game.visits}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update player count
let playerCountInterval;
function startPlayerCountUpdate() {
    updatePlayerCount();
    playerCountInterval = setInterval(updatePlayerCount, 5000);
}

async function updatePlayerCount() {
    try {
        const response = await fetch(`${API_URL}/api/players`);
        const data = await response.json();
        
        const totalPlayers = document.getElementById('total-players');
        if (totalPlayers) {
            const currentCount = parseInt(totalPlayers.textContent.replace(/,/g, '')) || 0;
            const newCount = data.playerCount;
            
            animateNumber('total-players', currentCount, newCount, 1000);
        }
    } catch (error) {
        console.error('Error fetching player count:', error);
    }
}

// Animate number change
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = Date.now();
    const difference = end - start;
    
    function update() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (difference * progress));
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const gameName = card.querySelector('.game-title').textContent.toLowerCase();
        if (gameName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show success message from URL parameter (for login page after signup)
if (window.location.pathname.includes('log-in')) {
    const urlParams = new URLSearchParams(window.location.search);
    const successMsg = urlParams.get('success');
    if (successMsg) {
        setTimeout(() => {
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.textContent = '✅ ' + successMsg;
                loginError.style.background = 'rgba(0, 230, 118, 0.1)';
                loginError.style.borderLeftColor = '#00e676';
                loginError.style.color = '#00e676';
                loginError.classList.add('show');
            }
        }, 100);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (playerCountInterval) {
        clearInterval(playerCountInterval);
    }
});
