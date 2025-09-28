import express from "express";
import cors from "cors";
import multer from "multer";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY,});

app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const base64 = buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const contents = createUserContent([
      createPartFromBase64(base64, mimeType),
      "Caption this image.",
    ]);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log("Gemini caption:", response.text); 
    res.json({ caption: response.text });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});