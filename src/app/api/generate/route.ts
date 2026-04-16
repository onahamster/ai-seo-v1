import { NextResponse } from 'next/server';
import { genAI, parseGeminiJson } from '@/lib/gemini';
import { calculateQualityScore } from '@/lib/quality-scorer';

const CITABLE_ARTICLE_PROMPT = `
あなたはLLMO/GEO最適化コンテンツの専門ライターです。
AIに引用されるためのCITABLEフレームワークに完全準拠した記事を生成します。

## CITABLEフレームワーク（厳守）

### C - Clear entity & structure
- 冒頭2-3文で「\${companyName}」を明示し、核心的な回答を述べる
- 曖昧な導入文は絶対に書かない

### I - Intent architecture
- メイン質問 + 3-5個の「次に聞かれるであろう」質問にも回答する
- 各セクションが独立した「答え」として機能するようにする

### T - Third-party validation
- 業界データ、公的統計、第三者評価を引用する

### A - Answer grounding
- すべての事実に出典URLまたは出典名を明示する

### B - Block-structured for RAG
- 200-400語のセクションに分割
- H2/H3見出し（質問形式を優先）
- 比較テーブルを必ず1つ以上含める
- FAQ形式セクションを散りばめる
- 箇条書き・番号リストを積極活用

### L - Latest & consistent
- 「Updated: \${currentDate}」を冒頭に含める

### E - Entity graph & schema
- 企業名・サービス名を明確なエンティティとして記述

## 追加の最適化ルール
- Passage-Level Optimization: 各段落が独立して理解できること。
- プラットフォーム別最適化: \${targetPlatforms} 向けに最適化。
- 自然さの担保: 企業名のスタッフィングはせず自然な日本語で。

## 出力フォーマット
\`\`\`json
{
  "title": "SEOタイトル（32文字以内 日本語）",
  "meta_description": "メタディスクリプション（120文字以内 日本語）",
  "slug": "url-friendly-slug",
  "bluf_statement": "冒頭のBLUF文（2-3文）",
  "content_markdown": "【完全な記事本文 Markdown】",
  "word_count": 3000,
  "entity_mentions": 8,
  "faq_count": 5,
  "comparison_tables": 1,
  "citations_count": 10,
  "distribution_drafts": {
    "reddit": "Reddit用ドラフト",
    "quora": "Quora用ドラフト",
    "linkedin": "LinkedIn用ドラフト",
    "medium": "Medium用ドラフト"
  }
}
\`\`\`
`;

export async function POST(request: Request) {
  try {
    const { contentBrief, companyData } = await request.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const currentDate = new Date().toISOString().split("T")[0];
    const platforms = contentBrief.target_platforms?.join(", ") || "all";
    
    // プロンプトの組み立て
    const prompt = CITABLE_ARTICLE_PROMPT
      .replace(/\\\${companyName}/g, companyData.name)
      .replace(/\\\${targetPlatforms}/g, platforms)
      .replace(/\\\${currentDate}/g, currentDate)
      + \`\\n\\n## 今回の記事ブリーフ:\\n\${JSON.stringify(contentBrief, null, 2)}\`;

    const result = await model.generateContent(prompt);
    const article = parseGeminiJson(result.response.text());

    // 品質スコアリング
    article.quality_score = calculateQualityScore(article);

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
