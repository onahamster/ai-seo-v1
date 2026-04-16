// src/lib/quality-scorer.ts
export function calculateQualityScore(article: any): number {
  let score = 0;

  // CITABLE要素チェック
  if (article.bluf_statement?.length > 50) score += 15;
  if (article.entity_mentions >= 3 && article.entity_mentions <= 15) score += 15;
  if (article.faq_count >= 3) score += 15;
  if (article.comparison_tables >= 1) score += 15;
  if (article.citations_count >= 5) score += 10;
  if (article.word_count >= 2000) score += 10;

  // Markdown構造チェック
  const md = article.content_markdown || "";
  const h2Count = (md.match(/^## /gm) || []).length;
  const h3Count = (md.match(/^### /gm) || []).length;
  if (h2Count >= 5) score += 5;
  if (h3Count >= 3) score += 5;

  // テーブル存在チェック
  if (md.includes("|") && md.includes("---")) score += 5;

  // Updated日付チェック
  if (md.includes("Updated:") || md.includes("更新日:")) score += 5;

  return Math.min(score, 100);
}
