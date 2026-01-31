// REPLACE THIS WITH YOUR RENDER URL LATER (e.g., "https://my-backend.onrender.com")
const API_BASE = "https://roblox-tracker-9jjf.onrender.com"; 

let currentMode = 'game'; // or 'user'
let trackingInterval = null;
let lastPlayerCount = 0;

// 1. Tab Switching
function switchTab(mode) {
    currentMode = mode;
    document.getElementById('gameDashboard').style.display = mode === 'game' ? 'block' : 'none';
    document.getElementById('userDashboard').style.display = mode === 'user' ? 'block' : 'none';
    document.getElementById('searchInput').placeholder = mode === 'game' ? "Paste Game Link..." : "Enter Username...";
}

// 2. Main Search Function
async function handleSearch() {
    const input = document.getElementById('searchInput').value;
    if (!input) return;

    addToHistory(input);
    clearInterval(trackingInterval); // Stop old tracking

    if (currentMode === 'game') {
        fetchGameData(input);
        trackingInterval = setInterval(() => fetchGameData(input), 20000); // Poll every 20s
    } else {
        fetchUserData(input);
        trackingInterval = setInterval(() => fetchUserData(input), 20000);
    }
}

// 3. Game Logic (Your Backend Handles the ID Conversion)
async function fetchGameData(query) {
    try {
        // Send whatever the user typed (URL or ID) to your backend
        const res = await fetch(`${API_BASE}/game?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.error) { alert(data.error); return; }

        // Update UI
        document.getElementById('gameTitle').innerText = data.name;
        document.getElementById('gameCreator').innerText = data.creator;
        document.getElementById('gameIcon').src = data.icon;
        
        // Stats
        document.getElementById('statPlaying').innerText = data.playing.toLocaleString();
        document.getElementById('statVisits').innerText = data.visits.toLocaleString();
        document.getElementById('statFavs').innerText = data.favorites.toLocaleString();
        
        // Notification Logic
        if (lastPlayerCount > 0 && Math.abs(data.playing - lastPlayerCount) > 100) {
            new Notification("BloxWatch Alert", { body: `Player count changed significantly: ${data.playing}` });
        }
        lastPlayerCount = data.playing;

    } catch (err) {
        console.error(err);
    }
}

// 4. User Logic
async function fetchUserData(username) {
    try {
        const res = await fetch(`${API_BASE}/user?query=${encodeURIComponent(username)}`);
        const data = await res.json();

        if (data.error) { alert(data.error); return; }

        document.getElementById('userDisplay').innerText = data.displayName;
        document.getElementById('userName').innerText = `@${data.name}`;
        document.getElementById('userBio').innerText = data.bio;
        document.getElementById('userAvatar').src = data.avatar;
        
        // Presence (Online/Game)
        const dot = document.getElementById('statusDot');
        const statusText = document.getElementById('userStatusText');
        const locText = document.getElementById('userLocation');

        if (data.presence.userPresenceType === 2) { // In Game
            dot.style.background = "#00FF00";
            statusText.innerText = "Playing";
            locText.innerText = `In: ${data.presence.lastLocation}`;
        } else if (data.presence.userPresenceType === 1) { // Online
            dot.style.background = "#00A2FF";
            statusText.innerText = "Online (Website)";
            locText.innerText = "";
        } else {
            dot.style.background = "gray";
            statusText.innerText = "Offline";
            locText.innerText = "";
        }

    } catch (err) {
        console.error(err);
    }
}

// 5. History System
function addToHistory(term) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || "[]");
    if (!history.includes(term)) {
        history.unshift(term);
        if (history.length > 5) history.pop();
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    const container = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('searchHistory') || "[]");
    container.innerHTML = '<span>Recent: </span>';
    history.forEach(item => {
        const span = document.createElement('span');
        span.className = 'history-item';
        span.innerText = item;
        span.onclick = () => {
            document.getElementById('searchInput').value = item;
            handleSearch();
        };
        container.appendChild(span);
    });
}

// Check permissions for notifications
if (Notification.permission !== "granted") Notification.requestPermission();
renderHistory();
