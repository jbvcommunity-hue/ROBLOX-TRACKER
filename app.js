// App State
let currentUser = null;
let authToken = null;

// API Base URL - loaded from config.js
const API_URL = CONFIG.BACKEND_URL;

// Check if backend URL is configured
if (API_URL === 'YOUR_BACKEND_URL_HERE') {
    console.warn('WARNING: Backend URL not configured! Please edit config.js with your backend server URL');
}

// Default place IDs for popular games
const defaultPlaceIds = [920587237, 4924922222, 2753915549, 1962086868, 370731277, 142823291, 606849621, 286090429];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is already logged in
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const isGuest = localStorage.getItem('guestMode') === 'true';

    if (authToken && username) {
        currentUser = { username };
        localStorage.removeItem('guestMode'); // Clear guest if logged in
        redirectToApp();
    } else if (isGuest) {
        currentUser = { username: 'Guest' };
        redirectToApp();
    } else {
        if (!window.location.pathname.includes('log-in') && !window.location.pathname.includes('sign-up')) {
            window.location.href = './log-in.html';
        }
    }
}

function redirectToApp() {
    if (window.location.pathname.includes('log-in') || window.location.pathname.includes('sign-up')) {
        window.location.href = './index.html';
    } else {
        showApp();
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
    
    // Game Search
    const searchInput = document.getElementById('game-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleGameSearch({ target: searchInput });
        });
    }
    const gameSearchBtn = document.getElementById('game-search-btn');
    if (gameSearchBtn) {
        gameSearchBtn.addEventListener('click', () => handleGameSearch({ target: document.getElementById('game-search') }));
    }

    // User Search
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserSearch();
        });
    }
    const userSearchBtn = document.getElementById('user-search-btn');
    if (userSearchBtn) {
        userSearchBtn.addEventListener('click', handleUserSearch);
    }

    // Guest button
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) { guestBtn.addEventListener('click', handleGuest); }
}

// Clear errors
function clearErrors() {
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const searchError = document.getElementById('search-error');
    
    [loginError, signupError, searchError].forEach(el => {
        if (el) {
            el.classList.remove('show');
            el.textContent = '';
        }
    });
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Handle Login (unchanged)
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
            
            window.location.href = './index.html';
        } else {
            showError('login-error', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Network error. Check if your backend server is running and the URL in config.js is correct.');
    } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}

// Handle Signup (unchanged)
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
            window.location.href = './log-in.html?success=Account created! Please log in.';
        } else {
            showError('signup-error', data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('signup-error', 'Network error. Check if your backend server is running and the URL in config.js is correct.');
    } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
}

// Handle Guest
function handleGuest() {
    localStorage.setItem('guestMode', 'true');
    window.location.href = './index.html';
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('guestMode');
    authToken = null;
    currentUser = null;
    window.location.href = './log-in.html';
}

// Show app
function showApp() {
    const path = window.location.pathname;
    const app = document.getElementById('app');
    if (app) {
        app.classList.remove('hidden');
        
        if (currentUser) {
            const userDisplay = document.getElementById('user-display');
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${currentUser.username}!`;
            }
        }
        
        if (path.includes('game-detail')) {
            loadGameDetail();
        } else if (path.includes('user-detail')) {
            loadUserDetail();
        } else {
            loadGames();
            startPlayerCountUpdate();
        }
    }
}

// Load Games
async function loadGames(placeIds = defaultPlaceIds) {
    const gamesContainer = document.getElementById('games-list');
    if (!gamesContainer) return;

    try {
        const placeDetailsRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeIds.join(',')}`);
        const placeDetails = await placeDetailsRes.json();

        const universeIds = placeDetails.map(p => p.universeId).join(',');
        const iconsRes = await fetch(`${API_URL}/api/roblox/game-icons?universeIds=${universeIds}`);
        const icons = await iconsRes.json();

        const games = placeDetails.map(p => ({
            placeId: p.placeId,
            name: p.name,
            players: p.playing,
            visits: p.placeVisits,
            icon: icons.data.find(i => i.targetId === p.universeId)?.imageUrl || 'placeholder.png'
        }));

        gamesContainer.innerHTML = games.map(game => `
            <div class="game-card" data-place-id="${game.placeId}">
                <img class="game-thumbnail" src="${game.icon}" alt="${game.name}">
                <div class="game-info">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-stats">
                        <div class="game-stat">
                            <div class="live-indicator"></div>
                            <span id="players-${game.placeId}">${formatNumber(game.players)}</span>
                        </div>
                        <div class="game-stat">
                            Eye <span>${formatNumber(game.visits)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const placeId = card.dataset.placeId;
                window.location.href = `./game-detail.html?placeId=${placeId}`;
            });
        });

    } catch (error) {
        console.error('Error loading games:', error);
        showError('search-error', 'Failed to load games. Check network.');
    }
}

// Update player counts
let playerCountInterval;
function startPlayerCountUpdate() {
    updatePlayerCounts();
    playerCountInterval = setInterval(updatePlayerCounts, 10000);
}

async function updatePlayerCounts() {
    try {
        const totalRes = await fetch(`${API_URL}/api/players`);
        const totalData = await totalRes.json();
        const totalPlayers = document.getElementById('total-players');
        if (totalPlayers) {
            const current = parseInt(totalPlayers.textContent.replace(/,/g, '')) || 0;
            animateNumber('total-players', current, totalData.playerCount, 500);
        }

        const placeIds = defaultPlaceIds;
        const placeDetailsRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeIds.join(',')}`);
        const placeDetails = await placeDetailsRes.json();

        placeDetails.forEach(p => {
            const elem = document.getElementById(`players-${p.placeId}`);
            if (elem) {
                const current = parseInt(elem.textContent.replace(/,/g, '')) || 0;
                animateNumber(`players-${p.placeId}`, current, p.playing, 500);
            }
        });
    } catch (error) {
        console.error('Error updating player counts:', error);
    }
}

// Animate number
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const stepTime = Math.abs(Math.floor(duration / (end - start))) || 1;
    let current = start;
    const interval = setInterval(() => {
        if (current < end) current++;
        else if (current > end) current--;
        element.textContent = formatNumber(current);
        if (current === end) clearInterval(interval);
    }, stepTime);
}

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Handle Game Search
async function handleGameSearch(e) {
    clearErrors();
    const input = e.target.value.trim().toLowerCase();

    if (input === '') {
        loadGames();
        return;
    }

    let placeId;
    if (!isNaN(input)) {
        placeId = input;
    } else if (input.includes('roblox.com/games/')) {
        const match = input.match(/games\/(\d+)/);
        if (match) placeId = match[1];
    }

    if (placeId) {
        window.location.href = `./game-detail.html?placeId=${placeId}`;
    } else {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameName = card.querySelector('.game-title').textContent.toLowerCase();
            card.style.display = gameName.includes(input) ? 'block' : 'none';
        });
    }
}

// Handle User Search
async function handleUserSearch() {
    clearErrors();
    const input = document.getElementById('user-search').value.trim();
    const btn = document.getElementById('user-search-btn');
    if (btn) btn.disabled = true;

    if (!input) {
        showError('search-error', 'Enter a user ID');
        if (btn) btn.disabled = false;
        return;
    }

    if (!isNaN(input)) {
        try {
            // Check if user exists
            const res = await fetch(`${API_URL}/api/roblox/user-details?userId=${input}`);
            if (res.ok) {
                window.location.href = `./user-detail.html?userId=${input}`;
            } else {
                showError('search-error', 'User not found');
            }
        } catch (error) {
            showError('search-error', 'Network error');
        }
    } else {
        showError('search-error', 'Enter a valid user ID');
    }

    if (btn) btn.disabled = false;
}

// Load Game Detail
async function loadGameDetail() {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('placeId');
    if (!placeId) return;

    const detailContainer = document.getElementById('game-detail');
    if (!detailContainer) return;

    try {
        const placeRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeId}`);
        const placeData = (await placeRes.json())[0];

        const universeId = placeData.universeId;
        const gameRes = await fetch(`${API_URL}/api/roblox/game-details?universeIds=${universeId}`);
        const gameData = (await gameRes.json()).data[0];

        const iconRes = await fetch(`${API_URL}/api/roblox/game-icons?universeIds=${universeId}`);
        const icon = (await iconRes.json()).data[0].imageUrl;

        detailContainer.innerHTML = `
            <img src="${icon}" alt="${gameData.name}">
            <h2>${gameData.name}</h2>
            <p>Description: ${gameData.description}</p>
            <p>Creator: ${gameData.creator.name}</p>
            <p>Playing: <span id="playing-count">${formatNumber(placeData.playing)}</span></p>
            <p>Visits: ${formatNumber(placeData.placeVisits)}</p>
            <p>Favorites: ${formatNumber(gameData.favoritedCount)}</p>
            <p>Genre: ${gameData.genre}</p>
            <p>Created: ${new Date(gameData.created).toLocaleDateString()}</p>
        `;

        setInterval(async () => {
            const updatedRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeId}`);
            const updated = (await updatedRes.json())[0];
            const elem = document.getElementById('playing-count');
            const current = parseInt(elem.textContent.replace(/,/g, '')) || 0;
            animateNumber('playing-count', current, updated.playing, 500);
        }, 10000);

    } catch (error) {
        console.error('Error loading game detail:', error);
        detailContainer.innerHTML = '<p>Error loading game details.</p>';
    }
}

// Load User Detail
async function loadUserDetail() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (!userId) return;

    const detailContainer = document.getElementById('user-detail');
    if (!detailContainer) return;

    try {
        const userRes = await fetch(`${API_URL}/api/roblox/user-details?userId=${userId}`);
        const userData = await userRes.json();

        const headshotRes = await fetch(`${API_URL}/api/roblox/user-headshot?userIds=${userId}`);
        const headshot = (await headshotRes.json()).data[0].imageUrl;

        detailContainer.innerHTML = `
            <img src="${headshot}" alt="${userData.name}">
            <h2>${userData.displayName} (@${userData.name})</h2>
            <p>Description: ${userData.description}</p>
            <p>Created: ${new Date(userData.created).toLocaleDateString()}</p>
            <p>Banned: ${userData.isBanned ? 'Yes' : 'No'}</p>
        `;

    } catch (error) {
        console.error('Error loading user detail:', error);
        detailContainer.innerHTML = '<p>Error loading user details.</p>';
    }
}

// Show success message from URL parameter
if (window.location.pathname.includes('log-in')) {
    const urlParams = new URLSearchParams(window.location.search);
    const successMsg = urlParams.get('success');
    if (successMsg) {
        setTimeout(() => {
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.textContent = successMsg;
                loginError.style.background = 'rgba(0, 230, 118, 0.1)';
                loginError.style.borderLeftColor = '#00e676';
                loginError.style.color = '#00e676';
                loginError.classList.add('show');
            }
        }, 100);
    }
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (playerCountInterval) {
        clearInterval(playerCountInterval);
    }
});
