import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const cache = new Map();

const SYSTEM_PROMPT = `
You are an expert Multi-Agent AI System designed to generate stunning, premium UI code.
You must ONLY design specific, individual UI components (e.g., Headers, Footers, Pricing Cards, Buttons, Navbars, Hero Sections).

CRITICAL RULE:
If the user asks for an entire website, a full application, or a non-UI related prompt (e.g. poetry, math, general questions), YOU MUST REJECT IT.
If rejected, return EXACTLY this JSON structure:
{
  "rejected": true,
  "reason": "A brief, polite explanation of why the prompt was rejected (e.g., 'You asked for an entire website. I am optimized to generate specific UI components.').",
  "suggestions": [
     "A suggestion for a related specific component",
     "Another component suggestion",
     "A third component suggestion"
  ]
}

If the prompt IS valid and focuses on a specific UI component, you must generate EXACTLY 10 DISTINCT DESIGN VARIATIONS.
Each variation must be a self-contained, beautifully styled snippet using Tailwind CSS v4.

Return a JSON object exactly adhering to this structure:
{
  "rejected": false,
  "variations": [
    {
      "id": "var_1",
      "title": "Descriptive Title (e.g. Dark Glassmorphism)",
      "html": "The HTML code using Tailwind v4 classes...",
      "reactCode": "The equivalent React component code (JSX) using Tailwind classes...",
      "css": "Any custom CSS (or empty)",
      "js": "Any standard vanilla JavaScript (or empty)"
    }
  ]
}
CRITICAL: Do not generate excessively long generic content like paragraphs or massive SVGs. Focus purely on layout and aesthetics. Ensure the JSON is perfectly valid and terminated.
`;

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const cacheKey = prompt.trim().toLowerCase();

    if (cache.has(cacheKey)) {
      console.log("Serving from cache...");
      return NextResponse.json(cache.get(cacheKey));
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY found. Running Mock Multi-Agent Simulator...");
      await new Promise(r => setTimeout(r, 2000));
      
      // Mock rejection logic
      if (prompt.toLowerCase().includes("website") || prompt.toLowerCase().includes("app") || prompt.toLowerCase().includes("poem")) {
         const mockRejection = {
            rejected: true,
            reason: "You requested an entire website or invalid prompt. I am optimized to build specific, atomic UI components.",
            suggestions: [
               "A high-converting landing page hero section",
               "A modern glassmorphism pricing table",
               "An elegant dashboard sidebar navigation"
            ]
         };
         cache.set(cacheKey, mockRejection);
         return NextResponse.json(mockRejection);
      }

      const mockData = {
        rejected: false,
        variations: [
          {
            id: "1", title: "Modern Dark",
            html: `<div class="p-8 bg-gray-900 text-white rounded-xl"><h1 class="text-2xl font-bold">Modern Header</h1></div>`,
            reactCode: `export default function ModernHeader() {\n  return (\n    <div className="p-8 bg-gray-900 text-white rounded-xl">\n      <h1 className="text-2xl font-bold">Modern Header</h1>\n    </div>\n  );\n}`,
            css: "", js: ""
          },
          {
            id: "2", title: "Glassmorphism",
            html: `<div class="p-8 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20"><h1 class="text-2xl font-bold">Glass Header</h1></div>`,
            reactCode: `export default function GlassHeader() {\n  return (\n    <div className="p-8 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20">\n      <h1 className="text-2xl font-bold">Glass Header</h1>\n    </div>\n  );\n}`,
            css: "", js: ""
          },
          {
            id: "3", title: "Minimal Light",
            html: `<div class="p-8 bg-white text-gray-900 rounded-xl border"><h1 class="text-2xl font-bold">Minimal Header</h1></div>`,
            reactCode: `export default function MinimalHeader() {\n  return (\n    <div className="p-8 bg-white text-gray-900 rounded-xl border">\n      <h1 className="text-2xl font-bold">Minimal Header</h1>\n    </div>\n  );\n}`,
            css: "", js: ""
          },
          {
            id: "4", title: "Vibrant Gradient",
            html: `<div class="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"><h1 class="text-2xl font-bold">Vibrant Header</h1></div>`,
            reactCode: `export default function VibrantHeader() {\n  return (\n    <div className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">\n      <h1 className="text-2xl font-bold">Vibrant Header</h1>\n    </div>\n  );\n}`,
            css: "", js: ""
          }
        ]
      };
      cache.set(cacheKey, mockData);
      return NextResponse.json(mockData);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    let rawText = typeof response.text === 'function' ? response.text() : response.text;
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(rawText);
    
    cache.set(cacheKey, data);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Agent Pipeline Error:", error);
    return NextResponse.json({ error: "The AI text generation failed or was truncated. Please try again with a simpler idea." }, { status: 500 });
  }
}
