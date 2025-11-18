import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  try {
    console.log('🔍 Listing available models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const result = await genAI.listModels();
    
    console.log('\n✅ Available Models:');
    result.models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error listing models:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

listModels();
