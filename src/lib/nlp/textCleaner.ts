/**
 * Resume text cleaning utilities.
 * Preserves technically meaningful tokens such as C++, C#, .NET, Node.js, F1 scores.
 */

const PRESERVE: Array<[RegExp, string]> = [
  [/c\+\+/gi, " cplusplustoken "],
  [/c#/gi, " csharptoken "],
  [/\.net/gi, " dotnettoken "],
  [/node\.js/gi, " nodejstoken "],
  [/next\.js/gi, " nextjstoken "],
  [/vue\.js/gi, " vuejstoken "],
  [/react\.js/gi, " reactjstoken "],
  [/express\.js/gi, " expressjstoken "],
  [/tf-idf/gi, " tfidftoken "],
  [/ci\/cd/gi, " cicdtoken "],
  [/scikit-learn/gi, " scikitlearntoken "],
];

const RESTORE: Array<[RegExp, string]> = [
  [/cplusplustoken/g, "c++"],
  [/csharptoken/g, "c#"],
  [/dotnettoken/g, ".net"],
  [/nodejstoken/g, "node.js"],
  [/nextjstoken/g, "next.js"],
  [/vuejstoken/g, "vue.js"],
  [/reactjstoken/g, "react.js"],
  [/expressjstoken/g, "express.js"],
  [/tfidftoken/g, "tf-idf"],
  [/cicdtoken/g, "ci/cd"],
  [/scikitlearntoken/g, "scikit-learn"],
];

export function cleanText(raw: string): string {
  let text = (raw || "").replace(/\r/g, "\n").toLowerCase();
  for (const [re, token] of PRESERVE) text = text.replace(re, token);
  // keep letters, digits, spaces and a few structural characters
  text = text.replace(/[^a-z0-9\s\-/&,.:%()@+]/g, " ");
  text = text.replace(/[ \t]+/g, " ");
  for (const [re, val] of RESTORE) text = text.replace(re, val);
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/** Keeps original line structure (useful for section extraction) but normalises whitespace. */
export function normaliseLines(raw: string): string[] {
  return (raw || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l) => l.length > 0);
}

const STOPWORDS = new Set(
  `a an the and or of to in for with on at by from as is are was were be been being this that these those i my me we our you your he she it they them his her their its not no but if then than so such very can will would should could may might must have has had do does did about into over under between during above below out off again further once here there all any both each few more most other some only own same too s t just don now also using used use work works working experience responsible responsibilities including etc`.split(
    /\s+/,
  ),
);

export function tokenize(text: string): string[] {
  return cleanText(text)
    .split(/[^a-z0-9+#./-]+/)
    .map((t) => t.replace(/^[-./]+|[-./]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

export function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) out.push(`${tokens[i]} ${tokens[i + 1]}`);
  return out;
}

export function documentTerms(text: string): string[] {
  const tokens = tokenize(text);
  return [...tokens, ...bigrams(tokens)];
}
