import fetch from 'node-fetch';
import { join, basename } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Base URLs for Google Cloud APIs
const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const STT_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';

// Directory to store audio files
const audioDir = join(process.cwd(), 'public', 'audios');

// Function to ensure audio directory exists
async function ensureAudioDir() {
  if (!existsSync(audioDir)) {
    await mkdir(audioDir, { recursive: true });
    console.log('Created audio directory at:', audioDir);
  }
}

// Initialize the audio directory
await ensureAudioDir();

/**
 * Make an authenticated request to Google Cloud APIs
 * @param {string} url - The API endpoint URL
 * @param {string} apiKey - The Google Cloud API key
 * @param {Object} body - The request body
 * @param {string} [method='POST'] - The HTTP method
 * @returns {Promise<Object>} The parsed JSON response
 */
async function makeRequest(url, apiKey, body, method = 'POST') {
  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Goog-Api-Key': apiKey
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || 'API request failed');
      error.code = data.error?.code || response.status;
      error.details = data.error?.details || data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', {
      url,
      method,
      error: error.message,
      stack: error.stack,
      details: error.details
    });
    throw error;
  }
}

/**
 * Convert text to speech using Google Cloud Text-to-Speech API
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Options for the TTS request
 * @returns {Promise<{audioBuffer: Buffer, audioUrl: string}>} The audio buffer and URL
 */
export async function textToSpeech(text, options = {}) {
  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY is required');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('Valid text is required for text-to-speech conversion');
    }

    const request = {
      input: { text },
      voice: {
        languageCode: options.languageCode || 'en-US',
        name: options.voiceName || 'en-US-Studio-O',
        ssmlGender: options.ssmlGender || 'FEMALE',
      },
      audioConfig: {
        audioEncoding: options.audioEncoding || 'MP3',
        speakingRate: options.speakingRate || 1.0,
        pitch: options.pitch || 0,
        volumeGainDb: options.volumeGainDb || 0,
        sampleRateHertz: options.sampleRateHertz || 24000,
        effectsProfileId: ['headphone-class-device']
      }
    };

    console.log('Sending TTS request for text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    
    // Make the API request
    const response = await makeRequest(TTS_API_URL, apiKey, request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API');
    }
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(response.audioContent, 'base64');
    
    // Save the audio file
    const audioUrl = await saveAudioFile(audioBuffer, `tts-${Date.now()}.mp3`);
    
    // Return the audio URL for the frontend to handle playback
    return {
      audioBuffer,
      audioUrl: `/audios/${basename(audioUrl)}`
    };
  } catch (error) {
    console.error('❌ TTS Error:', error);
    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
}

/**
 * Convert speech to text using Google Cloud Speech-to-Text API
 * @param {Buffer} audioBuffer - The audio buffer to transcribe
 * @param {Object} options - Options for the STT request
 * @returns {Promise<{text: string, results: Array}>} The transcription results
 */
export async function speechToText(audioBuffer, options = {}) {
  try {
    const apiKey = process.env.GOOGLE_STT_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_STT_API_KEY is required');
    }

    if (!audioBuffer || !(audioBuffer instanceof Buffer)) {
      throw new Error('Valid audio buffer is required for speech-to-text conversion');
    }

    if (audioBuffer.length === 0) {
      throw new Error('Empty audio buffer provided');
    }

    console.log(`Processing audio buffer - Size: ${audioBuffer.length} bytes`);

    // For debugging: Save the audio buffer to a file
    if (process.env.DEBUG_AUDIO === 'true') {
      const debugPath = join(process.cwd(), 'debug_audio.wav');
      await writeFile(debugPath, audioBuffer);
      console.log(`Debug audio saved to: ${debugPath}`);
    }

    const request = {
      audio: {
        content: audioBuffer.toString('base64')
      },
      config: {
        encoding: options.encoding || 'WEBM_OPUS',
        sampleRateHertz: parseInt(options.sampleRateHertz) || 48000,
        languageCode: options.languageCode || 'en-US',
        enableAutomaticPunctuation: true,
        model: options.model || 'default',
        useEnhanced: options.useEnhanced || false,
        metadata: {
          interactionType: 'DICTATION',
          microphoneDistance: 'NEARFIELD',
          recordingDeviceType: 'SMARTPHONE',
          originalMediaType: 'AUDIO',
        }
      }
    };

    const response = await makeRequest(STT_API_URL, apiKey, request);

    if (!response.results || response.results.length === 0) {
      throw new Error('No transcription results returned from STT service');
    }

    // Return the most confident transcription
    const transcription = response.results
      .map(result => result.alternatives[0]?.transcript || '')
      .filter(text => text.trim())
      .join('\n');

    if (!transcription) {
      throw new Error('No speech was detected in the audio');
    }

    return {
      text: transcription,
      results: response.results,
      rawResponse: response
    };
  } catch (error) {
    console.error('❌ STT Error:', error);
    throw new Error(`Failed to convert speech to text: ${error.message}`);
  }
}

/**
 * Save audio content to a file
 * @param {Buffer} audioContent - The audio content to save
 * @param {string} [filename] - The name of the audio file (optional)
 * @returns {Promise<string>} The public URL path to the saved audio file
 */
export async function saveAudioFile(audioContent, filename) {
  try {
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }
    
    const safeFilename = filename || `audio-${Date.now()}-${uuidv4().substring(0, 8)}.mp3`;
    const filePath = join(audioDir, safeFilename);
    
    await writeFile(filePath, audioContent);
    
    return `/audios/${safeFilename}`;
  } catch (error) {
    console.error('❌ Error saving audio file:', error);
    throw new Error(`Failed to save audio file: ${error.message}`);
  }
}

// For backward compatibility
export const initializeTTSCLient = () => ({});
export const initializeSTTClient = () => ({});