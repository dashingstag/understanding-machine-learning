---
id: document-chunking
title: Document chunking
notation: [embed-e]
---

## Statement

How a corpus becomes embeddable units before indexing: split documents
into chunks sized for the retriever (typically 200–1000 tokens) with
overlap, respecting structure (headings, tables, code blocks) where
possible. The atoms `vector-search` searches over — and the silent
determinant of what `retrieval-augmented-generation` can find.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`retrieval-augmented-generation` — a chunk is the unit of recall: split
the answer across two chunks and it's unreachable; merge it into a wall
of text and it's diluted. Chunking is upstream of everything, so its
mistakes are unfixable downstream.

## Teardown

1. **Size tradeoff.** Small chunks → precise matches, missing context;
   large chunks → self-contained answers, muddy similarity. 300–500
   tokens + 10–15% overlap is the default envelope.
2. **Structure-aware.** Split at headings/paragraphs/code fences, keep
   tables whole, attach heading breadcrumbs ("§4.2 · Refunds · ...") —
   the single highest-leverage upgrade.
3. **Semantic/agentic chunking.** Split where embeddings shift topic,
   or let an LLM draw boundaries — costs compute, helps at edges.
4. **Metadata.** Source, date, section, permissions — chunks carry the
   fields the retriever filters on and the citation prints.
5. **Failure signature.** A retrieval miss where the fact exists in the
   corpus is usually a chunking failure, not an embedder failure.

## Worked example

Policy wiki, §4.2 refund table split at row 3 of 5:

- Query "refund for annual plan?" → row 3's chunk says "annual: 50%"
  but its header context landed in the previous chunk → the retrieved
  fragment lacks the condition ("within 30 days") — answer wrong with
  perfect retrieval. Keep-tables-whole fixes it.

## Sources

- Lewis et al., RAG — [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- LangChain/LlamaIndex docs — the recursive-splitter defaults everyone
  actually runs
- Anthropic, *Contextual Retrieval* (2024) — adding doc-level context
  to each chunk — anthropic.com/news/contextual-retrieval

## Open questions

- Learned chunking end-to-end (retriever-optimized boundaries) vs fixed
  heuristics — an under-studied lever with outsized effects.
