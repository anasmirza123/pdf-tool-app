export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatExactBytes(bytes: number): string {
  return new Intl.NumberFormat().format(bytes) + ' bytes';
}

export function calculateReadingTime(wordCount: number): { minutes: number; seconds: number; text: string } {
  // Average adult reading speed: 225 wpm
  const totalMinutes = wordCount / 225;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  if (minutes === 0) {
    return { minutes: 0, seconds: Math.max(1, seconds), text: `${Math.max(1, seconds)} sec read` };
  }
  return { minutes, seconds, text: `${minutes} min ${seconds} sec read` };
}

export function calculateSpeakingTime(wordCount: number): string {
  // Average speaking speed: 130 wpm
  const totalMinutes = wordCount / 130;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  if (minutes === 0) return `${Math.max(1, seconds)} sec speech`;
  return `${minutes} min ${seconds} sec speech`;
}

export interface TextMetrics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
  topKeywords: Array<{ word: string; count: number; percentage: number }>;
}

export function analyzeText(text: string): TextMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '0 sec read',
      speakingTime: '0 sec speech',
      topKeywords: []
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Words regex
  const wordsArr = trimmed.match(/\b[\w'-]+\b/g) || [];
  const words = wordsArr.length;

  // Sentences
  const sentencesArr = text.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0);
  const sentences = sentencesArr.length;

  // Paragraphs
  const paragraphsArr = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphsArr.length || 1;

  // Keyword density
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
    'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'is', 'are'
  ]);

  const freqMap = new Map<string, number>();
  wordsArr.forEach((w) => {
    const clean = w.toLowerCase();
    if (clean.length > 2 && !stopWords.has(clean)) {
      freqMap.set(clean, (freqMap.get(clean) || 0) + 1);
    }
  });

  const topKeywords = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({
      word,
      count,
      percentage: words > 0 ? Math.round((count / words) * 1000) / 10 : 0
    }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime: calculateReadingTime(words).text,
    speakingTime: calculateSpeakingTime(words),
    topKeywords
  };
}
