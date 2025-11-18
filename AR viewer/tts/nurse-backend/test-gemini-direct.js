import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import https from 'https';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Gemini API Connection...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_AI_API_KEY present:', !!process.env.GOOGLE_AI_API_KEY);

// Test 1: Check internet connectivity
console.log('\n🌐 Testing internet connectivity...');
try {
  await new Promise((resolve, reject) => {
    const req = https.get('https://www.google.com', (res) => {
      console.log('✅ Internet connection is working');
      resolve();
    }).on('error', (err) => {
      console.error('❌ No internet connection or proxy required');
      console.error('Error:', err.message);
      reject(err);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.error('❌ Connection timeout - Check your network or proxy settings');
      reject(new Error('Connection timeout'));
    });
  });
} catch (error) {
  console.error('❌ Internet connectivity test failed');
  process.exit(1);
}

// Test 2: Check Google Generative AI API endpoint
console.log('\n🔌 Testing connection to Google Generative AI API...');
try {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: {
      'x-goog-api-key': process.env.GOOGLE_AI_API_KEY
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Google Generative AI API connection failed');
    console.error('Status:', response.status, response.statusText);
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('✅ Successfully connected to Google Generative AI API');
  const data = await response.json();
  console.log('Available models:', data.models.map(m => m.name).join(', '));
  
} catch (error) {
  console.error('❌ Failed to connect to Google Generative AI API');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.code === 'ENOTFOUND') {
    console.error('\n🌐 DNS Lookup Failed: Cannot resolve generativelanguage.googleapis.com');
    console.error('This could be due to:');
    console.error('1. No internet connection');
    console.error('2. DNS resolution issues');
    console.error('3. Firewall or proxy blocking the connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n🚫 Connection Refused: The server refused the connection');
    console.error('This could be due to:');
    console.error('1. The API endpoint is down');
    console.error('2. Your IP is blocked');
    console.error('3. Network restrictions in place');
  }
  
  process.exit(1);
}

// Test 3: Try to initialize the Gemini client
console.log('\n🚀 Testing Gemini client initialization...');
try {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  
  console.log('✅ Gemini client initialized successfully');
  
  // Test 4: Try to generate content
  console.log('\n💬 Testing content generation...');
  const result = await model.generateContent('Say "Hello, World!"');
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ Content generation successful!');
  console.log('Response:', text);
  
} catch (error) {
  console.error('❌ Gemini client test failed');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.message.includes('API key not valid')) {
    console.error('\n🔑 API Key Error: The provided Google AI API key is invalid or has insufficient permissions.');
    console.error('1. Check your GOOGLE_AI_API_KEY in the .env file');
    console.error('2. Ensure the API key has the correct permissions');
    console.error('3. Get a new API key from: https://aistudio.google.com/app/apikey');
  } else if (error.message.includes('fetch failed')) {
    console.error('\n🌐 Network Error: Unable to connect to Google AI services.');
    console.error('1. Check your internet connection');
    console.error('2. If behind a proxy, set these environment variables:');
    console.error('   set HTTP_PROXY=http://your-proxy-address:port');
    console.error('   set HTTPS_PROXY=http://your-proxy-address:port');
  } else if (error.message.includes('model not found')) {
    console.error('\n❌ Model Error: The specified model was not found.');
    console.error('1. Check if the model name is correct');
    console.error('2. Verify your API key has access to this model');
  }
  
  process.exit(1);
}
