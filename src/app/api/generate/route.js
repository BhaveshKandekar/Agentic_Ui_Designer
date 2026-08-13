import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const cache = new Map();

const SYSTEM_PROMPT = `
You are an expert Multi-Agent AI System designed to generate high-quality UI component code.
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

If the prompt IS valid and focuses on a specific UI component, you must generate EXACTLY 5 DISTINCT DESIGN VARIATIONS based on these 5 profiles:
1. GLASSMORPHISM: Looks futuristic and expensive — glass cards, blur, gradients. Great for AI/SaaS.
2. BENTO GRID: Modern, polished modular rectangular cards; excellent for feature sections and dashboards.
3. MINIMALIST: Clean, professional, premium through typography, spacing, and simplicity.
4. DARK LUXURY / DARK UI: Dark backgrounds with subtle gradients and elegant typography; premium and suitable for AI/fintech/tech products.
5. 3D / INTERACTIVE UI: 3D objects, animations, depth and interaction (higher complexity).

Return a JSON object exactly adhering to this structure:
{
  "rejected": false,
  "variations": [
    {
      "id": "var_1",
      "title": "Profile Name (e.g. Glassmorphism Card)",
      "html": "Pure HTML with Tailwind v4 classes...",
      "reactCode": "Functional React component with Tailwind...",
      "css": "Minimal custom CSS (or empty)",
      "js": "Optional JS (or empty)"
    }
  ]
}
CRITICAL: Keep code blocks concise to ensure all 5 variations are returned. Avoid large SVGs or paragraphs. Ensure perfect JSON syntax.
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
            id: "1",
            title: "Glassmorphism Premium",
            html: `<div class="p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg"><h3 class="text-xl font-semibold text-white">Glass Card</h3><p class="mt-2 text-sm text-white/80">Frosted glass, soft gradients, premium AI/SaaS look.</p></div>`,
            reactCode: `export default function GlassCard() {\n  return (\n    <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">\n      <h3 className="text-xl font-semibold text-white">Glass Card</h3>\n      <p className="mt-2 text-sm text-white/80">Frosted glass, soft gradients, premium AI/SaaS look.</p>\n    </div>\n  );\n}`,
            css: "",
            js: ""
          },
          {
            id: "2",
            title: "Bento Grid Module",
            html: `<div class="grid grid-cols-3 gap-4"><div class="p-4 bg-white rounded-md shadow-sm">Feature</div><div class="p-4 bg-white rounded-md shadow-sm">Stats</div><div class="p-4 bg-white rounded-md shadow-sm">CTA</div></div>`,
            reactCode: `export default function BentoGrid() {\n  return (\n    <div className="grid grid-cols-3 gap-4">\n      <div className="p-4 bg-white rounded-md shadow-sm">Feature</div>\n      <div className="p-4 bg-white rounded-md shadow-sm">Stats</div>\n      <div className="p-4 bg-white rounded-md shadow-sm">CTA</div>\n    </div>\n  );\n}`,
            css: "",
            js: ""
          },
          {
            id: "3",
            title: "Minimalist Card",
            html: `<div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800"><h3 class="text-lg font-medium">Minimalist</h3><p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Typography, spacing, and simplicity for a corporate feel.</p></div>`,
            reactCode: `export default function Minimalist() {\n  return (\n    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">\n      <h3 className="text-lg font-medium">Minimalist</h3>\n      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Typography, spacing, and simplicity for a corporate feel.</p>\n    </div>\n  );\n}`,
            css: "",
            js: ""
          },
          {
            id: "4",
            title: "Dark Luxury Panel",
            html: `<div class="p-8 bg-linear-to-b from-[#07070a] to-[#0f1724] text-white rounded-xl shadow-2xl"><h3 class="text-xl font-semibold">Dark Luxury</h3><p class="mt-2 text-sm text-white/75">Elegant typography, subtle gradients, premium dark aesthetic.</p></div>`,
            reactCode: `export default function DarkLuxury() {\n  return (\n    <div className="p-8 bg-linear-to-b from-[#07070a] to-[#0f1724] text-white rounded-xl shadow-2xl">\n      <h3 className="text-xl font-semibold">Dark Luxury</h3>\n      <p className="mt-2 text-sm text-white/75">Elegant typography, subtle gradients, premium dark aesthetic.</p>\n    </div>\n  );\n}`,
            css: "",
            js: ""
          },
          {
            id: "5",
            title: "3D Interactive Card",
            html: `<div class="p-6 bg-white rounded-lg shadow-2xl perspective-1000"><div class="transform-gpu hover:rotate-y-6 hover:scale-105 transition-transform"> <h3 class="text-lg font-semibold">3D Interactive</h3><p class="mt-2 text-sm text-zinc-600">Depth, subtle animation, interactive affordances.</p></div></div>`,
            reactCode: `export default function Interactive3D() {\n  return (\n    <div className="p-6 bg-white rounded-lg shadow-2xl perspective-1000">\n      <div className="transform-gpu hover:rotate-y-6 hover:scale-105 transition-transform">\n        <h3 className="text-lg font-semibold">3D Interactive</h3>\n        <p className="mt-2 text-sm text-zinc-600">Depth, subtle animation, interactive affordances.</p>\n      </div>\n    </div>\n  );\n}`,
            css: "",
            js: ""
          }
        ]
      };
      cache.set(cacheKey, mockData);
      return NextResponse.json(mockData);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let response;
    let errorToThrow;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            maxOutputTokens: 12000,
          }
        });
        errorToThrow = null;
        break; // Success
      } catch (err) {
        console.error(`AI Generation with ${modelName} failed:`, err.message || err);
        errorToThrow = err;
        // Wait briefly before trying the next model
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (errorToThrow) {
      throw errorToThrow;
    }

    let rawText = "";
    if (typeof response.text === 'function') {
      try {
        rawText = response.text();
      } catch (e) {
        if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
          rawText = response.candidates[0].content.parts[0].text;
        }
      }
    } else if (typeof response.text === 'string') {
      rawText = response.text;
    } else if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      rawText = response.candidates[0].content.parts[0].text;
    }

    if (!rawText) {
      throw new Error("Empty response from AI");
    }

    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON Parse Error. Length:", rawText.length, "Attempting repair...");
      
      let fixedText = rawText;
      
      // 1. Remove trailing backslash
      if (fixedText.endsWith('\\')) fixedText = fixedText.slice(0, -1);

      // 2. Handle open string
      let inString = false;
      let isEscaped = false;
      for (let i = 0; i < fixedText.length; i++) {
        if (fixedText[i] === '"' && !isEscaped) {
          inString = !inString;
        }
        isEscaped = (fixedText[i] === '\\' && !isEscaped);
      }
      if (inString) fixedText += '"';
      
      // 3. Handle trailing comma after string close
      if (fixedText.trim().endsWith(',')) fixedText = fixedText.trim().slice(0, -1);
      
      // 4. Balance brackets and braces
      let stack = [];
      let currentInString = false;
      let currentEscaped = false;
      for (let i = 0; i < fixedText.length; i++) {
        if (fixedText[i] === '"' && !currentEscaped) {
          currentInString = !currentInString;
        } else if (!currentInString) {
          if (fixedText[i] === '{' || fixedText[i] === '[') stack.push(fixedText[i]);
          else if (fixedText[i] === '}') {
            if (stack[stack.length - 1] === '{') stack.pop();
          }
          else if (fixedText[i] === ']') {
            if (stack[stack.length - 1] === '[') stack.pop();
          }
        }
        currentEscaped = (fixedText[i] === '\\' && !currentEscaped);
      }
      
      while (stack.length > 0) {
        let op = stack.pop();
        fixedText += (op === '{' ? '}' : ']');
      }

      try {
        data = JSON.parse(fixedText);
        console.log("JSON Repair Success!");
      } catch (innerError) {
        console.error("JSON Repair Final Attempt Failed. Tail:", fixedText.slice(-50));
        throw parseError;
      }
    }
    
    console.log(`Successfully parsed ${data.variations?.length || 0} variations.`);

    const expectedDesigns = [
      {
        id: "fallback_1",
        title: "Glassmorphism Premium",
        html: `<div class="p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg"><h3 class="text-xl font-semibold text-white">Glass Card</h3><p class="mt-2 text-sm text-white/80">Frosted glass, soft gradients, premium AI/SaaS look.</p></div>`,
        reactCode: `export default function GlassCard() {\n  return (\n    <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">\n      <h3 className="text-xl font-semibold text-white">Glass Card</h3>\n      <p className="mt-2 text-sm text-white/80">Frosted glass, soft gradients, premium AI/SaaS look.</p>\n    </div>\n  );\n}`,
        css: "",
        js: ""
      },
      {
        id: "fallback_2",
        title: "Bento Grid Module",
        html: `<div class="grid grid-cols-3 gap-4"><div class="p-4 bg-white rounded-md shadow-sm">Feature</div><div class="p-4 bg-white rounded-md shadow-sm">Stats</div><div class="p-4 bg-white rounded-md shadow-sm">CTA</div></div>`,
        reactCode: `export default function BentoGrid() {\n  return (\n    <div className="grid grid-cols-3 gap-4">\n      <div className="p-4 bg-white rounded-md shadow-sm">Feature</div>\n      <div className="p-4 bg-white rounded-md shadow-sm">Stats</div>\n      <div className="p-4 bg-white rounded-md shadow-sm">CTA</div>\n    </div>\n  );\n}`,
        css: "",
        js: ""
      },
      {
        id: "fallback_3",
        title: "Minimalist Card",
        html: `<div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800"><h3 class="text-lg font-medium">Minimalist</h3><p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Typography, spacing, and simplicity for a corporate feel.</p></div>`,
        reactCode: `export default function Minimalist() {\n  return (\n    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">\n      <h3 className="text-lg font-medium">Minimalist</h3>\n      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Typography, spacing, and simplicity for a corporate feel.</p>\n    </div>\n  );\n}`,
        css: "",
        js: ""
      },
      {
        id: "fallback_4",
        title: "Dark Luxury Panel",
        html: `<div class="p-8 bg-linear-to-b from-[#07070a] to-[#0f1724] text-white rounded-xl shadow-2xl"><h3 class="text-xl font-semibold">Dark Luxury</h3><p class="mt-2 text-sm text-white/75">Elegant typography, subtle gradients, premium dark aesthetic.</p></div>`,
        reactCode: `export default function DarkLuxury() {\n  return (\n    <div className="p-8 bg-linear-to-b from-[#07070a] to-[#0f1724] text-white rounded-xl shadow-2xl">\n      <h3 className="text-xl font-semibold">Dark Luxury</h3>\n      <p className="mt-2 text-sm text-white/75">Elegant typography, subtle gradients, premium dark aesthetic.</p>\n    </div>\n  );\n}`,
        css: "",
        js: ""
      },
      {
        id: "fallback_5",
        title: "3D Interactive Card",
        html: `<div class="p-6 bg-white rounded-lg shadow-2xl perspective-1000"><div class="transform-gpu hover:rotate-y-6 hover:scale-105 transition-transform"> <h3 class="text-lg font-semibold">3D Interactive</h3><p class="mt-2 text-sm text-zinc-600">Depth, subtle animation, interactive affordances.</p></div></div>`,
        reactCode: `export default function Interactive3D() {\n  return (\n    <div className="p-6 bg-white rounded-lg shadow-2xl perspective-1000">\n      <div className="transform-gpu hover:rotate-y-6 hover:scale-105 transition-transform">\n        <h3 className="text-lg font-semibold">3D Interactive</h3>\n        <p className="mt-2 text-sm text-zinc-600">Depth, subtle animation, interactive affordances.</p>\n      </div>\n    </div>\n  );\n}`,
        css: "",
        js: ""
      }
    ];

    if (!Array.isArray(data.variations)) {
      data.variations = [];
    }

    if (data.variations.length < 5) {
      console.warn(`AI returned ${data.variations.length} variations; filling to 5 with fallback designs.`);
      const existingTitles = new Set(data.variations.map((variation) => variation.title));
      const additions = expectedDesigns.filter((fallback) => !existingTitles.has(fallback.title));
      data.variations = [...data.variations, ...additions].slice(0, 5);
    } else if (data.variations.length > 5) {
      data.variations = data.variations.slice(0, 5);
    }

    cache.set(cacheKey, data);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Agent Pipeline Error:", error);
    
    // Improved error identification
    const errorMsg = error.message || "Unknown error";
    let userMessage = "The AI text generation failed or was truncated.";
    
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "API Quota Exceeded. Please wait a few moments and try again (or try a simpler prompt).";
    } else if (errorMsg.includes("404")) {
      userMessage = "Model not found. There may be a configuration issue with the AI model ID.";
    }
    
    return NextResponse.json({ 
      error: userMessage, 
      details: errorMsg 
    }, { status: 500 });
  }
}
