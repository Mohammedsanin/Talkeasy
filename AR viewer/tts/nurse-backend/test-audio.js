import { textToSpeech, speechToText, saveAudioFile } from './services/speechService.js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAudioPipeline() {
  try {
    console.log('🔊 Testing Text-to-Speech...');
    
    // Test text to speech
    const testText = "Hello, this is a test of the text to speech functionality. How are you today?";
    console.log(`\n📝 Text: "${testText}"`);
    
    const audioBuffer = await textToSpeech(testText, {
      languageCode: 'en-US',
      voiceName: 'en-US-Studio-O',
      audioEncoding: 'MP3',
      sampleRateHertz: 24000
    });
    
    console.log('\n✅ Text-to-Speech successful!');
    
    // Save the audio file
    const audioPath = await saveAudioFile(audioBuffer, 'test-output.mp3');
    console.log(`\n💾 Audio saved to: ${audioPath}`);
    
    // Test speech to text
    console.log('\n🔊 Testing Speech-to-Text...');
    const transcription = await speechToText(audioBuffer, {
      languageCode: 'en-US',
      sampleRateHertz: 24000
    });
    
    console.log('\n🎤 Transcription:', transcription.text);
    console.log('\n✨ Audio pipeline test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    if (error.details) {
      console.error('Error details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

testAudioPipeline();
