import { NextResponse } from 'next/server';
import { genAI, parseGeminiJson } from '@/lib/gemini';
import { fetchSERP, checkAIOverview } from '@/lib/serper';

export async function POST(request: Request) {
  try {
    const { companyName, businessDescription, website, targetKeywords } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1) 企業分析
    const companyPrompt = `
あなたはLLMO（AI検索最適化）の専門アナリストです。

以下の企業を徹底分析し、AI検索で推薦されるための基礎情報を整理してください。

## 企業情報
- 企業名: ${companyName}
- 事業概要: ${businessDescription}
- Website: ${website || "不明"}

## 分析項目
1. **コア事業領域**: この企業の主力事業を3-5個
2. **独自の強み (UVP)**: 競合と差別化できるポイント
3. **ターゲット顧客**: 誰がこのサービスを使うか（ペルソナ3つ）
4. **競合企業**: 同領域の主要競合5-10社（可能な限り具体名）
5. **業界トレンド**: この業界で今AIが語りやすいトピック
6. **エンティティ情報**: AIが認識しやすい企業の属性
   - 設立年、所在地、代表者等（わかる範囲で）
7. **Wikidata/Wikipedia登録可能性**: この企業の注目度

以下のJSON形式で出力してください:
\`\`\`json
{
  "core_business": ["事業1", "事業2"],
  "uvp": "独自価値提案の文章",
  "target_personas": [
    {"name": "ペルソナ名", "description": "説明", "search_behavior": "AIにどう質問するか"}
  ],
  "competitors": [
    {"name": "競合名", "strengths": "強み", "weaknesses": "弱み"}
  ],
  "industry_trends": ["トレンド1", "トレンド2"],
  "entity_info": {
    "type": "Organization",
    "founding_year": "",
    "location": "",
    "known_for": []
  },
  "wikipedia_potential": "high/medium/low",
  "initial_brand_keywords": ["ブランドKW1", "ブランドKW2"]
}
\`\`\``;

    const companyResult = await model.generateContent(companyPrompt);
    const companyData = parseGeminiJson(companyResult.response.text());

    // 2) SERP分析（並列実行）
    const serpPromises = (targetKeywords || []).slice(0, 10).map(async (kw: string) => {
      try {
        const [serp, aio] = await Promise.all([
          fetchSERP(kw),
          checkAIOverview(kw),
        ]);
        return { keyword: kw, serp, aiOverview: aio };
      } catch (e) {
        return { keyword: kw, error: String(e) };
      }
    });
    const serpResults = await Promise.all(serpPromises);

    // 3) 競合のAI可視性チェック（Gemini経由でシミュレーション）
    const visibilityPrompt = `
以下のキーワードについて、AI検索で質問された場合にどの企業が言及されやすいかを分析してください。

キーワード: ${(targetKeywords || []).join(", ")}
対象企業: ${companyName}
競合: ${companyData.competitors.map((c: any) => c.name).join(", ")}

各キーワードについて、AI検索で推奨される可能性が高い順に企業をランク付けし、その理由を述べてください。

JSON形式:
\`\`\`json
{
  "keyword_visibility": [
    {
      "keyword": "KW",
      "ranking": [
        {"company": "企業名", "rank": 1, "reason": "理由", "estimated_mention_rate": 80}
      ],
      "our_position": 5,
      "gap_analysis": "何が足りないか"
    }
  ]
}
\`\`\``;

    const visibilityResult = await model.generateContent(visibilityPrompt);
    const visibility = parseGeminiJson(visibilityResult.response.text());

    return NextResponse.json({
      company: companyData,
      serpAnalysis: serpResults,
      visibility,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
