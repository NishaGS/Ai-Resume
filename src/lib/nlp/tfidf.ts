import { documentTerms } from "./textCleaner";

/**
 * Pure-TypeScript TF-IDF vectorizer + cosine similarity.
 * Mirrors sklearn TfidfVectorizer(sublinear_tf=True, norm="l2") + cosine_similarity.
 */

export interface TfidfModel {
  vocabulary: Map<string, number>;
  idf: Float64Array;
}

function termFrequencies(terms: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

export function fitTfidf(documents: string[]): { model: TfidfModel; vectors: Float64Array[] } {
  const docTerms = documents.map((d) => termFrequencies(documentTerms(d)));
  const vocabulary = new Map<string, number>();
  for (const tf of docTerms) {
    for (const term of tf.keys()) {
      if (!vocabulary.has(term)) vocabulary.set(term, vocabulary.size);
    }
  }
  const df = new Float64Array(vocabulary.size);
  for (const tf of docTerms) {
    for (const term of tf.keys()) df[vocabulary.get(term)!]! += 1;
  }
  const n = documents.length;
  const idf = new Float64Array(vocabulary.size);
  for (let i = 0; i < idf.length; i++) idf[i] = Math.log((1 + n) / (1 + df[i]!)) + 1;

  const model: TfidfModel = { vocabulary, idf };
  const vectors = docTerms.map((tf) => transformCounts(tf, model));
  return { model, vectors };
}

function transformCounts(tf: Map<string, number>, model: TfidfModel): Float64Array {
  const vec = new Float64Array(model.vocabulary.size);
  for (const [term, count] of tf) {
    const idx = model.vocabulary.get(term);
    if (idx === undefined) continue;
    vec[idx] = (1 + Math.log(count)) * model.idf[idx]!; // sublinear tf
  }
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i]! * vec[i]!;
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i]! /= norm;
  return vec;
}

export function transformTfidf(document: string, model: TfidfModel): Float64Array {
  return transformCounts(termFrequencies(documentTerms(document)), model);
}

export function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) dot += a[i]! * b[i]!;
  return Number.isFinite(dot) ? Math.max(0, Math.min(1, dot)) : 0;
}

/** Jaccard overlap between two skill sets — a light stand-in for embedding similarity. */
export function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a.map((s) => s.toLowerCase()));
  const sb = new Set(b.map((s) => s.toLowerCase()));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const v of sa) if (sb.has(v)) inter += 1;
  return inter / (sa.size + sb.size - inter);
}
