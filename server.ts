import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini client to satisfy AI Studio key safety and guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your AI Studio Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Personalized Insights Generation API
app.post("/api/insights", async (req, res) => {
  try {
    const { calculatorData } = req.body;
    if (!calculatorData) {
      return res.status(400).json({ error: "Missing calculatorData in request body" });
    }

    const {
      carDistance = 0,
      carType = "none",
      transitDistance = 0,
      flightsTime = 0,
      electricity = 0,
      gas = 0,
      diet = "moderate-meat",
      wasteRecycling = "partial"
    } = calculatorData;

    const ai = getGeminiClient();

    const prompt = `
      As a sustainability expert, analyze this household carbon footprint data and give personalized, highly actionable insights.
      User's Weekly Profile:
      - Transp: Drives ${carDistance} km/week in a "${carType}" car. Takes ${transitDistance} km/week of public transit.
      - Flights: Flies ${flightsTime} hours/year.
      - Home Energy: Uses ${electricity} kWh electricity and ${gas} units/m3 of heating gas per month.
      - Diet: Eats a "${diet}" diet.
      - Lifestyle: Does "${wasteRecycling}" recycling.

      Provide:
      1. A custom summary assessing how their footprint looks.
      2. Specific, constructive insights per category: transportation, energy, lifestyle/diet.
      3. At least 4 highly practical concrete daily habits tailored to their profile (e.g. if they have high transport, recommend a specific carpooling/biking habit; if they have heavy-meat diet, recommend a plant-based day with accurate metric calculations).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A summary assessing their overall carbon footprint trends in 2 concise sentences."
            },
            categoryInsights: {
              type: Type.OBJECT,
              properties: {
                transport: { type: Type.STRING, description: "Actionable observation about transportation." },
                energy: { type: Type.STRING, description: "Actionable observation about home heating/electricity usage." },
                diet: { type: Type.STRING, description: "Actionable observation about dietary carbon footprint." }
              },
              required: ["transport", "energy", "diet"]
            },
            recommendedHabits: {
              type: Type.ARRAY,
              description: "Four specific practical day-to-day reduction actions tailored to change these metrics.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Brief clear habit name (e.g., 'Switch off power strips')" },
                  description: { type: Type.STRING, description: "A friendly 1-sentence tip on how to do it and its carbon reduction mechanism." },
                  kgCo2Saved: { type: Type.NUMBER, description: "CO2e savings in kg per individual action event (give realistic numbers like 1.5, 3.2, 0.8, etc.)" },
                  category: { type: Type.STRING, description: "Must be one of: 'transportation', 'energy', or 'lifestyle'" }
                },
                required: ["name", "description", "kgCo2Saved", "category"]
              }
            }
          },
          required: ["summary", "categoryInsights", "recommendedHabits"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response received from Gemini");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: error?.message || "Failed to communicate with AI model" });
  }
});

// 2. Personal Eco Advisor Conversational Assistant API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, calculatorData } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are an elegant, encouraging, and scientifically accurate Eco-Advisor helping individuals reduce their personal carbon footprint.
      Your tone is empathetic, professional, and completely free of doom-mongering. Offer constructive, highly detailed instructions.
      
      Always base your context on the user's current carbon profile if available:
      ${calculatorData ? JSON.stringify(calculatorData) : "No profile calculated yet."}

      Keep responses professional, readable in markdown with clear formatting, and restricted to no more than 150-250 words per message where feasible to optimize reading experience.
    `;

    // Map history to the required format for chats
    // e.g. [{ role: 'user' | 'model', parts: [{ text: string }] }]
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({
      message: message
    });

    res.json({
      reply: response.text
    });
  } catch (error: any) {
    console.error("Error in conversational advisor:", error);
    res.status(500).json({ error: error?.message || "Failed to communicate with AI chat engine" });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
