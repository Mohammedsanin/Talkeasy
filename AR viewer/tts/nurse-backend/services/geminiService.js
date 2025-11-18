import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import config from '../config.js';

// Initialize the Gemini API client
let genAI;
try {
  genAI = new GoogleGenerativeAI(config.GOOGLE_AI_API_KEY);
  console.log('✅ GoogleGenerativeAI client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI:', error.message);
  throw error;
}

// Get the generative model
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-001',
  generationConfig: {
    temperature: 0.5,
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 100,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
  ],
});

/**
 * Get a response from Gemini AI
 * @param {string} prompt - The user's query
 * @returns {Promise<string>} The AI's response
 */
export async function getAIResponse(prompt) {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('A valid text prompt is required');
    }

    console.log(`🔍 Sending request to Gemini API with prompt: "${prompt}"`);
    
    // Add a simple test request to check connectivity
    try {
      const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: {
          'x-goog-api-key': process.env.GOOGLE_AI_API_KEY
        }
      });
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('❌ Gemini API Test Request Failed:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          error: errorData
        });
        throw new Error(`API request failed with status ${testResponse.status}`);
      }
    } catch (testError) {
      console.error('❌ Network/Connection Test Failed:', testError);
      throw new Error(`Cannot connect to Google Generative AI API: ${testError.message}`);
    }

    // Proceed with the actual request
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();
    
    console.log('✅ Successfully received response from Gemini API');
    return responseText;
    
  } catch (error) {
    console.error('❌ Gemini API Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
      ...(error.response?.data && { responseData: error.response.data })
    });
    
    if (error.message.includes('fetch failed') || error.message.includes('network')) {
      throw new Error('Network error: Unable to connect to Google AI services. Please check your internet connection and proxy settings.');
    }
    
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

/**
 * Get a conversational response (maintains conversation context)
 * @param {Array} chatHistory - Array of previous messages in the conversation
 * @returns {Promise<string>} The AI's response
 */
export async function getConversationalResponse(chatHistory) {
  try {
    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
      throw new Error('Chat history is required and must be a non-empty array');
    }

    // Format chat history for Gemini API
    const formattedHistory = chatHistory.map(msg => {
      // Convert 'assistant' role to 'model' as required by Gemini
      const role = msg.role === 'assistant' ? 'model' : 'user';
      // Extract text from parts array or use content directly
      const text = Array.isArray(msg.parts) 
        ? msg.parts[0]?.text || ''
        : msg.content || msg.text || '';
      
      return {
        role,
        parts: [{ text }]
      };
    });

    // Start a chat session with the model
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    });

    // Get the last user message
    const lastMessage = formattedHistory[formattedHistory.length - 1];
    const userText = lastMessage.parts[0]?.text || '';

    // Send the message to the chat
    const result = await chat.sendMessage(userText);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Gemini Chat Error:', error);
    throw new Error(`Failed to get conversational response: ${error.message}`);
  }
}
