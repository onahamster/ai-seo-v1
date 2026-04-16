import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "dummy_key");

// ユーティリティ: JSONレスポンスのパース（Markdownコードブロック除去）
export function parseGeminiJson(text: string): any {
  try {
    const cleaned = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse Gemini JSON output:", text);
    throw new Error("Invalid JSON returned from Gemini");
  }
}
