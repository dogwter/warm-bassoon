import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend server is running" });
});

// Test endpoint to verify response structure
app.get("/test", (req, res) => {
  const testAnalysis = {
    adjectives: ["modern", "clean", "professional"],
    summary: "This is a test summary to verify the response structure is working correctly.",
    critiques: [
      {
        x: 200,
        y: 300,
        heading: "Test Critique",
        subheading: "This is a test critique to verify the hotspot system works."
      }
    ]
  };
  res.json({ analysis: testAnalysis });
});

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY, });

app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    console.log("Received image upload request");

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No image file uploaded" });
    }

    console.log("File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const buffer = req.file.buffer;
    const base64 = buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const prompt = `This image is a screenshot of a website. Your goal is to analyze it like a UI consultant.

IMPORTANT: You must respond with ONLY valid JSON in the exact format specified below. Do not include any other text, explanations, or markdown formatting.

Analyze the website and provide:
1. Two adjectives describing the website (e.g., "modern", "minimal", "clean")
2. A short summary of the website
3. Three specific UI critiques with pixel coordinates where the issues are located

Respond with this exact JSON structure:
{
  "adjectives": ["adjective1", "adjective2"],
  "summary": "A summary of the website describing its purpose, design, and user experience. max 20 words",
  "critiques": [
    {
      "x": 200,
      "y": 400,
      "heading": "Issue Title",
      "subheading": "Description of the UI issue and how to improve it. Max 15 words"
    },
    {
      "x": 300,
      "y": 150,
      "heading": "Another Issue",
      "subheading": "Another critique with improvement suggestions, Max 15 words"
    },
    {
      "x": 450,
      "y": 500,
      "heading": "Third Issue",
      "subheading": "Third critique with improvement recommendations, Max 15 words"
    }
  ]
}`;

    const contents = createUserContent([
      createPartFromBase64(base64, mimeType),
      prompt,
    ]);

    console.log("Sending request to Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log("Full Gemini response object:", response);
    console.log("Gemini response text:", response.text);
    console.log("Response text type:", typeof response.text);

    // Check if response.text exists
    if (!response.text) {
      console.log("❌ No text in Gemini response");
      return res.status(500).json({ error: "No response text from Gemini API" });
    }

    // Try to parse JSON response, fallback to raw text if parsing fails
    let analysisResult;
    try {
      // Clean the response text to extract JSON
      let jsonText = response.text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      console.log("Attempting to parse JSON:", jsonText);
      analysisResult = JSON.parse(jsonText);
      console.log("Successfully parsed JSON:", analysisResult);
    } catch (parseError) {
      console.log("Failed to parse JSON, using raw text:", parseError.message);
      console.log("Raw response text:", response.text);

      // Create a structured response from the raw text
      analysisResult = {
        adjectives: ["modern", "clean", "professional"],
        summary: response.text.substring(0, 200) + "...", // Truncate for display
        critiques: [
          {
            x: 360,
            y: 300,
            heading: "AI Analysis",
            subheading: "Raw analysis result available - JSON parsing failed"
          }
        ],
        rawText: response.text
      };
    }

    console.log("Sending analysis result:", JSON.stringify(analysisResult, null, 2));
    const responseData = { analysis: analysisResult };
    console.log("Full response being sent:", JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Failed to analyze image", details: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});