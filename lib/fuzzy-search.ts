/**
 * High-performance, typo-tolerant fuzzy search engine.
 * Supports:
 * - Substring and exact matches (highest priority)
 * - Prefix matching
 * - Damerau-Levenshtein edit distance for transpositions, insertions, deletions, substitutions
 * - Multi-token matching (e.g., "arees soft" matches "Aress Software")
 * - Array of fields (e.g. matching name, industry, roles, tags)
 */

export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition of adjacent characters (e.g. "es" <-> "se")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  return matrix[al][bl];
}

/**
 * Calculates a match score between a target word and a query word (0 - 100).
 */
export function wordFuzzyScore(targetWord: string, queryWord: string): number {
  if (!targetWord || !queryWord) return 0;
  if (targetWord === queryWord) return 100;
  if (targetWord.startsWith(queryWord)) return 90;
  if (targetWord.includes(queryWord)) return 80;

  const qLen = queryWord.length;
  let maxAllowed = 0;
  if (qLen >= 3 && qLen <= 4) maxAllowed = 1;
  else if (qLen >= 5 && qLen <= 7) maxAllowed = 2;
  else if (qLen > 7) maxAllowed = 3;

  if (maxAllowed > 0) {
    const dist = damerauLevenshtein(targetWord, queryWord);
    if (dist <= maxAllowed) {
      return 70 - dist * 10;
    }
  }
  return 0;
}

/**
 * Computes match status and score for a single string target against a search query.
 */
export function singleStringFuzzyMatch(
  target: string,
  query: string
): { match: boolean; score: number } {
  const tNorm = target.toLowerCase().trim();
  const qNorm = query.toLowerCase().trim();

  if (!qNorm) return { match: true, score: 100 };
  if (!tNorm) return { match: false, score: 0 };

  if (tNorm === qNorm) return { match: true, score: 100 };
  if (tNorm.startsWith(qNorm)) return { match: true, score: 95 };
  if (tNorm.includes(qNorm)) return { match: true, score: 85 };

  const tWords = tNorm.split(/[^a-z0-9]+/).filter(Boolean);
  const qWords = qNorm.split(/[^a-z0-9]+/).filter(Boolean);

  if (qWords.length === 0) return { match: true, score: 100 };

  let totalScore = 0;
  let matchedWords = 0;

  for (const qW of qWords) {
    let bestWordScore = 0;
    for (const tW of tWords) {
      const score = wordFuzzyScore(tW, qW);
      if (score > bestWordScore) {
        bestWordScore = score;
      }
    }
    if (bestWordScore > 0) {
      matchedWords++;
      totalScore += bestWordScore;
    }
  }

  // All query words must have at least one fuzzy match in the target
  if (matchedWords === qWords.length) {
    const avgScore = Math.round(totalScore / qWords.length);
    return { match: true, score: avgScore };
  }

  return { match: false, score: 0 };
}

/**
 * Computes match status and best score for one or multiple string fields.
 */
export function fuzzyMatchScore(
  targets: string | (string | null | undefined)[],
  query: string
): { match: boolean; score: number } {
  if (!query || !query.trim()) {
    return { match: true, score: 100 };
  }

  const list = Array.isArray(targets) ? targets : [targets];
  let bestScore = 0;
  let hasMatch = false;

  for (const t of list) {
    if (!t) continue;
    const res = singleStringFuzzyMatch(t, query);
    if (res.match && res.score > bestScore) {
      bestScore = res.score;
      hasMatch = true;
    }
  }

  return { match: hasMatch, score: bestScore };
}

/**
 * Filters and sorts any collection by fuzzy relevance score.
 * Results with higher scores (exact matches & prefixes) appear first,
 * followed by close typo matches.
 */
export function fuzzyFilterAndSort<T>(
  items: T[],
  query: string,
  getTextFields: (item: T) => string | (string | null | undefined)[]
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const scored: { item: T; score: number; index: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fields = getTextFields(item);
    const { match, score } = fuzzyMatchScore(fields, query);
    if (match && score > 0) {
      scored.push({ item, score, index: i });
    }
  }

  // Sort by score descending; preserve stable original index for ties
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });

  return scored.map((s) => s.item);
}
