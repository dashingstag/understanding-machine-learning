---
id: retrieval-augmented-generation
title: Retrieval-augmented generation
notation: [embed-e, cosine-s, logits-z]
---

## Statement

Ground generation in fetched documents: embed chunks of a corpus
(`embed-e` vectors), index them for `vector-search`, retrieve top-$k$
matches for each query, stuff them into the context, and generate with
citations. `document-chunking` decides what's findable; the retriever
decides what the model ever sees.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — RAG is how products answer about private,
recent or niche data without retraining, and the main deployed
countermeasure to hallucination: the model cites sources instead of
reciting weights. Most enterprise "AI features" are this pipeline plus
a system prompt.

## Teardown

1. **Chunk.** `document-chunking`: split documents into embeddable
   units — size, overlap and structure decide recall before anything
   else runs.
2. **Embed + index.** `embed-e` per chunk → ANN index (`vector-search`:
   HNSW/IVF) — milliseconds over millions of chunks.
3. **Retrieve.** Query → embedding → top-$k$ by `cosine-s` (+ hybrid
   BM25, rerankers) — the set that bounds everything the model can say.
4. **Stuff.** Chunks pasted into the context — `lost-in-middle` means
   position inside the window matters; reranking puts the best first.
5. **Cite.** Answer grounded in the retrieved text — hallucination
   becomes *attributable*: check the citation or it didn't happen.
6. **Failure modes.** Retrieval miss (right doc never fetched), context
   dilution (20 mediocre chunks), stale index — RAG fails at the
   retriever far more than at the model.

## Worked example

"What's our refund policy?" over a 10k-doc wiki:

- Chunk at ~400 tokens with 10% overlap → ~60k vectors in an HNSW index.
- Query embeds → top-5 returned in ~5ms → pasted above the question →
  the model quotes §4.2 verbatim.
- If chunking split §4.2's table mid-row, the answer silently degrades —
  the pipeline's weakest link is upstream, always.

## Sources

- Lewis et al., *RAG for Knowledge-Intensive NLP* —
  [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- Karpukhin et al., DPR — [arXiv:2004.04906](https://arxiv.org/abs/2004.04906)
- Malkov & Yashunin, HNSW — [arXiv:1603.09320](https://arxiv.org/abs/1603.09320)
- Izacard & Grave, *Leveraging Passage Retrieval with Generative
  Models* (FiD) — [arXiv:2007.01282](https://arxiv.org/abs/2007.01282)

## Open questions

- Agentic retrieval (the model decides when/what to fetch —
  `agents-and-tool-use`) vs fixed top-$k$ — the architecture boundary
  is dissolving.
