import { NextResponse } from "next/server";

const cache = new Map();

/*
 * IMPORTANT:
 * We generate ONE design per AI request.
 *
 * This avoids the previous problem where one free model
 * had to generate 5 complete components in one huge JSON.
 */
const DESIGN_STYLES = [
  {
    key: "GLASSMORPHISM",

    personality:
      "Elegant, futuristic, atmospheric and luminous.",

    instruction: `
Create a sophisticated glassmorphism interface.

VISUAL LANGUAGE:
- layered translucent surfaces
- backdrop blur
- subtle 1px borders
- soft ambient gradients
- controlled cyan, violet or blue accent lighting
- depth created through overlapping surfaces
- refined shadows rather than heavy shadows
- subtle inner highlights
- dark or soft neutral background depending on the component

COMPOSITION:
- create clear foreground and background layers
- use depth to establish hierarchy
- keep the primary action visually dominant
- use floating elements where appropriate
- avoid turning every element into a glass card

IMPORTANT:
Glassmorphism should feel intentional and premium,
not like random transparent boxes.

Avoid excessive blur.
Avoid excessive glow.
Avoid making every section identical.
`,
  },

  {
    key: "BENTO GRID",

    personality:
      "Editorial, modular, expressive and information-rich.",

    instruction: `
Create a sophisticated bento-grid interface inspired by
modern premium product websites.

VISUAL LANGUAGE:
- asymmetric grid
- varied card sizes
- strong visual hierarchy
- large feature areas
- compact supporting cards
- intentional empty space
- subtle borders
- restrained shadows
- rounded but not excessively rounded containers

COMPOSITION:
- do NOT use a simple equal 3-column card grid
- combine large and small content blocks
- create one dominant visual focal point
- use different content densities
- allow important information to occupy more space

IMPORTANT:
The layout must feel deliberately art-directed.

Do not simply place normal cards inside a CSS grid.
`,
  },

  {
    key: "MINIMALIST",

    personality:
      "Precise, calm, refined, editorial and typography-focused.",

    instruction: `
Create a high-end minimalist interface.

VISUAL LANGUAGE:
- generous whitespace
- typography-first hierarchy
- restrained neutral palette
- one carefully selected accent color
- thin borders
- subtle separators
- almost no unnecessary shadows
- clean geometric alignment
- strong baseline rhythm

COMPOSITION:
- prioritize typography and spacing
- create clear visual hierarchy without decoration
- use whitespace as a design element
- make important information immediately scannable
- avoid excessive cards

IMPORTANT:
The design should feel expensive because of its
precision, not because of visual effects.

Think Linear, Stripe, Apple and premium editorial design.
Do not copy their layouts.
`,
  },

  {
    key: "DARK LUXURY / DARK UI",

    personality:
      "Exclusive, dramatic, sophisticated and highly refined.",

    instruction: `
Create a premium dark luxury interface.

VISUAL LANGUAGE:
- near-black or deep charcoal background
- layered dark surfaces
- sophisticated contrast
- muted metallic or electric accent
- subtle gradients
- refined shadows
- restrained highlights
- premium typography

COMPOSITION:
- establish a dramatic focal point
- use contrast to guide attention
- combine large typography with compact supporting content
- use accent color sparingly
- create depth through tonal differences

IMPORTANT:
Do NOT make the design look like a generic developer dashboard.

Avoid excessive neon.
Avoid rainbow gradients.
Avoid excessive glowing borders.

The result should feel like a premium enterprise SaaS
or luxury technology product.
`,
  },

  {
    key: "3D / INTERACTIVE UI",

    personality:
      "Immersive, dimensional, futuristic and playful.",

    instruction: `
Create a sophisticated 3D-inspired interactive interface.

VISUAL LANGUAGE:
- layered depth
- perspective
- floating surfaces
- dimensional shadows
- subtle rotations
- depth-aware spacing
- gradient lighting
- interactive hover states

INTERACTION:
- cards can subtly lift on hover
- buttons can respond to hover
- important elements may use transform and perspective
- use CSS transitions
- interactions must remain smooth and subtle

COMPOSITION:
- create a strong foreground object
- place secondary information behind or around it
- use depth to establish hierarchy
- create a sense of physical space

IMPORTANT:
Do NOT use external 3D libraries.

Do NOT create complicated WebGL.

Use CSS transforms, gradients, shadows and perspective.

The result should feel interactive without becoming a gimmick.
`,
  },
];


/*
 * Cache generated results during the lifetime of the server.
 */



/*
 * Main system instructions.
 *
 * Notice that we generate only ONE component per call.
 */
const BASE_SYSTEM_PROMPT = `
You are Brahmastra Design — an elite UI/UX designer,
design-system architect and React frontend engineer.

Your job is to transform the user's UI request into
ONE exceptionally polished production-quality interface.

==================================================
CORE OBJECTIVE
==================================================

The result must look intentionally designed by a
professional product designer.

Do NOT produce a generic AI-generated UI template.

The design must have:

- strong visual hierarchy
- intentional composition
- excellent typography
- consistent spacing
- meaningful contrast
- realistic content
- polished controls
- responsive behavior
- refined micro-interactions
- professional information density
- clear primary and secondary actions

==================================================
DESIGN THINKING
==================================================

Before writing the code, internally determine:

1. What is the primary purpose of this component?
2. What should the user notice first?
3. What is the primary action?
4. What information is secondary?
5. How should the content be grouped?
6. How should the layout behave on mobile?
7. Which visual elements create hierarchy?

Do NOT expose this reasoning.

Only return the final JSON.

==================================================
COMPOSITION
==================================================

Composition is more important than decoration.

Do NOT simply create:

heading
subtitle
three cards
button

unless that structure genuinely fits the requested component.

Use appropriate composition such as:

- asymmetric layouts
- split layouts
- feature-focused layouts
- editorial layouts
- dashboard grids
- layered sections
- floating elements
- comparison layouts
- timelines
- feature matrices
- visual focal points

The composition must match the requested component.

==================================================
VISUAL HIERARCHY
==================================================

Every design must clearly distinguish:

PRIMARY:
The most important content/action.

SECONDARY:
Supporting information.

TERTIARY:
Details that should remain visually quieter.

Use:

- scale
- spacing
- contrast
- typography
- position
- borders
- shadows
- color

to create hierarchy.

==================================================
TYPOGRAPHY
==================================================

Use typography intentionally.

Recommended hierarchy:

- large display heading
- supporting description
- section labels
- card headings
- body text
- metadata

Avoid making everything large and bold.

Avoid excessive uppercase text.

Avoid random font-size changes.

==================================================
SPACING
==================================================

Use a consistent spacing rhythm.

Prefer generous spacing between major sections.

Use tighter spacing inside related groups.

Do not fill every available pixel.

Whitespace should be intentional.

==================================================
COLOR
==================================================

Use a controlled palette.

Prefer:

- one primary accent
- one secondary accent when useful
- neutral background
- neutral surfaces
- semantic colors only when needed

Avoid:

- rainbow gradients
- excessive neon
- random colors
- too many accent colors
- low-contrast text

==================================================
INTERACTION
==================================================

Add subtle interactions when appropriate:

- hover elevation
- border transitions
- opacity changes
- scale transforms
- button feedback
- tab transitions
- focus states

Animations should be subtle and fast.

Do not make the interface distracting.

==================================================
RESPONSIVENESS
==================================================

Desktop:
Use the available width intelligently.

Tablet:
Reduce spacing and simplify multi-column layouts.

Mobile:
Stack content logically.

Never allow:

- horizontal overflow
- clipped text
- tiny buttons
- unreadable tables
- broken grids

Use Tailwind responsive utilities.

==================================================
TECHNOLOGY
==================================================

Use:

- React JSX
- Tailwind CSS
- semantic HTML
- small custom CSS only when necessary
- small JavaScript interactions only when necessary

The HTML must work with:

<script src="https://cdn.tailwindcss.com"></script>

The React component must be standalone JSX.

==================================================
DO NOT USE
==================================================

- TypeScript
- Material UI
- Bootstrap
- external UI libraries
- external image dependencies
- huge SVG illustrations
- huge mock datasets
- fake framework imports
- Next.js imports
- unnecessary comments
- excessive code

==================================================
ANTI-GENERIC RULE
==================================================

Do NOT create five variations that are simply the
same layout with different colors.

Each design will receive a different visual direction.

The requested functionality must remain identical,
but the:

- composition
- hierarchy
- spacing
- visual treatment
- card arrangement
- typography treatment
- interaction pattern

should meaningfully reflect the requested design style.

==================================================
COMPONENT FIDELITY
==================================================

The user's requested component is the source of truth.

If the user requests:

pricing section → create pricing section.

dashboard → create dashboard.

login page → create login page.

navbar → create navbar.

product card → create product card.

Do NOT replace the requested component with another component.

==================================================
CODE QUALITY
==================================================

Write clean, readable JSX.

Use semantic elements.

Use reusable structures where appropriate.

Keep the implementation reasonably compact.

Do not generate unnecessary code.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Do not add explanations outside the JSON.

The JSON must contain:

{
  "title": "...",
  "style": "...",
  "html": "...",
  "reactCode": "...",
  "css": "...",
  "js": "..."
}
`;


const OPENROUTER_MODEL_CANDIDATES = [
  process.env.OPENROUTER_MODEL,
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
  "anthropic/claude-3.5-haiku",
].filter(Boolean);

function extractMessageContent(data) {
  if (!data) return "";

  const choice = data?.choices?.[0];
  const message = choice?.message || {};
  const contentCandidates = [
    message.content,
    choice?.text,
    choice?.content,
    message?.content?.[0]?.text,
  ];

  for (const candidate of contentCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (Array.isArray(candidate)) {
      const text = candidate
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item.text === "string") return item.text;
          if (item && typeof item.content === "string") return item.content;
          return "";
        })
        .join("\n")
        .trim();

      if (text) return text;
    }

    if (candidate && typeof candidate === "object") {
      if (typeof candidate.text === "string" && candidate.text.trim()) {
        return candidate.text.trim();
      }
      if (typeof candidate.value === "string" && candidate.value.trim()) {
        return candidate.value.trim();
      }
    }
  }

  return "";
}

/*
 * Call OpenRouter for ONE design.
 */
async function generateSingleDesign(
  userPrompt,
  style,
  retry = false
) {
  const apiKey =
    process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const retryInstruction = retry
    ? `
IMPORTANT RETRY:

Your previous response was invalid.

Return ONLY valid JSON.

Make the component shorter.
Do not omit any required JSON fields.
Do not include markdown or code fences.
`
    : "";

  const prompt = `
USER REQUEST:

${userPrompt}

DESIGN QUALITY REQUIREMENT:

Treat this request as if you are designing a component
for a premium production SaaS product.

Do not create a generic template.

Preserve every functional requirement from the user.

Prioritize visual hierarchy, composition, spacing,
typography and interaction quality.

DESIGN STYLE:

${style.key}

DESIGN PERSONALITY:

${style.personality}

STYLE REQUIREMENTS:

${style.instruction}

Create ONE complete version of the requested component
using this design style.

The output must contain:

1. title
2. style
3. html
4. reactCode
5. css
6. js

The HTML must be directly renderable inside a browser
with Tailwind CDN.

The React code must be valid JSX.

CSS should contain only additional CSS that Tailwind
cannot easily provide.

JS should contain only small interaction logic if needed.

If no JavaScript is required, return an empty string.

${retryInstruction}
`;

  const lastModel = OPENROUTER_MODEL_CANDIDATES.at(-1);
  let lastError = null;

  for (const model of OPENROUTER_MODEL_CANDIDATES) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",

            "HTTP-Referer":
              process.env.NEXT_PUBLIC_SITE_URL ||
              "https://agenticui-ten.vercel.app",

            "X-Title":
              "Brahmastra Design",
          },

          body: JSON.stringify({
            model,

            messages: [
              {
                role: "system",
                content:
                  BASE_SYSTEM_PROMPT,
              },

              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.75,

            max_tokens: 6000,

            response_format: {
              type: "json_object",
            },
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        lastError = new Error(
          "OpenRouter returned an unreadable response."
        );
        continue;
      }

      if (!response.ok) {
        const message =
          data?.error?.message ||
          `OpenRouter request failed with status ${response.status}.`;

        lastError = new Error(message);

        if (
          response.status === 400 ||
          response.status === 404 ||
          response.status === 422
        ) {
          console.warn(
            `OpenRouter model ${model} rejected the request:`,
            message
          );
          continue;
        }

        throw lastError;
      }

      if (data?.error) {
        lastError = new Error(
          data.error.message ||
            "OpenRouter returned an API error."
        );
        continue;
      }

      const content = extractMessageContent(data);

      if (!content) {
        lastError = new Error(
          "AI returned an empty response."
        );
        console.warn(
          `OpenRouter model ${model} returned an empty response.`
        );
        continue;
      }

      return content;
    } catch (error) {
      lastError = error;

      if (model !== lastModel) {
        console.warn(
          `Falling back from ${model} after error:`,
          error.message
        );
        continue;
      }

      break;
    }
  }

  throw new Error(
    lastError?.message ||
      "AI returned an empty response."
  );
}


/*
 * Safely parse AI JSON.
 *
 * Handles:
 * - normal JSON
 * - accidental markdown fences
 * - extra text before/after JSON
 */
function parseJSON(text) {
  if (
    !text ||
    typeof text !== "string"
  ) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  let cleaned =
    text.trim();

  /*
   * Remove markdown fences if a model
   * accidentally adds them.
   */
  cleaned =
    cleaned
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

  /*
   * First attempt.
   */
  try {
    return JSON.parse(
      cleaned
    );
  } catch {
    // Continue.
  }

  /*
   * Attempt to find the outer JSON object.
   */
  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start !== -1 &&
    end !== -1 &&
    end > start
  ) {
    const extracted =
      cleaned.slice(
        start,
        end + 1
      );

    try {
      return JSON.parse(
        extracted
      );
    } catch {
      // Continue.
    }
  }

  console.error(
    "========== INVALID AI JSON =========="
  );

  console.error(
    cleaned
  );

  console.error(
    "======================================"
  );

  throw new Error(
    "AI returned invalid JSON."
  );
}


/*
 * Validate ONE generated design.
 */
function validateDesign(
  data,
  style
) {
  if (!data) {
    throw new Error(
      "AI returned no design."
    );
  }

  if (
    typeof data.title !==
    "string"
  ) {
    throw new Error(
      "Generated design is missing a title."
    );
  }

  if (
    typeof data.html !==
    "string" ||
    data.html.trim().length < 20
  ) {
    throw new Error(
      "Generated design contains invalid HTML."
    );
  }

  if (
    typeof data.reactCode !==
    "string" ||
    data.reactCode.trim().length < 20
  ) {
    throw new Error(
      "Generated design contains invalid React code."
    );
  }

  if (
    typeof data.css !==
    "string"
  ) {
    data.css = "";
  }

  if (
    typeof data.js !==
    "string"
  ) {
    data.js = "";
  }

  return {
    id:
      `var_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    title:
      data.title.trim(),

    style:
      style.key,

    html:
      data.html.trim(),

    reactCode:
      data.reactCode.trim(),

    css:
      data.css.trim(),

    js:
      data.js.trim(),
  };
}


/*
 * Generate ONE style with one retry.
 */
async function generateWithRetry(
  userPrompt,
  style
) {
  let lastError =
    null;

  for (
    let attempt = 1;
    attempt <= 2;
    attempt++
  ) {
    try {
      console.log(
        `Generating ${style.key} - attempt ${attempt}/2`
      );

      const raw =
        await generateSingleDesign(
          userPrompt,
          style,
          attempt === 2
        );

      const parsed =
        parseJSON(raw);

      return validateDesign(
        parsed,
        style
      );

    } catch (error) {
      lastError =
        error;

      console.error(
        `${style.key} failed:`,
        error.message
      );

      const message =
        String(
          error?.message || ""
        ).toLowerCase();

      /*
       * Don't retry errors that won't
       * be fixed by another generation.
       */
      const permanent =
        message.includes(
          "api key"
        ) ||
        message.includes(
          "unauthorized"
        ) ||
        message.includes(
          "authentication"
        ) ||
        message.includes(
          "quota"
        ) ||
        message.includes(
          "rate limit"
        ) ||
        message.includes(
          "too many requests"
        );

      if (
        permanent ||
        attempt === 2
      ) {
        break;
      }

      /*
       * Small delay before retry.
       */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            800
          )
      );
    }
  }

  throw (
    lastError ||
    new Error(
      `Failed to generate ${style.key}.`
    )
  );
}


/*
 * Generate all five designs.
 *
 * We intentionally run them sequentially.
 *
 * Why?
 *
 * The OpenRouter free plan currently has request
 * limits. Sending five requests simultaneously can
 * make rate-limit problems more likely.
 */
async function generateAllDesigns(
  userPrompt
) {
  const variations =
    [];

  for (
    const style of DESIGN_STYLES
  ) {
    const design =
      await generateWithRetry(
        userPrompt,
        style
      );

    variations.push(
      design
    );
  }

  return {
    rejected: false,

    variations,
  };
}


/*
 * POST /api/generate
 */
export async function POST(
  req
) {
  try {
    const body =
      await req.json();

    const prompt =
      body?.prompt;

    /*
     * Validate prompt.
     */
    if (
      typeof prompt !==
        "string" ||
      !prompt.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a UI design request.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanPrompt =
      prompt.trim();

    /*
     * Prevent extremely large prompts.
     */
    if (
      cleanPrompt.length >
      4000
    ) {
      return NextResponse.json(
        {
          error:
            "Please keep your UI request under 4000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Cache key.
     */
    const cacheKey =
      cleanPrompt
        .toLowerCase()
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    /*
     * Return cached result.
     */
    if (
      cache.has(
        cacheKey
      )
    ) {
      console.log(
        "Returning cached designs."
      );

      return NextResponse.json(
        cache.get(
          cacheKey
        )
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "BRAHMASTRA UI GENERATION"
    );

    console.log(
      "Prompt:",
      cleanPrompt
    );

    console.log(
      "Generating 5 independent designs..."
    );

    console.log(
      "========================================"
    );

    /*
     * Generate the five designs.
     */
    const result =
      await generateAllDesigns(
        cleanPrompt
      );

    /*
     * Cache successful generation.
     */
    cache.set(
      cacheKey,
      result
    );

    return NextResponse.json(
      result
    );

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "BRAHMASTRA GENERATION ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    const message =
      error?.message ||
      "Unknown error.";

    const lower =
      message.toLowerCase();

    let userMessage =
      "AI generation failed. Please try again.";

    /*
     * API key error.
     */
    if (
      lower.includes(
        "openrouter_api_key"
      ) ||
      lower.includes(
        "api key"
      )
    ) {
      userMessage =
        "OpenRouter API key is missing or invalid.";
    }

    /*
     * Authentication.
     */
    else if (
      lower.includes(
        "unauthorized"
      ) ||
      lower.includes(
        "authentication"
      )
    ) {
      userMessage =
        "OpenRouter authentication failed. Check your API key.";
    }

    /*
     * Rate limit.
     */
    else if (
      lower.includes(
        "rate limit"
      ) ||
      lower.includes(
        "rate_limit"
      ) ||
      lower.includes(
        "too many requests"
      )
    ) {
      userMessage =
        "The free AI service is temporarily rate-limited. Please try again later.";
    }

    /*
     * Quota.
     */
    else if (
      lower.includes(
        "quota"
      )
    ) {
      userMessage =
        "The free AI usage limit has been reached.";
    }

    /*
     * JSON problems.
     */
    else if (
      lower.includes(
        "invalid json"
      ) ||
      lower.includes(
        "invalid response"
      )
    ) {
      userMessage =
        "One of the AI designs returned an invalid response. Please try again.";
    }

    /*
     * Design generation failure.
     */
    else if (
      lower.includes(
        "generated design"
      ) ||
      lower.includes(
        "failed to generate"
      )
    ) {
      userMessage =
        "One of the five design variations could not be generated. Please try again.";
    }

    return NextResponse.json(
      {
        error:
          userMessage,

        /*
         * Detailed error is available
         * only during local development.
         */
        details:
          process.env.NODE_ENV ===
          "development"
            ? message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}