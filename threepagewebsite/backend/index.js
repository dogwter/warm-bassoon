require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const {
  GoogleGenAI,
  createUserContent,
  createPartFromBase64,
} = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Store the current image path
let currentImagePath = 'testing.png'; // default fallback

// Upload endpoint
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Update current image path to the uploaded file
    currentImagePath = req.file.path;
    
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Enhanced analysis endpoint
app.get('/analyze-image', async (req, res) => {
  try {
    // Check if the current image file exists
    if (!fs.existsSync(currentImagePath)) {
      return res.status(404).json({ error: 'No image available for analysis' });
    }

    const imageBuffer = fs.readFileSync(currentImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Determine MIME type from file extension
    const ext = path.extname(currentImagePath).toLowerCase();
    let mimeType = 'image/png'; // default
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';

    const prompt = `
Analyze this image as a UI/UX consultant. Please structure your response as follows:

1. ADJECTIVES: Provide 3-5 descriptive adjectives separated by spaces
2. SUMMARY: Write a 2-3 sentence summary of the overall design/content
3. CRITIQUES: Provide exactly 3 critiques, each with:
   - A clear heading (what aspect you're critiquing)
   - A detailed description (2-3 sentences explaining the critique)
   - Pixel coordinates where this critique applies (format: "Location: x=123, y=456" where x and y are pixel positions)

Make sure to provide specific pixel coordinates for each critique based on where users should focus their attention in the image.
`;

    const contents = createUserContent([
      createPartFromBase64(imageBase64, mimeType),
      prompt,
    ]);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const analysisText = response.text;

    // Optional: Parse the structured response
    const structuredData = parseGeminiResponse(analysisText);

    res.json({ 
      result: analysisText,
      structured: structuredData,
      metadata: {
        filename: path.basename(currentImagePath),
        mimeType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

// Helper function to parse Gemini's structured response
function parseGeminiResponse(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  const result = {
    adjectives: [],
    summary: '',
    critiques: []
  };

  let currentSection = 'none';
  let currentCritique = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect sections
    if (trimmedLine.toLowerCase().includes('adjective')) {
      currentSection = 'adjectives';
      // Extract adjectives from this line
      const words = trimmedLine.split(/\s+/).filter(word => 
        word.length > 2 && !word.toLowerCase().includes('adjective')
      );
      result.adjectives.push(...words);
      continue;
    } else if (trimmedLine.toLowerCase().includes('summary')) {
      currentSection = 'summary';
      continue;
    } else if (trimmedLine.toLowerCase().includes('critique')) {
      currentSection = 'critiques';
      continue;
    }

    // Process content based on current section
    if (currentSection === 'adjectives' && trimmedLine.length > 0) {
      const words = trimmedLine.split(/\s+/).filter(word => word.length > 2);
      result.adjectives.push(...words);
    } else if (currentSection === 'summary' && trimmedLine.length > 10) {
      result.summary += (result.summary ? ' ' : '') + trimmedLine;
    } else if (currentSection === 'critiques') {
      // Look for headings (usually bold or numbered)
      if (trimmedLine.includes('**') || trimmedLine.match(/^\d+\./) || 
          (trimmedLine.length < 50 && !trimmedLine.toLowerCase().includes('location'))) {
        
        // Save previous critique if complete
        if (currentCritique.heading && currentCritique.description) {
          result.critiques.push({ ...currentCritique });
        }
        
        // Start new critique
        currentCritique = {
          heading: trimmedLine.replace(/\*\*/g, '').replace(/^\d+\.\s*/, ''),
          description: '',
          x: 50, // default values
          y: 50
        };
      } 
      // Look for coordinate information
      else if (trimmedLine.toLowerCase().includes('location') || 
               trimmedLine.toLowerCase().includes('pixel') ||
               trimmedLine.match(/x\s*[=:]\s*\d+/)) {
        
        const xMatch = trimmedLine.match(/x\s*[=:]\s*(\d+)/i);
        const yMatch = trimmedLine.match(/y\s*[=:]\s*(\d+)/i);
        
        if (xMatch) currentCritique.x = Math.min(95, Math.max(5, (parseInt(xMatch[1]) / 1920) * 100));
        if (yMatch) currentCritique.y = Math.min(95, Math.max(5, (parseInt(yMatch[1]) / 1080) * 100));
      }
      // Otherwise, it's probably description text
      else if (trimmedLine.length > 10 && currentCritique.heading) {
        currentCritique.description += (currentCritique.description ? ' ' : '') + trimmedLine;
      }
    }
  }

  // Add the last critique if it exists
  if (currentCritique.heading && currentCritique.description) {
    result.critiques.push(currentCritique);
  }

  return result;
}

// Cleanup endpoint to remove uploaded files
app.delete('/cleanup', (req, res) => {
  if (currentImagePath !== 'testing.png' && fs.existsSync(currentImagePath)) {
    try {
      fs.unlinkSync(currentImagePath);
      currentImagePath = 'testing.png'; // reset to default
      res.json({ success: true, message: 'Cleanup completed' });
    } catch (error) {
      res.status(500).json({ error: 'Cleanup failed' });
    }
  } else {
    res.json({ success: true, message: 'Nothing to cleanup' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/upload-image`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/analyze-image`);
});