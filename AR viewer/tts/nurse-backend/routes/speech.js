import express from 'express';
import multer from 'multer';
import { textToSpeech, speechToText } from '../services/speechService.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (!file.mimetype.match(/audio\/(webm|wav|mpeg|mp3|ogg|m4a|mp4)$/)) {
      return cb(new Error('Only audio files are allowed!'), false);
    }
    cb(null, true);
  }
});

const router = express.Router();

/**
 * @route   GET /api/speech/health
 * @desc    Health check endpoint for speech services
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    // Simple health check that doesn't require API calls
    res.json({
      status: 'ok',
      services: {
        tts: process.env.GOOGLE_TTS_API_KEY ? 'available' : 'missing_api_key',
        stt: process.env.GOOGLE_STT_API_KEY ? 'available' : 'missing_api_key'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/speech/tts
 * @desc    Convert text to speech
 * @access  Public
 * @body    {string} text - The text to convert to speech
 * @body    {string} [voiceName=en-US-Studio-O] - The voice to use
 * @body    {string} [languageCode=en-US] - The language code
 * @returns {Object} Audio data and URL
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, voiceName, languageCode } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: 'Text is required for text-to-speech conversion'
      });
    }

    console.log(`TTS Request - Text length: ${text.length} chars`);
    
    const result = await textToSpeech(text, {
      voiceName,
      languageCode,
      audioEncoding: 'MP3',
      sampleRateHertz: 24000
    });

    res.json({
      success: true,
      textLength: text.length,
      audioUrl: result.audioUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.details
      })
    });
  }
});

/**
 * @route   POST /api/speech/stt
 * @desc    Convert speech to text
 * @access  Public
 * @consumes multipart/form-data
 * @param   {File} audio - The audio file to transcribe (WAV, MP3, or WebM/Opus)
 * @param   {string} [languageCode=en-US] - Language code (e.g., 'en-US', 'es-ES')
 * @param   {string} [sampleRateHertz=16000] - Sample rate in Hz (typically 16000 or 48000)
 * @returns {Object} Transcription result
 */
router.post('/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided. Please upload an audio file.'
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { languageCode = 'en-US', sampleRateHertz = 16000 } = req.body;

    console.log(`STT Request - File: ${originalname}, Type: ${mimetype}, Size: ${size} bytes`);

    // Determine the encoding based on the file type
    let encoding = 'LINEAR16'; // Default to WAV format
    
    if (mimetype.includes('webm') || mimetype.includes('opus')) {
      encoding = 'WEBM_OPUS';
    } else if (mimetype.includes('mp3') || mimetype.includes('mpeg')) {
      encoding = 'MP3';
    } else if (mimetype.includes('wav') || mimetype.includes('wave')) {
      encoding = 'LINEAR16';
    }

    console.log(`Processing audio with encoding: ${encoding}, sample rate: ${sampleRateHertz}Hz, language: ${languageCode}`);

    const result = await speechToText(buffer, {
      encoding,
      sampleRateHertz: parseInt(sampleRateHertz),
      languageCode
    });

    if (!result || !result.text) {
      throw new Error('No transcription results returned from the speech service');
    }

    res.json({
      success: true,
      text: result.text,
      results: result.results || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('STT Error:', error);
    
    // More specific error messages for common issues
    let errorMessage = 'Failed to transcribe audio';
    let statusCode = 500;
    
    if (error.message.includes('No speech detected')) {
      errorMessage = 'No speech was detected in the audio. Please try speaking more clearly.';
      statusCode = 400;
    } else if (error.message.includes('Invalid audio format')) {
      errorMessage = 'Unsupported audio format. Please use WAV, MP3, or WebM/Opus formats.';
      statusCode = 400;
    } else if (error.message.includes('sample rate')) {
      errorMessage = 'Unsupported sample rate. Please use 16000Hz or 48000Hz.';
      statusCode = 400;
    }
    
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: error.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      if (error.details) {
        errorResponse.details = error.details;
      }
    }
    
    res.status(statusCode).json(errorResponse);
  }
});

export default router;