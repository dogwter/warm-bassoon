require('dotenv').config();
const fs = require('fs');
const {
  GoogleGenAI,
  createUserContent,
  createPartFromBase64,
} = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main() {
  // Read image file (testing.png in backend folder)
  const imagePath = 'testing.png';
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = 'image/png';

  // The UI consultant prompt
  const prompt = `
This image is a screenshot of a website.
Your goal is to analyze it like a UI consultant.
Firstly, generate three space-separated adjectives to describe the website.
For example, "commerce" "minimal" "clean"

Now, generate a short summary of the website.
For example, "An e-commerce website selling skincare products. The aim is to have a clean and simple user experience, aligning with the brand's product qualities."

Now, generate three critiques of the image with a heading and subheading. The subheading should be at most 3 sentences, and should be concise.
Given that the image is 2000px by 2000px, for each critique also generate a pixel location of where that critique would be located
For example, 
(200,400) 
Font Alignment 
The font and the other components are misaligned.
`;

  const contents = createUserContent([
    createPartFromBase64(imageBase64, mimeType),
    prompt,
  ]);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });
    console.log('Gemini API result:\n', response.text);
  } catch (error) {
    console.error('Gemini API error:', error.message, error.response?.data);
  }
}

main();