// App State
let currentUser = null;
let authToken = null;

// API Base URL
const API_URL = window.location.origin;

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
        showApp();
    } else {
        showAuthModal();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-submit').addEventListener('click', handleLogin);
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Signup form
    document.getElementById('signup-submit').addEventListener('click', handleSignup);
    document.getElementById('signup-password-confirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    
    // Form switching
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Search
    document.getElementById('game-search').addEventListener('input', handleSearch);
}

// Show/Hide Forms
function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('modal-title').textContent = 'Welcome Back!';
    clearErrors();
}

function showSignupForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Create Account';
    clearErrors();
}

function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    if (currentUser) {
        document.getElementById('user-display').textContent = `Welcome, ${currentUser.username}!`;
    }
    
    loadGames();
    startPlayerCountUpdate();
}

// Clear error messages
function clearErrors() {
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('signup-error').classList.remove('show');
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
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
            
            showApp();
        } else {
            showError('login-error', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Network error. Please try again.');
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
            // Account created, now log in
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').value = password;
            showLoginForm();
            showError('login-error', '✅ Account created! Please log in.');
            document.getElementById('login-error').style.background = 'rgba(0, 230, 118, 0.1)';
            document.getElementById('login-error').style.borderLeftColor = 'var(--success)';
            document.getElementById('login-error').style.color = 'var(--success)';
        } else {
            showError('signup-error', data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('signup-error', 'Network error. Please try again.');
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
    
    // Clear forms
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    
    showAuthModal();
    showLoginForm();
}

// Load Games
function loadGames() {
    const gamesContainer = document.getElementById('games-list');
    
    // Sample game data (in production, fetch from API)
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
        
        const currentCount = parseInt(document.getElementById('total-players').textContent.replace(/,/g, '')) || 0;
        const newCount = data.playerCount;
        
        animateNumber('total-players', currentCount, newCount, 1000);
    } catch (error) {
        console.error('Error fetching player count:', error);
    }
}

// Animate number change
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (playerCountInterval) {
        clearInterval(playerCountInterval);
    }
});
