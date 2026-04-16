import { NextResponse } from 'next/server';
import { genAI } from '@/lib/gemini';

// Mocked Perplexity Monitoring
async function checkPerplexity(query: string) {
  if (!process.env.PERPLEXITY_API_KEY) return null;
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.PERPLEXITY_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar", // Real-time Web Search Model
      messages: [{ role: "user", content: query }],
    }),
  });
  const data = await response.json();
  return {
    platform: "perplexity",
    query,
    response_text: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

// Check Google AI Overview (Serper)
async function checkAIOverview(query: string) {
  if (!process.env.SERPER_API_KEY) return null;
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, gl: "jp", hl: "ja" }),
  });
  const data = await res.json();
  return {
    platform: "google_aio",
    query,
    response_text: data.aiOverview?.text || "(AI Overviewなし)",
    citations: data.aiOverview?.sources?.map((s: any) => s.link) || [],
  };
}

// Sentiment Analysis
async function analyzeMention(responseText: string, companyName: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Flash is sufficient for classification
  });

  const prompt = \`
Analyze the following AI response text:

"""\${responseText}"""

Target Company: \${companyName}

Respond in JSON ONLY:
{
  "brand_mentioned": true/false,
  "mention_position": 1-10 (0 if not mentioned),
  "mention_context": "context string",
  "sentiment": "positive/neutral/negative"
}\`;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/\`\`\`json\\n?|\`\`\`/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    return { brand_mentioned: false, sentiment: "neutral", mention_position: 0 };
  }
}

export async function POST(request: Request) {
  try {
    const { campaignId, keywords, companyName } = await request.json();

    const allResults = [];

    // Loop keywords and queries and platforms
    for (const kw of keywords.slice(0, 5)) { // Limit to 5 for safety
      const query = \`\${kw} おすすめ企業は？\`;

      const [perplexity, aio] = await Promise.all([
        checkPerplexity(query).catch(() => null),
        checkAIOverview(query).catch(() => null),
      ]);

      const results = [perplexity, aio].filter(Boolean);

      for (const result of results) {
        if (!result) continue;
        const analysis = await analyzeMention(result.response_text, companyName);
        allResults.push({ keyword: kw, ...result, ...analysis });
      }
    }

    // In Reality, insert 'allResults' to D1 'monitor_results' via 'env.DB'
    
    return NextResponse.json({
      success: true,
      total_checks: allResults.length,
      results: allResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
