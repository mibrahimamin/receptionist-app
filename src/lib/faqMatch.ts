import type { Faq } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "you", "your", "i", "to", "of",
  "for", "and", "or", "what", "when", "where", "how", "can", "will", "on", "in",
  "with", "my", "me", "have", "has", "it", "this", "that",
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Returns the best-matching FAQ for a free-text question, or null. */
export function matchFaq(question: string, faqs: Faq[]): Faq | null {
  const inputWords = normalize(question);
  if (inputWords.length === 0) return null;

  let best: { faq: Faq; score: number } | null = null;

  for (const faq of faqs) {
    const keywordList = faq.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const questionWords = normalize(faq.question);

    let score = 0;
    for (const word of inputWords) {
      if (keywordList.some((k) => k.includes(word) || word.includes(k))) score += 2;
      if (questionWords.includes(word)) score += 1;
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { faq, score };
    }
  }

  return best ? best.faq : null;
}
