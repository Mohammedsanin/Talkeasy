import dotenv from 'dotenv';
import { getAIResponse } from './services/geminiService.js';

// Load environment variables
dotenv.config();

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    
    // Test a simple health-related query
    const testQuery = "What are the common symptoms of a cold?";
    console.log(`\n🤖 Sending query: "${testQuery}"`);
    
    const response = await getAIResponse(testQuery);
    
    console.log('\n✅ Gemini Response:');
    console.log(response);
    
    console.log('\n✨ Gemini API test completed successfully!');
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
