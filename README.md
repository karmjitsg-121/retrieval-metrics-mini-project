# Retrieval Metrics Mini Project

This project evaluates keyword and semantic search on the same ten-query test set using Reciprocal Rank, Mean Reciprocal Rank (MRR), and Recall@10. It uses the supplied ranked-result fixtures, so no database or API key is needed.

## Run the evaluation

```bash
node eval.js
```

The script reads `test-set.csv` and `search-results.json` from the repository directory and prints a Markdown comparison table. It also checks for malformed test-set rows and missing search results, so input issues produce a helpful error instead of misleading metrics.

## Results

| Query | Keyword rank | Semantic rank |
|---|---:|---:|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |

Semantic search performs better overall on both MRR (0.67 vs. 0.30) and Recall@10 (1.00 vs. 0.60), finding every relevant answer and generally ranking it higher. Keyword search ranks higher for “redis or memcached for caching” and “sql or nosql for a new product,” where the query uses specific technical terms that also appear in the relevant content. Semantic search wins on the other queries, especially symptom-based or paraphrased questions, because it can match meaning even when wording differs. A team could keep keyword search as part of a hybrid system because its wins on exact terminology complement semantic search’s broader strength.

## Files

- `eval.js` — computes the first relevant rank, reciprocal rank, MRR, and Recall@10, then prints the comparison table.
- `test-set.csv` — the ten queries and their relevant post IDs; multiple relevant IDs are separated by semicolons.
- `search-results.json` — the fixture’s top-10 ranked post IDs for both systems.
