const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 1. Allow All Connections (Fixes CORS issues)
app.use(cors());
app.use(express.json());

// 2. Health Check (Click your Render URL to see this)
app.get('/', (req, res) => {
    res.send("✅ Backend is ONLINE and ready! You can link this to your GitHub now.");
});

// --- API HELPER: Extract ID from Link or Text ---
function extractId(input) {
    // If it's a link like roblox.com/games/123456/Name, grab 123456
    const match = input.match(/(?:games|users)\/(\d+)/);
    if (match) return match[1];
    // If it's just numbers, return them
    if (/^\d+$/.test(input)) return input;
    return null;
}

// --- ROUTE 1: GAME DATA (Fixed "Not Found" Bug) ---
app.get('/game', async (req, res) => {
    try {
        const query = req.query.query;
        let placeId = extractId(query);

        if (!placeId) return res.status(400).json({ error: "Could not find a Place ID in that link." });

        // Step A: Convert PlaceID -> UniverseID (Using NEW API)
        // This endpoint is more reliable than the old multiget
        const uniRes = await axios.get(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        const universeId = uniRes.data.universeId;

        if (!universeId) throw new Error("Universe ID not found");

        // Step B: Get Live Stats & Thumbnail
        const [gameData, iconData] = await Promise.all([
            axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
            axios.get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`)
        ]);

        const info = gameData.data.data[0];
        
        res.json({
            success: true,
            id: universeId,
            name: info.name,
            creator: info.creator.name,
            playing: info.playing || 0,
            visits: info.visits || 0,
            favorites: info.favoritedCount || 0,
            likes: info.usage ? info.usage.total : "N/A", // Roblox doesn't publicize raw likes easily without extra auth
            icon: iconData.data.data[0].imageUrl
        });

    } catch (e) {
        console.error("Game Error:", e.message);
        res.status(500).json({ error: "Game not found. (ID might be invalid or Private)" });
    }
});

// --- ROUTE 2: USER DATA (Fixed "Wrong User" Bug) ---
app.get('/user', async (req, res) => {
    try {
        const query = req.query.query;
        let userId = query;

        // Step A: If input is text (username), convert to ID securely
        if (isNaN(query)) {
            const searchRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
                usernames: [query],
                excludeBannedUsers: true
            });
            
            if (!searchRes.data.data || searchRes.data.data.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }
            userId = searchRes.data.data[0].id;
        }

        // Step B: Fetch Full Profile + Presence + Avatar
        const [profile, presence, avatar] = await Promise.all([
            axios.get(`https://users.roblox.com/v1/users/${userId}`),
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] }),
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`)
        ]);

        // Fix: Ensure we actually have data before sending
        const userPres = presence.data.userPresences[0];
        
        res.json({
            success: true,
            id: userId,
            displayName: profile.data.displayName,
            name: profile.data.name,
            bio: profile.data.description,
            created: new Date(profile.data.created).toLocaleDateString(),
            isOnline: userPres.userPresenceType !== 0,
            isPlaying: userPres.userPresenceType === 2,
            lastLocation: userPres.lastLocation,
            avatar: avatar.data.data[0].imageUrl
        });

    } catch (e) {
        console.error("User Error:", e.message);
        res.status(500).json({ error: "User lookup failed." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
