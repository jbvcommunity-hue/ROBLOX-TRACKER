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
        window.location.href = './';
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

// ... (keep clearErrors, showError, handleLogin, handleSignup, handleGuest, handleLogout as is)

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

// Load Games (main dashboard)
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
            icon: icons.data.find(i => i.targetId === p.universeId).imageUrl
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

        // Add click listeners for details
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

// Update player counts for games and total
let playerCountInterval;
function startPlayerCountUpdate() {
    updatePlayerCounts();
    playerCountInterval = setInterval(updatePlayerCounts, 5000);
}

async function updatePlayerCounts() {
    try {
        // Update total
        const totalRes = await fetch(`${API_URL}/api/players`);
        const totalData = await totalRes.json();
        const totalPlayers = document.getElementById('total-players');
        if (totalPlayers) {
            const current = parseInt(totalPlayers.textContent.replace(/,/g, '')) || 0;
            animateNumber('total-players', current, totalData.playerCount, 1000);
        }

        // Update games
        const placeIds = defaultPlaceIds; // or dynamic if searched
        const placeDetailsRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeIds.join(',')}`);
        const placeDetails = await placeDetailsRes.json();

        placeDetails.forEach(p => {
            const elem = document.getElementById(`players-${p.placeId}`);
            if (elem) {
                const current = parseInt(elem.textContent.replace(/,/g, '')) || 0;
                animateNumber(`players-${p.placeId}`, current, p.playing, 1000);
            }
        });
    } catch (error) {
        console.error('Error updating player counts:', error);
    }
}

// Handle Game Search
async function handleGameSearch(e) {
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
        // Filter by name
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameName = card.querySelector('.game-title').textContent.toLowerCase();
            card.style.display = gameName.includes(input) ? 'block' : 'none';
        });
    }
}

// Handle User Search
function handleUserSearch() {
    const input = document.getElementById('user-search').value.trim();
    if (!isNaN(input)) {
        window.location.href = `./user-detail.html?userId=${input}`;
    } else {
        showError('search-error', 'Enter a valid user ID'); // Add error div if needed
    }
}

// Load Game Detail
async function loadGameDetail() {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('placeId');
    if (!placeId) return;

    const detailContainer = document.getElementById('game-detail'); // Assume div in HTML
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

        // Start polling for playing
        setInterval(async () => {
            const updatedRes = await fetch(`${API_URL}/api/roblox/place-details?placeIds=${placeId}`);
            const updated = (await updatedRes.json())[0];
            const elem = document.getElementById('playing-count');
            const current = parseInt(elem.textContent.replace(/,/g, '')) || 0;
            animateNumber('playing-count', current, updated.playing, 1000);
        }, 5000);

    } catch (error) {
        console.error('Error loading game detail:', error);
    }
}

// Load User Detail
async function loadUserDetail() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (!userId) return;

    const detailContainer = document.getElementById('user-detail'); // Assume div in HTML
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
    }
}

// ... (keep animateNumber, formatNumber, cleanup as is)
