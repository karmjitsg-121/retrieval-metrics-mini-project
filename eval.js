// Evaluate keyword and semantic retrieval using MRR and Recall@10.
// Run with: node eval.js
const fs = require('fs');
const path = require('path');

const dataDir = __dirname;

function loadTestSet(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  return lines.slice(1).filter(Boolean).map((line, index) => {
    const comma = line.indexOf(',');
    if (comma < 0) throw new Error(`Invalid test-set row ${index + 2}: ${line}`);
    const query = line.slice(0, comma).trim();
    const idValues = line.slice(comma + 1).split(';').map((value) => value.trim());
    const correctIds = idValues.map(Number);
    if (!query || correctIds.length === 0 || correctIds.some((id) => !Number.isInteger(id))) {
      throw new Error(`Invalid query or correct post IDs on test-set row ${index + 2}: ${line}`);
    }
    return { query, correctIds };
  });
}

const testSet = loadTestSet(path.join(dataDir, 'test-set.csv'));
if (testSet.length === 0) throw new Error('The test set contains no queries.');

const results = JSON.parse(fs.readFileSync(path.join(dataDir, 'search-results.json'), 'utf8'));

// Return the 1-based position of the first relevant result, or null on a miss.
function rankOf(rankedIds, correctIds) {
  const correct = new Set(correctIds);
  const index = rankedIds.findIndex((id) => correct.has(Number(id)));
  return index < 0 ? null : index + 1;
}

function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

const scores = {
  keyword: { reciprocalRanks: [], hits: 0 },
  semantic: { reciprocalRanks: [], hits: 0 },
};
const rows = [];

for (const { query, correctIds } of testSet) {
  const queryResults = results[query];
  if (!queryResults) throw new Error(`Missing search results for query: ${query}`);

  const ranks = {};
  for (const system of ['keyword', 'semantic']) {
    const rankedIds = queryResults[system];
    if (!Array.isArray(rankedIds)) throw new Error(`Missing ${system} results for query: ${query}`);
    const topTen = rankedIds.slice(0, 10);
    ranks[system] = rankOf(topTen, correctIds);
    const rr = reciprocalRank(topTen, correctIds);
    scores[system].reciprocalRanks.push(rr);
    if (rr > 0) scores[system].hits += 1;
  }
  rows.push({ query, keywordRank: ranks.keyword, semanticRank: ranks.semantic });
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function formatRank(rank) {
  return rank === null ? 'miss' : String(rank);
}
function summary(system) {
  const score = scores[system];
  const mrr = average(score.reciprocalRanks);
  const recall = score.hits / testSet.length;
  return `MRR ${mrr.toFixed(2)} · Recall@10 ${recall.toFixed(2)}`;
}

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const row of rows) {
  console.log(`| ${row.query} | ${formatRank(row.keywordRank)} | ${formatRank(row.semanticRank)} |`);
}
console.log(`| **Summary** | **${summary('keyword')}** | **${summary('semantic')}** |`);
