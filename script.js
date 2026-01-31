// PASTE YOUR RENDER URL HERE (No trailing slash)
const API_BASE = "https://roblox-tracker-9jjf.onrender.com"; 

let mode = 'game';

// 1. Check Connection on Load
window.onload = async () => {
    const statusDiv = document.getElementById('statusIndicator');
    try {
        const res = await fetch(API_BASE);
        if (res.ok) {
            statusDiv.innerText = "✅ Server Connected";
            statusDiv.className = "status-online";
        }
    } catch (e) {
        statusDiv.innerText = "❌ Server Disconnected";
        statusDiv.className = "status-offline";
        showError("Could not connect to Backend. Is Render awake?");
    }
    loadHistory();
};

function setMode(newMode) {
    mode = newMode;
    document.getElementById('btnGame').className = mode === 'game' ? 'nav-btn active' : 'nav-btn';
    document.getElementById('btnUser').className = mode === 'user' ? 'nav-btn active' : 'nav-btn';
    document.getElementById('searchInput').placeholder = mode === 'game' ? "Paste Game Link..." : "Enter Username...";
    document.getElementById('gameUI').classList.add('hidden');
    document.getElementById('userUI').classList.add('hidden');
    document.getElementById('errorBox').classList.add('hidden');
}

async function search() {
    const input = document.getElementById('searchInput').value.trim();
    if (!input) return;

    // Show Loader, Hide UI
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('gameUI').classList.add('hidden');
    document.getElementById('userUI').classList.add('hidden');
    document.getElementById('errorBox').classList.add('hidden');

    try {
        const endpoint = mode === 'game' ? '/game' : '/user';
        const res = await fetch(`${API_BASE}${endpoint}?query=${encodeURIComponent(input)}`);
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Unknown error");
        }

        addToHistory(input);

        if (mode === 'game') {
            updateGameUI(data);
        } else {
            updateUserUI(data);
        }

    } catch (err) {
        showError(err.message);
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
}

function updateGameUI(data) {
    document.getElementById('gameUI').classList.remove('hidden');
    document.getElementById('gTitle').innerText = data.name;
    document.getElementById('gCreator').innerText = data.creator;
    document.getElementById('gId').innerText = `ID: ${data.id}`;
    document.getElementById('gPlaying').innerText = data.playing.toLocaleString();
    document.getElementById('gVisits').innerText = data.visits.toLocaleString();
    document.getElementById('gFavs').innerText = data.favorites.toLocaleString();
    document.getElementById('gIcon').src = data.icon;
}

function updateUserUI(data) {
    document.getElementById('userUI').classList.remove('hidden');
    document.getElementById('uDisplay').innerText = data.displayName;
    document.getElementById('uName').innerText = data.name;
    document.getElementById('uBio').innerText = data.bio || "No bio available.";
    document.getElementById('uJoin').innerText = data.created;
    document.getElementById('uAvatar').src = data.avatar;

    const statusBox = document.getElementById('uStatusBox');
    const locationText = document.getElementById('uLocation');

    if (data.isPlaying) {
        statusBox.innerText = "PLAYING";
        statusBox.className = "status-badge ingame";
        locationText.innerText = `Playing: ${data.lastLocation}`;
    } else if (data.isOnline) {
        statusBox.innerText = "ONLINE";
        statusBox.className = "status-badge online";
        locationText.innerText = "Browsing Website";
    } else {
        statusBox.innerText = "OFFLINE";
        statusBox.className = "status-badge offline";
        locationText.innerText = "Last Online: Recently";
    }
}

function showError(msg) {
    const box = document.getElementById('errorBox');
    box.innerText = msg;
    box.classList.remove('hidden');
}

function addToHistory(term) {
    let history = JSON.parse(localStorage.getItem('bloxHistory') || "[]");
    if (!history.includes(term)) {
        history.unshift(term);
        if (history.length > 5) history.pop();
        localStorage.setItem('bloxHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const bar = document.getElementById('historyBar');
    const history = JSON.parse(localStorage.getItem('bloxHistory') || "[]");
    bar.innerHTML = history.length ? "<span>Recent: </span>" : "";
    
    history.forEach(term => {
        const span = document.createElement('span');
        span.innerText = term;
        span.style.cssText = "background:#333; padding:2px 8px; margin:0 5px; border-radius:4px; cursor:pointer; font-size:12px;";
        span.onclick = () => {
            document.getElementById('searchInput').value = term;
            search();
        };
        bar.appendChild(span);
    });
}
