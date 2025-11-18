import { getAIResponse, getConversationalResponse } from './services/geminiService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API with updated service...');
    
    // Test simple response
    const testQuery = "What are the common symptoms of a cold?";
    console.log(`\n🤖 Testing simple query: "${testQuery}"`);
    
    const response = await getAIResponse(testQuery);
    console.log('\n✅ Gemini Response:');
    console.log(response);
    
    // Test conversational response
    console.log('\n🤖 Testing conversational response...');
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: 'Hello, I need help with a health question' }]
      },
      {
        role: 'model',
        parts: [{ text: 'Of course! I\'d be happy to help. What health question do you have?' }]
      },
      {
        role: 'user',
        parts: [{ text: 'What are the symptoms of the flu?' }]
      }
    ];
    
    const chatResponse = await getConversationalResponse(chatHistory);
    console.log('\n💬 Chat Response:');
    console.log(chatResponse);
    
    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    if (error.details) {
      console.error('Error details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

testGemini();
