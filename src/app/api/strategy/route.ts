export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { genAI, parseGeminiJson } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { researchData, companyName, companyDescription } = await request.json() as any;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4, // 戦略は安定した出力が必要
        maxOutputTokens: 8192,
      },
    });

    const strategyPrompt = `
あなたはLLMO/GEO/AEOの世界的専門家です。

## 背景データ
### 企業情報
${JSON.stringify(researchData.company, null, 2)}

### SERP分析結果
${JSON.stringify(researchData.serpAnalysis?.slice(0, 5), null, 2)}

### AI可視性分析
${JSON.stringify(researchData.visibility, null, 2)}

## 重要な事実（これに基づいて戦略を立てること）
- ChatGPTはWikipedia(47.9%)とBing結果(87%一致)を重視する
- PerplexityはReddit(46.7%)を最も引用し、30日超のコンテンツは引用40%減
- Google AI OverviewはTOP10外から62%を引用する。extractability(抽出可能性)が最重要
- Google GeminiはMedium(28%)とYouTube(29%)を重視し、Redditは5%のみ
- 商用クエリの86%の引用はブランドが制御可能（44%自社サイト、42%リスティング）
- FAQ付きコンテンツは平均4.9回AI引用される（無しは4.4回）
- 見出し階層構造（H1>H2>H3）のコンテンツはChatGPTで3倍引用されやすい

## 目標
「${companyName}」が以下のAIプラットフォームで推奨企業として表示されること:
- Google AI Overview
- ChatGPT
- Perplexity
- Google Gemini

## 出力要件
以下を設計してください:

### 1. プラットフォーム別キーワード戦略
各プラットフォームの特性に合わせたKW選定（合計60-100KW）

### 2. コンテンツカレンダー（8週間分）
週ごとに何を公開するか、優先順位付き

### 3. 各記事のコンテンツブリーフ
- 記事タイプ（比較/ガイド/FAQ/事例/レポート）
- ターゲットKW
- 対象プラットフォーム
- CITABLE要素指定
- 配信先

### 4. エンティティ最適化計画
- Schema.orgで何を定義すべきか
- Wikipedia/Wikidata対応方針
- Google Business Profile最適化
- llms.txt設計

### 5. 配信チャネルマトリクス
各コンテンツをどのチャネルに展開するか

JSON形式で出力:
\`\`\`json
{
  "platform_strategies": {
    "chatgpt": {
      "priority_keywords": [],
      "content_tactics": [],
      "key_channels": []
    },
    "perplexity": { ... },
    "google_aio": { ... },
    "google_gemini": { ... }
  },
  "keyword_clusters": [
    {
      "cluster_name": "メインクラスター名",
      "pillar_keyword": "主要KW",
      "supporting_keywords": [],
      "longtail_keywords": [],
      "content_type": "comparison|guide|faq|case_study|report",
      "target_platforms": ["chatgpt", "perplexity"],
      "priority": 1
    }
  ],
  "content_calendar": [
    {
      "week": 1,
      "articles": [
        {
          "title_draft": "仮タイトル",
          "target_keyword": "KW",
          "content_type": "comparison",
          "target_platform": ["chatgpt", "perplexity"],
          "citable_elements": {
            "needs_comparison_table": true,
            "needs_faq": true,
            "needs_statistics": true,
            "needs_expert_quotes": true
          },
          "distribution": ["blog", "reddit_draft", "linkedin"]
        }
      ]
    }
  ],
  "entity_optimization": {
    "schema_types_needed": [],
    "wikipedia_action": "",
    "google_business_profile": "",
    "llms_txt_structure": ""
  },
  "distribution_matrix": {
    "blog": { "frequency": "weekly", "priority": "highest" },
    "reddit": { "frequency": "2x/week", "strategy": "" },
    "linkedin": { "frequency": "weekly", "strategy": "" },
    "medium": { "frequency": "2x/month", "strategy": "" },
    "quora": { "frequency": "weekly", "strategy": "" },
    "youtube_description": { "frequency": "monthly", "strategy": "" }
  },
  "freshness_schedule": {
    "pillar_content_refresh": "14 days",
    "supporting_content_refresh": "30 days",
    "monitoring_frequency": "weekly"
  }
}
\`\`\``;

    const result = await model.generateContent(strategyPrompt);
    const strategy = parseGeminiJson(result.response.text());

    return NextResponse.json({ strategy, generated_at: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
