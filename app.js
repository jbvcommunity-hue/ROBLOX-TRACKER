// App State
let currentUser = null;
let authToken = null;

// API Base URL - loaded from config.js
const API_URL = CONFIG.BACKEND_URL;

// Check if backend URL is configured
if (API_URL === 'https://roblox-tracker-9jjf.onrender.com') {
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
        searchInput.addEventListener('input', handleGameSearch);
    }

    // User Search
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserSearch();
        });
        const userSearchBtn = document.getElementById('user-search-btn');
        if (userSearchBtn) {
            userSearchBtn.addEventListener('click', handleUserSearch);
        }
    }

    // Guest button
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) { guestBtn.addEventListener('click', handleGuest); }
}

// Clear errors, showError, handleLogin, handleSignup, handleGuest, handleLogout (unchanged)

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

// Load Games (real data)
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
    }
}

// Player count update (integrated from live-ccp-updates.js)
let playerCountInterval;
function startPlayerCountUpdate() {
    updatePlayerCounts();
    playerCountInterval = setInterval(updatePlayerCounts, 10000); // Adjusted to 10s as per original
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

// Animate number (adjusted duration)
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

// formatNumber, handleGameSearch, handleUserSearch, loadGameDetail, loadUserDetail (unchanged)

// Cleanup
window.addEventListener('beforeunload', () => {
    if (playerCountInterval) {
        clearInterval(playerCountInterval);
    }
});
