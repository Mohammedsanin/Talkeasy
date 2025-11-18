import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath, override: true });

// Verify required environment variables
const requiredEnvVars = ['GOOGLE_AI_API_KEY', 'GOOGLE_TTS_API_KEY', 'GOOGLE_STT_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

// Debug log environment variables (without sensitive values)
console.log('✅ Environment variables loaded successfully');
console.log('🔍 Environment Configuration:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- PORT: ${process.env.PORT || 3000}`);
console.log(`- FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`- DEBUG_AUDIO: ${process.env.DEBUG_AUDIO || 'false'}`);
console.log('- Google API Keys: [CONFIGURED]');

// Export environment variables
export default {
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY,
    GOOGLE_STT_API_KEY: process.env.GOOGLE_STT_API_KEY,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    DEBUG_AUDIO: process.env.DEBUG_AUDIO === 'true'
};
