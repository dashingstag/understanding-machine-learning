---
id: vector-search
title: Vector search
notation: [embed-e, cosine-s]
---

## Statement

Approximate nearest-neighbour search over `embed-e` vectors: index
structures (HNSW graphs, IVF cells, PQ quantization) that return top-$k$
by `cosine-s`/dot-product in milliseconds over millions of vectors —
trading exactness for speed. The "R" engine inside
`retrieval-augmented-generation`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`retrieval-augmented-generation` — retrieval quality bounds everything:
if the index misses the right chunk, the model never sees it. ANN
engineering (graph navigability, compression, hybrid lexical+dense) is
the difference between a demo and a product.

## Teardown

1. **Exact k-NN doesn't scale.** Brute force is $O(Nd)$ per query —
   fine at 10⁵ vectors, dead at 10⁸. ANN trades ~99% recall for 100×
   speed.
2. **HNSW.** Navigable small-world graph: greedy walk from entry point
   down hierarchical layers — the production default (ms per query,
   high recall).
3. **IVF + PQ.** Partition space into cells (probe a few), compress
   vectors to product-quantized codes — memory-efficient, slightly
   weaker recall; FAISS/ScaNN internals.
4. **Hybrid retrieval.** Dense misses exact terms; BM25 misses
   paraphrases — production RAG fuses both (RRF) then reranks with a
   cross-encoder.
5. **Rerankers.** Cheap bi-encoder retrieves top-100, expensive
   cross-encoder rescores — the standard two-stage pattern.

## Worked example

10M chunks @ 768-dim fp16: brute force = 7.7 TB·op per query.

- HNSW (M=16, ef=200): ~30k distance evals → ~99% recall, ~5ms.
- PQ(96 subquantizers): vectors shrink 768 floats → 96 bytes; index
  fits in RAM — recall drops ~2 points unless reranked.

## Sources

- Malkov & Yashunin, HNSW — [arXiv:1603.09320](https://arxiv.org/abs/1603.09320)
- Jégou et al., Product Quantization — IEEE TPAMI 2011
- Johnson et al., FAISS — [arXiv:1702.08734](https://arxiv.org/abs/1702.08734)
- Guo et al., ScaNN — [arXiv:1908.10396](https://arxiv.org/abs/1908.10396)
- Robertson & Zaragoza, BM25 (2009) — the lexical half

## Open questions

- Learned indexes vs graph/quantized structures at 10⁹ scale — does a
  model beat a graph at reading geometry?
