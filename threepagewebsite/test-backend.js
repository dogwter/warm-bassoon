// Simple test script to verify backend connectivity
const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test if server is running
    const response = await fetch('http://localhost:5000/analyze-image', {
      method: 'POST',
      body: new FormData() // Empty form data to test endpoint
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 400) {
      console.log('✅ Backend is running (expected 400 for empty request)');
    } else {
      console.log('Response:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('Make sure to start the backend server with: cd backend && npm start');
  }
};

testBackend();