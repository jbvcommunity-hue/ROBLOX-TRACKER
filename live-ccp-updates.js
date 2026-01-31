// live-ccp-updates.js

let playerCountElement = document.getElementById('playerCount');

async function fetchPlayerCount() {
    try {
        const response = await fetch('https://your-api-endpoint/players');
        const data = await response.json();
        animatePlayerCountUpdate(data.playerCount);
    } catch (error) {
        console.error('Error fetching player count:', error);
    }
}

function animatePlayerCountUpdate(newCount) {
    const currentCount = parseInt(playerCountElement.textContent) || 0;
    const animationDuration = 500; // 0.5 seconds
    const stepTime = Math.abs(Math.floor(animationDuration / (newCount - currentCount)));

    let currentAnimationCount = currentCount;

    const interval = setInterval(() => {
        if (currentAnimationCount < newCount) {
            currentAnimationCount++;
            playerCountElement.textContent = currentAnimationCount;
        } else if (currentAnimationCount > newCount) {
            currentAnimationCount--;
            playerCountElement.textContent = currentAnimationCount;
        }
        if (currentAnimationCount === newCount) {
            clearInterval(interval);
        }
    }, stepTime);
}

setInterval(fetchPlayerCount, 10000); // Poll every 10 seconds