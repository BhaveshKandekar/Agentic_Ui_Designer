import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const cache = new Map();

const DESIGN_PROFILES = [
  'GLASSMORPHISM',
  'BENTO GRID',
  'MINIMALIST',
  'DARK LUXURY / DARK UI',
  '3D / INTERACTIVE UI'
];

const SYSTEM_PROMPT = `
You are an expert Multi-Agent AI UI Design Generation System.

Your job is to generate HIGH-QUALITY UI COMPONENTS based on the user's exact request.

IMPORTANT:
The user's requested component is the source of truth.

If the user asks for:
- a pricing section → ALL 5 designs must be pricing sections
- a login page → ALL 5 designs must be login pages
- a dashboard → ALL 5 designs must be dashboards
- a navbar → ALL 5 designs must be navbars
- a hero section → ALL 5 designs must be hero sections
- a chatbot → ALL 5 designs must be chatbot interfaces

NEVER replace the requested component with another component.

If the user asks for an entire website, full application, or a non-UI request,
reject the request.

For a valid UI request, generate EXACTLY 5 DISTINCT DESIGN VARIATIONS.

The five variations MUST use these visual profiles:

1. GLASSMORPHISM
   - Glass cards
   - Blur
   - Transparency
   - Gradients
   - Futuristic premium SaaS appearance

2. BENTO GRID
   - Modular rectangular layout
   - Strong visual hierarchy
   - Modern dashboard/SaaS aesthetic
   - Creative card arrangement

3. MINIMALIST
   - Clean typography
   - Excellent whitespace
   - Minimal decoration
   - Professional premium appearance

4. DARK LUXURY / DARK UI
   - Dark background
   - Subtle gradients
   - Elegant typography
   - Premium fintech/AI/technology appearance

5. 3D / INTERACTIVE UI
   - Depth
   - Hover effects
   - Transformations
   - Subtle animations
   - Interactive visual details

CRITICAL:
Only the visual style should change between variations.
The requested UI component and its functionality must remain consistent.

For example, if the user asks for a pricing section:

CORRECT:
1. Glassmorphism pricing section
2. Bento pricing section
3. Minimalist pricing section
4. Dark luxury pricing section
5. 3D interactive pricing section

INCORRECT:
1. Pricing section
2. Pricing section
3. Generic glass card
4. Generic bento card
5. Generic minimalist card

Every variation must be useful as a real production UI component.

Keep the generated code concise.
Do not generate huge SVGs.
Do not generate unnecessary paragraphs.
Do not include markdown code fences inside JSON strings.

Return EXACTLY this JSON structure:

{
  "rejected": false,
  "variations": [
    {
      "id": "var_1",
      "title": "Glassmorphism ...",
      "style": "GLASSMORPHISM",
      "html": "Pure HTML using Tailwind CSS classes",
      "reactCode": "Functional React component using Tailwind CSS",
      "css": "Minimal custom CSS or empty string",
      "js": "Optional JavaScript or empty string"
    },
    {
      "id": "var_2",
      "title": "Bento ...",
      "style": "BENTO GRID",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_3",
      "title": "Minimalist ...",
      "style": "MINIMALIST",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_4",
      "title": "Dark Luxury ...",
      "style": "DARK LUXURY / DARK UI",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_5",
      "title": "3D Interactive ...",
      "style": "3D / INTERACTIVE UI",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    }
  ]
}

DO NOT return fewer than 5 variations unless the request is rejected.
DO NOT return unrelated fallback components.
`;


/**
 * Extract text from Gemini response.
 */
function extractResponseText(response) {
  if (!response) return '';

  if (typeof response.text === 'function') {
    try {
      return response.text();
    } catch (e) {
      // Continue with fallback extraction
    }
  }

  if (typeof response.text === 'string') {
    return response.text;
  }

  if (
    response.candidates &&
    response.candidates[0]?.content?.parts?.[0]?.text
  ) {
    return response.candidates[0].content.parts[0].text;
  }

  return '';
}


/**
 * Clean JSON returned by Gemini.
 */
function cleanJsonText(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}


/**
 * Parse Gemini JSON.
 */
function parseGeminiJson(rawText) {
  if (!rawText) {
    throw new Error('Empty response from AI');
  }

  const cleaned = cleanJsonText(rawText);

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error(
      'JSON Parse Error. Response length:',
      cleaned.length
    );

    // Attempt basic repair.
    let fixedText = cleaned;

    // Remove trailing backslash.
    if (fixedText.endsWith('\\')) {
      fixedText = fixedText.slice(0, -1);
    }

    // Remove trailing comma.
    fixedText = fixedText.replace(/,\s*([}\]])\s*$/, '$1');

    // Balance brackets/braces.
    const stack = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < fixedText.length; i++) {
      const char = fixedText[i];

      if (char === '"' && !escaped) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') {
            stack.pop();
          }
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') {
            stack.pop();
          }
        }
      }

      escaped = char === '\\' && !escaped;
    }

    while (stack.length > 0) {
      const open = stack.pop();
      fixedText += open === '{' ? '}' : ']';
    }

    try {
      return JSON.parse(fixedText);
    } catch (repairError) {
      console.error(
        'JSON repair failed:',
        repairError.message
      );

      throw parseError;
    }
  }
}


/**
 * Generate designs using Gemini.
 */
async function generateWithGemini(
  ai,
  modelName,
  userPrompt,
  additionalInstruction = ''
) {
  const generationPrompt = `
USER REQUEST:
${userPrompt}

${additionalInstruction}

Generate the requested UI component now.

Remember:
- Generate exactly 5 distinct visual variations.
- Every variation must represent the SAME component requested by the user.
- Only the design style should change.
- Do not substitute generic cards or unrelated components.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: generationPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      maxOutputTokens: 20000
    }
  });

  const rawText = extractResponseText(response);

  return parseGeminiJson(rawText);
}


/**
 * Validate generated variations.
 */
function validateVariations(data) {
  if (!data || data.rejected === true) {
    return {
      valid: false,
      rejected: true,
      variations: []
    };
  }

  if (!Array.isArray(data.variations)) {
    return {
      valid: false,
      rejected: false,
      variations: []
    };
  }

  const validVariations = data.variations
    .filter((variation) => {
      return (
        variation &&
        typeof variation === 'object' &&
        variation.title &&
        variation.reactCode
      );
    })
    .slice(0, 5);

  return {
    valid: validVariations.length === 5,
    rejected: false,
    variations: validVariations
  };
}


/**
 * Generate missing designs if Gemini did not return all five.
 */
async function generateMissingDesigns(
  ai,
  modelName,
  userPrompt,
  existingVariations
) {
  const existingStyles = existingVariations
    .map((variation) => variation.style)
    .filter(Boolean);

  const missingStyles = DESIGN_PROFILES.filter(
    (style) => !existingStyles.includes(style)
  );

  if (missingStyles.length === 0) {
    return existingVariations;
  }

  const missingStylesText = missingStyles
    .map((style, index) => `${index + 1}. ${style}`)
    .join('\n');

  const completionPrompt = `
The previous AI generation did not successfully produce all five designs.

USER REQUEST:
${userPrompt}

ALREADY GENERATED:
${existingVariations
  .map(
    (variation, index) =>
      `${index + 1}. ${variation.title} (${variation.style || 'unknown style'})`
  )
  .join('\n')}

MISSING DESIGN STYLES:
${missingStylesText}

Generate ONLY the missing design variations.

CRITICAL:
Every missing design must be the SAME UI COMPONENT requested by the user.

For example:
If the user requested a pricing section, generate missing pricing sections.
Do NOT generate generic cards.

Return this JSON structure:

{
  "variations": [
    {
      "id": "missing_1",
      "title": "...",
      "style": "...",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    }
  ]
}

Generate exactly ${missingStyles.length} missing variations.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: completionPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      maxOutputTokens: 16000
    }
  });

  const rawText = extractResponseText(response);
  const data = parseGeminiJson(rawText);

  const additions = Array.isArray(data.variations)
    ? data.variations
    : [];

  return [...existingVariations, ...additions].slice(0, 5);
}


export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        {
          error: 'Please provide a valid UI design prompt.'
        },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      return NextResponse.json(
        {
          error: 'Please enter a UI design prompt.'
        },
        { status: 400 }
      );
    }

    const cacheKey = cleanPrompt.toLowerCase();

    /**
     * Cache
     */
    if (cache.has(cacheKey)) {
      console.log('Serving from cache...');
      return NextResponse.json(cache.get(cacheKey));
    }

    /**
     * Mock mode for local development.
     *
     * IMPORTANT:
     * If you want real AI generation, GEMINI_API_KEY must be configured.
     */
    if (!process.env.GEMINI_API_KEY) {
      console.log(
        'No GEMINI_API_KEY found. Running mock mode.'
      );

      return NextResponse.json({
        rejected: false,
        variations: [
          {
            id: 'mock_1',
            title: 'Mock Glassmorphism',
            style: 'GLASSMORPHISM',
            html: '<div class="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">Glassmorphism Preview</div>',
            reactCode: `export default function Component() {
  return (
    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
      Glassmorphism Preview
    </div>
  );
}`,
            css: '',
            js: ''
          },
          {
            id: 'mock_2',
            title: 'Mock Bento Grid',
            style: 'BENTO GRID',
            html: '<div class="grid grid-cols-2 gap-4">Bento Grid Preview</div>',
            reactCode: `export default function Component() {
  return (
    <div className="grid grid-cols-2 gap-4">
      Bento Grid Preview
    </div>
  );
}`,
            css: '',
            js: ''
          },
          {
            id: 'mock_3',
            title: 'Mock Minimalist',
            style: 'MINIMALIST',
            html: '<div class="p-8 border rounded-xl">Minimalist Preview</div>',
            reactCode: `export default function Component() {
  return (
    <div className="p-8 border rounded-xl">
      Minimalist Preview
    </div>
  );
}`,
            css: '',
            js: ''
          },
          {
            id: 'mock_4',
            title: 'Mock Dark Luxury',
            style: 'DARK LUXURY / DARK UI',
            html: '<div class="p-8 bg-zinc-950 text-white rounded-xl">Dark Luxury Preview</div>',
            reactCode: `export default function Component() {
  return (
    <div className="p-8 bg-zinc-950 text-white rounded-xl">
      Dark Luxury Preview
    </div>
  );
}`,
            css: '',
            js: ''
          },
          {
            id: 'mock_5',
            title: 'Mock 3D Interactive',
            style: '3D / INTERACTIVE UI',
            html: '<div class="p-8 rounded-xl shadow-2xl hover:scale-105 transition-transform">3D Preview</div>',
            reactCode: `export default function Component() {
  return (
    <div className="p-8 rounded-xl shadow-2xl hover:scale-105 transition-transform">
      3D Preview
    </div>
  );
}`,
            css: '',
            js: ''
          }
        ]
      });
    }

    /**
     * Initialize Gemini.
     */
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const modelsToTry = [
      'gemini-2.5-flash'
    ];

    let finalData = null;
    let lastError = null;

    /**
     * Try multiple Gemini models.
     */
    for (const modelName of modelsToTry) {
      try {
        console.log(
          `Attempting generation with model: ${modelName}`
        );

        /**
         * First generation.
         */
        const firstData = await generateWithGemini(
          ai,
          modelName,
          cleanPrompt
        );

        const validated = validateVariations(firstData);

        /**
         * Rejected request.
         */
        if (firstData.rejected === true) {
          finalData = firstData;
          lastError = null;
          break;
        }

        let variations = validated.variations;

        console.log(
          `First generation returned ${variations.length} variations.`
        );

        /**
         * If fewer than five designs were returned,
         * ask Gemini to generate the missing ones.
         */
        if (variations.length < 5) {
          console.log(
            `Generating ${5 - variations.length} missing variations...`
          );

          try {
            variations = await generateMissingDesigns(
              ai,
              modelName,
              cleanPrompt,
              variations
            );
          } catch (completionError) {
            console.error(
              'Missing design generation failed:',
              completionError.message
            );
          }
        }

        /**
         * Final validation.
         */
        if (variations.length === 5) {
          finalData = {
            rejected: false,
            variations
          };

          lastError = null;
          break;
        }

        /**
         * Don't use unrelated fallback designs.
         *
         * Instead, try the next Gemini model.
         */
        throw new Error(
          `AI returned only ${variations.length}/5 valid designs.`
        );
      } catch (err) {
        console.error(
          `AI Generation with ${modelName} failed:`,
          err.message || err
        );

        lastError = err;

        /**
         * Wait before trying another model.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );
      }
    }

    /**
     * If every model failed, return an actual error.
     * We intentionally DO NOT return unrelated fallback designs.
     */
    if (!finalData) {
      throw (
        lastError ||
        new Error(
          'Unable to generate all 5 requested UI variations.'
        )
      );
    }

    /**
     * Cache successful result.
     */
    cache.set(cacheKey, finalData);

    return NextResponse.json(finalData);
  } catch (error) {
    console.error(
      'Agent Pipeline Error:',
      error
    );

    const errorMsg =
      error?.message || 'Unknown error';

    let userMessage =
      'The AI could not generate all 5 UI designs. Please try again.';

    if (
      errorMsg.includes('429') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('RESOURCE_EXHAUSTED')
    ) {
      userMessage =
        'API quota exceeded. Please wait a few moments and try again.';
    } else if (errorMsg.includes('404')) {
      userMessage =
        'The selected Gemini model could not be found. Please check the model configuration.';
    } else if (
      errorMsg.includes('API key') ||
      errorMsg.includes('API_KEY')
    ) {
      userMessage =
        'Gemini API key is missing or invalid.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: errorMsg
      },
      { status: 500 }
    );
  }
}