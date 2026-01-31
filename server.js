const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your GitHub site to talk to this
app.use(express.json());

// --- HELPER FUNCTIONS ---

// Extract ID from URL (e.g., roblox.com/games/12345/Name -> 12345)
function extractId(input) {
    const match = input.match(/games\/(\d+)/) || input.match(/users\/(\d+)/);
    if (match) return match[1];
    if (!isNaN(input)) return input; // It's already an ID
    return null; 
}

// --- ROUTES ---

// 1. GAME DATA ROUTE
app.get('/game', async (req, res) => {
    try {
        let placeId = extractId(req.query.query);
        if (!placeId) return res.json({ error: "Invalid Game Link" });

        // Step A: Convert PlaceID -> UniverseID (CRITICAL STEP)
        const universeRes = await axios.get(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`);
        const universeId = universeRes.data[0].universeId;

        // Step B: Get Live Stats
        const [gameData, iconData] = await Promise.all([
            axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
            axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=150x150&format=Png`)
        ]);

        const info = gameData.data.data[0];
        
        res.json({
            name: info.name,
            creator: info.creator.name,
            playing: info.playing,
            visits: info.visits,
            favorites: info.favoritedCount,
            icon: iconData.data.data[0].imageUrl
        });

    } catch (e) {
        res.status(500).json({ error: "Failed to fetch game data" });
    }
});

// 2. USER DATA ROUTE
app.get('/user', async (req, res) => {
    try {
        let input = req.query.query;
        let userId = input;

        // If input is text (username), search for ID
        if (isNaN(input)) {
            const searchRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
                usernames: [input],
                excludeBannedUsers: true
            });
            if (searchRes.data.data.length === 0) return res.json({ error: "User not found" });
            userId = searchRes.data.data[0].id;
        }

        // Fetch Profile, Presence, and Avatar
        const [profile, presence, avatar] = await Promise.all([
            axios.get(`https://users.roblox.com/v1/users/${userId}`),
            axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] }),
            axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`)
        ]);

        res.json({
            name: profile.data.name,
            displayName: profile.data.displayName,
            bio: profile.data.description,
            presence: presence.data.userPresences[0],
            avatar: avatar.data.data[0].imageUrl
        });

    } catch (e) {
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
