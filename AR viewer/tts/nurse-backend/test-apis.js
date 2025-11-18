import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeech, speechToText } from './services/speechService.js';
import { writeFile, readFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Create test output directory
const testDir = path.join(__dirname, 'test-output');
if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true });
}

// Test TTS
async function testTTS() {
  try {
    console.log('🚀 Testing Text-to-Speech...');
    const text = 'Hello, this is a test of the text to speech service.';
    const audioContent = await textToSpeech(text);
    
    // Save the audio file
    const outputFile = path.join(testDir, 'test-output.mp3');
    await writeFile(outputFile, audioContent, 'binary');
    console.log(`✅ TTS Test: Audio saved to ${outputFile}`);
    
    return outputFile;
  } catch (error) {
    console.error('❌ TTS Test Failed:', error.message);
    throw error;
  }
}

// Test STT
async function testSTT(audioFile) {
  try {
    console.log('\n🎤 Testing Speech-to-Text...');
    const audioBuffer = await readFile(audioFile);
    
    console.log('Sending audio file for transcription...');
    const result = await speechToText(audioBuffer, {
      encoding: 'MP3',
      sampleRateHertz: 24000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true
    });
    
    console.log('✅ STT Test Successful');
    console.log('   Original Text:', 'Hello, this is a test of the text to speech service.');
    console.log('   Transcription:', result.text);
    
    return result;
  } catch (error) {
    console.error('❌ STT Test Failed:', error.message);
    if (error.details) {
      console.error('Error details:', JSON.stringify(error.details, null, 2));
    }
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    console.log('🔍 Environment Check:');
    console.log(`- GOOGLE_TTS_API_KEY: ${process.env.GOOGLE_TTS_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`- GOOGLE_STT_API_KEY: ${process.env.GOOGLE_STT_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    
    const audioFile = await testTTS();
    await testSTT(audioFile);
    
    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
