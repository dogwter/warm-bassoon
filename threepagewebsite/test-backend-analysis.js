// Simple test using built-in fetch (Node 18+)
const fs = require('fs');

const testAnalysis = async () => {
  try {
    console.log('Testing backend analysis endpoint...');
    
    // Check if test image exists
    const testImagePath = 'backend/testing.png';
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      return;
    }

    // Create form data with test image
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'testing.png');

    const response = await fetch('http://localhost:5000/analyze-image', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis successful!');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('Analysis data:', data.analysis);
    } else {
      const errorText = await response.text();
      console.log('❌ Analysis failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAnalysis();