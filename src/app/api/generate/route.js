import { NextResponse } from 'next/server';

const cache = new Map();

const DESIGN_PROFILES = [
  'GLASSMORPHISM',
  'BENTO GRID',
  'MINIMALIST',
  'DARK LUXURY / DARK UI',
  '3D / INTERACTIVE UI'
];

const SYSTEM_PROMPT = `
You are an expert AI UI/UX design generation system.

Your job is to generate high-quality production-ready UI COMPONENTS
based on the user's exact request.

IMPORTANT:
The user's requested component is the source of truth.

If the user asks for:
- a pricing section → ALL designs must be pricing sections
- a login page → ALL designs must be login pages
- a dashboard → ALL designs must be dashboards
- a navbar → ALL designs must be navbars
- a hero section → ALL designs must be hero sections
- a chatbot → ALL designs must be chatbot interfaces
- a profile card → ALL designs must be profile cards

NEVER replace the requested component with another component.

If the user requests:
- an entire website
- a complete application
- poetry
- mathematics
- general questions
- anything unrelated to UI design

return:

{
  "rejected": true,
  "reason": "Brief explanation",
  "suggestions": [
    "Specific UI component suggestion",
    "Specific UI component suggestion",
    "Specific UI component suggestion"
  ]
}

For valid UI requests, generate EXACTLY 5 DISTINCT DESIGN VARIATIONS.

The five visual design profiles are:

1. GLASSMORPHISM
- Glass effects
- Transparency
- Backdrop blur
- Gradients
- Futuristic premium SaaS appearance

2. BENTO GRID
- Modular card layout
- Creative grid structure
- Strong visual hierarchy
- Modern SaaS aesthetic

3. MINIMALIST
- Clean typography
- Excellent whitespace
- Simple professional appearance
- Premium through spacing and hierarchy

4. DARK LUXURY / DARK UI
- Dark backgrounds
- Subtle gradients
- Elegant typography
- Premium AI/fintech/technology appearance

5. 3D / INTERACTIVE UI
- Depth
- Hover effects
- Transformations
- Subtle animations
- Interactive elements

CRITICAL RULE:

Only the visual design should change.

The requested UI component MUST remain the same.

Example:

User:
"Create a pricing section"

Correct:

1. Glassmorphism Pricing Section
2. Bento Grid Pricing Section
3. Minimalist Pricing Section
4. Dark Luxury Pricing Section
5. 3D Interactive Pricing Section

Incorrect:

1. Pricing Section
2. Pricing Section
3. Generic Glass Card
4. Generic Bento Card
5. Generic Minimalist Card

Every design must be useful as a real production UI component.

Use Tailwind CSS classes.

Generate React components using JSX.

Do NOT use TypeScript.

Keep code reasonably concise.

Do not generate huge SVGs.

Do not include markdown code fences inside JSON strings.

Return ONLY valid JSON.

The JSON structure MUST be:

{
  "rejected": false,
  "variations": [
    {
      "id": "var_1",
      "title": "...",
      "style": "GLASSMORPHISM",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_2",
      "title": "...",
      "style": "BENTO GRID",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_3",
      "title": "...",
      "style": "MINIMALIST",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_4",
      "title": "...",
      "style": "DARK LUXURY / DARK UI",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    },
    {
      "id": "var_5",
      "title": "...",
      "style": "3D / INTERACTIVE UI",
      "html": "...",
      "reactCode": "...",
      "css": "",
      "js": ""
    }
  ]
}

NEVER return unrelated fallback components.
`;


/**
 * Call OpenRouter.
 */
async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_SITE_URL ||
          'https://agenticui-ten.vercel.app',
        'X-Title': 'AgenticUI'
      },
      body: JSON.stringify({
        model: 'openrouter/free',

        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],

        temperature: 0.7,

        max_tokens: 20000,

        
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('OpenRouter API Error:', data);

    throw new Error(
      data?.error?.message ||
      `OpenRouter request failed with status ${response.status}`
    );
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return content;
}


/**
 * Clean AI response.
 */
function cleanJson(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}


/**
 * Parse AI JSON.
 */
function parseJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('AI returned an empty response.');
  }

  let cleaned = text.trim();

  // Remove markdown code fences
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // First attempt
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.log('Direct JSON parse failed. Trying extraction...');
  }

  // Find the outer JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1) {
    const extracted = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(extracted);
    } catch (error) {
      console.log(
        'JSON extraction failed. Trying cleanup...'
      );
    }
  }

  // Try removing common model-added text
  const jsonMatch = cleaned.match(
    /\{[\s\S]*\}/
  );

  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.log(
        'Final JSON parsing attempt failed.'
      );
    }
  }

  console.error(
    'RAW AI RESPONSE:',
    cleaned
  );

  throw new Error(
    'AI returned invalid JSON.'
  );
}


/**
 * Validate generated variations.
 */
function validateVariations(data) {
  if (!data) {
    return null;
  }

  if (data.rejected === true) {
    return data;
  }

  if (!Array.isArray(data.variations)) {
    return null;
  }

  const valid = data.variations.filter(
    (variation) =>
      variation &&
      variation.title &&
      variation.reactCode &&
      variation.html
  );

  if (valid.length !== 5) {
    return null;
  }

  return {
    rejected: false,
    variations: valid.slice(0, 5)
  };
}


/**
 * Generate UI designs.
 */
async function generateDesigns(prompt) {
  const responseText = await callOpenRouter(`
USER REQUEST:

${prompt}

Generate exactly five UI design variations.

Remember:
- Same requested component in all five variations.
- Different visual design for each variation.
- Use the five required design profiles.
- Return ONLY JSON.
`);

  const data = parseJson(responseText);

  const validated = validateVariations(data);

  if (!validated) {
    throw new Error(
      'AI did not return exactly 5 valid UI designs.'
    );
  }

  return validated;
}


export async function POST(req) {
  try {
    const body = await req.json();

    const prompt = body?.prompt;

    if (
      !prompt ||
      typeof prompt !== 'string' ||
      !prompt.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid UI design prompt.'
        },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();

    const cacheKey =
      cleanPrompt.toLowerCase();

    /**
     * Return cached result.
     */
    if (cache.has(cacheKey)) {
      console.log(
        'Serving cached design...'
      );

      return NextResponse.json(
        cache.get(cacheKey)
      );
    }

    /**
     * Generate designs.
     */
    const result =
      await generateDesigns(cleanPrompt);

    /**
     * Cache successful result.
     */
    cache.set(
      cacheKey,
      result
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error(
      'AgenticUI Generation Error:',
      error
    );

    const message =
      error?.message ||
      'Unknown AI generation error.';

    let userMessage =
      'AI generation failed. Please try again.';

    if (
      message.includes(
        'OPENROUTER_API_KEY'
      )
    ) {
      userMessage =
        'OpenRouter API key is missing. Please configure OPENROUTER_API_KEY.';
    }

    if (
      message.includes(
        'quota'
      ) ||
      message.includes(
        'rate'
      )
    ) {
      userMessage =
        'The free AI model is temporarily rate-limited. Please try again shortly.';
    }

    if (
      message.includes(
        'invalid'
      ) &&
      message.includes(
        'JSON'
      )
    ) {
      userMessage =
        'The AI returned an invalid design response. Please try again.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: message
      },
      {
        status: 500
      }
    );
  }
}