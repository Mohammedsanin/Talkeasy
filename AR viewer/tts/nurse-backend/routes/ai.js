import express from 'express';
import { getAIResponse, getConversationalResponse } from '../services/geminiService.js';
import { textToSpeech } from '../services/speechService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Simple text query endpoint
router.post('/query', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Text query is required' 
      });
    }

    console.log('Processing query:', text);
    const response = await getAIResponse(text);
    
    res.json({
      query: text,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI Query Error:', error);
    res.status(500).json({
      error: 'Failed to process AI query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Conversational endpoint (maintains context)
router.post('/conversation', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Messages array is required with at least one message' 
      });
    }

    console.log('Processing conversation with', messages.length, 'messages');
    const response = await getConversationalResponse(messages);
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Conversation Error:', error);
    res.status(500).json({
      error: 'Failed to process conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Unified chat endpoint that returns both text and audio responses
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    console.log('Processing message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    
    // Get text response from Gemini
    let responseText;
    if (conversationHistory.length > 0) {
      responseText = await getConversationalResponse([
        ...conversationHistory,
        { role: 'user', parts: [{ text: message }] }
      ]);
    } else {
      responseText = await getAIResponse(message);
    }

    // Generate audio for the response
    let audioUrl = '';
    try {
      const ttsResult = await textToSpeech(responseText);
      audioUrl = ttsResult.audioUrl;
    } catch (ttsError) {
      console.error('TTS Error (non-fatal):', ttsError);
      // Continue without audio if TTS fails
    }

    // Return both text and audio response
    res.json({
      text: responseText,
      audioUrl: audioUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
