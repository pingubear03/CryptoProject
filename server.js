// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Note: Ensure you are using the correct SDK version for this syntax
const { GoogleGenAI } = require('@google/genai'); 
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- STEP 1: DEFINE THE SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are a concise AI educational tutor. Your goal is to explain concepts quickly and effectively, respecting the student's time.

**Strict Constraints:**
- Keep the entire response under 100 words.
- Use simple, direct language. Avoid fluff.

**Response Structure:**
1. **Concept:** Combine the technical definition and a simple analogy into 2 sentences maximum.
2. **Example:** Provide 1 short, concrete example (code snippet or math equation).
3. **Challenge:** Ask 1 short critical thinking question to check understanding.

**Tone:** Efficient, helpful, and direct.
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    // --- STEP 2: INJECT THE PROMPT INTO THE CONFIG ---
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      
      // Add the configuration object here
      config: {
        systemInstruction: {
          parts: [
            { text: SYSTEM_PROMPT }
          ]
        }
      },

      // It is safer to format contents as an array of parts
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]
    });

    // The SDK structure for response might vary, but usually response.text() is a function
    // or response.text is a getter. If using the specific @google/genai SDK:
    res.json({ reply: response.text }); 
    
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "I cannot connect to the mainframe right now." });
  }
});

app.listen(3000, () => console.log('✅ Server is running on http://localhost:3000'));