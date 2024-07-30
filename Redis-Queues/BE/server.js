const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');

const app = express();
const port = 3000;

// Function to initialize Redis client
function initializeRedisClient() {
    const redisClient = new Redis({
        host: 'localhost',
        port: 6379
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    return redisClient;
}

// Initialize Redis client
const redisClient = initializeRedisClient();

redisClient.on('ready', () => {
    console.log('Redis client connected and ready');
});

redisClient.on('close', () => {
    console.log('Redis client connection closed');
});

process.on('SIGINT', () => {
    redisClient.quit(() => {
        console.log('Redis client disconnected due to app termination');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    redisClient.quit(() => {
        console.log('Redis client disconnected due to app termination');
        process.exit(0);
    });
});

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Route to get total click count
app.get('/clicks', async (req, res) => {
    try {
        const clicks = await redisClient.get('global_clicks');
        res.json({ totalClicks: clicks ? parseInt(clicks, 10) : 0 });
    } catch (err) {
        console.error('Error fetching clicks:', err);
        res.status(500).send('Server error');
    }
});

// Route to add a click
app.post('/click', async (req, res) => {
    const userIp = req.ip; // Assuming IP-based rate limiting
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    try {
        // Fetch timestamps from Redis list
        const timestamps = await redisClient.lrange(userIp, 0, -1);

        // Filter out timestamps older than 10 seconds
        const recentTimestamps = timestamps.filter(timestamp => currentTime - timestamp < 10);

        if (recentTimestamps.length >= 10) {
            return res.status(429).send('Rate limit exceeded');
        }

        // Add current timestamp to user's list
        await redisClient.lpush(userIp, currentTime);
        await redisClient.ltrim(userIp, 0, 9); // Keep only the 10 most recent timestamps

        // Increment global click count
        const newTotal = await redisClient.incr('global_clicks');
        res.json({ newTotal });
    } catch (err) {
        console.error('Error handling click:', err);
        res.status(500).send('Server error');
    }
});

// Serve static files for the frontend
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
