// Import config first to ensure environment variables are loaded
import config from './config.js';
import express from 'express';
import { promises as fs } from 'fs';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = config.PORT;

// Debug log environment variables (without sensitive values)
console.log('✅ Environment Configuration:');
console.log(`- NODE_ENV: ${config.NODE_ENV}`);
console.log(`- PORT: ${port}`);
console.log(`- FRONTEND_URL: ${config.FRONTEND_URL}`);
console.log(`- DEBUG_AUDIO: ${config.DEBUG_AUDIO}`);
console.log('- Google API Keys: [CONFIGURED]');

// Import routes after environment variables are loaded
import speechRoutes from './routes/speech.js';
import aiRoutes from './routes/ai.js';

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Routes
app.use('/api/speech', speechRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create audios directory if it doesn't exist
const audiosDir = path.join(__dirname, 'public', 'audios');
fs.mkdir(audiosDir, { recursive: true })
    .then(() => {
        console.log(`🔊 Audio directory ready at: ${audiosDir}`);
    })
    .catch(err => {
        console.error('❌ Failed to create audio directory:', err);
    });

// Function to start the server
const startServer = async () => {
    try {
        // Check if the port is already in use
        const server = app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
            console.log(`📂 Serving static files from: ${path.join(__dirname, 'public')}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} is already in use. Please stop any other servers using this port.`);
                console.log('You can try one of these solutions:');
                console.log(`1. Stop any other Node.js processes running on port ${port}`);
                console.log('2. Use a different port by setting the PORT environment variable');
                console.log('3. Wait a few seconds and try again');
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();