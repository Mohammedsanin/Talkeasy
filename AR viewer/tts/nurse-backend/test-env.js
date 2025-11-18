import dotenv from 'dotenv';

dotenv.config();

console.log('🔑 Environment Variables:');
console.log('GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
console.log('Key length:', process.env.GOOGLE_AI_API_KEY?.length);
console.log('Key starts with:', process.env.GOOGLE_AI_API_KEY?.substring(0, 5) + '...');
