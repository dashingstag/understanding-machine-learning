---
id: training-data
title: Training data
notation: [data-d, vocab]
---

## Statement

The corpus a `pretraining` run actually consumes — scraped text filtered
through deduplication, quality classifiers, toxicity screens and
domain-mix weights, plus increasingly *synthetic* data written by earlier
models. `data-d` counts it in tokens; quality decides what `data-d` buys.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`pretraining` — the model can only learn what the corpus contains, and
empirically a curated trillion tokens beats a raw trillion. Curation is
also the quiet lever behind benchmark claims (`benchmark-contamination`)
and alignment debt (`post-training` must later undo corpus toxicity).

## Teardown

1. **Sources.** Common Crawl derivatives (FineWeb, RefinedWeb), books,
   code (GitHub/Stack), papers, Wikipedia, curated dialogue — each with
   its own bias profile.
2. **Dedup.** Exact + near-dedup (MinHash): repeated text wastes compute
   and enables memorization — verbatim regurgitation is a dedup failure.
3. **Filtering.** Perplexity/quality classifiers trained on "known good"
   text — the model-of-good-writing decides what a future model reads.
4. **Mixing.** Domain weights (code↑ → math↑ → reasoning↑) are a guarded
   recipe; small ratio changes move benchmarks measurably.
5. **Synthetic data.** Phi-style textbooks, distilled chains, self-play —
   extends the corpus but risks *model collapse* (variance shrinking each
   generation) — the data-wall debate.
6. **Contamination.** Eval sets scraped into the corpus —
   `benchmark-contamination` makes scores lie; dedup-vs-eval is
   standard hygiene.

## Worked example

FineWeb recipe (HuggingFace, 15T tokens): Common Crawl → language filter
(English p>0.65) → MinHash dedup at 5-gram level → quality classifier
traficada on educational text → ~30% kept.

- A 70B model at Chinchilla-optimality needs ~1.4T tokens — one FineWeb
  pass suffices for ~10 Chinchilla-scale runs; repeated epochs enter the
  diminishing-returns regime measured by Muennighoff et al.

## Sources

- Penedo et al., *FineWeb* — [arXiv:2406.17557](https://arxiv.org/abs/2406.17557)
- Gao et al., *The Pile* — [arXiv:2101.00027](https://arxiv.org/abs/2101.00027)
- Lee et al., *Deduplicating Training Data Makes Language Models Better* —
  [arXiv:2107.06499](https://arxiv.org/abs/2107.06499)
- Shumailov et al., *AI models collapse when trained on recursively
  generated data* — [arXiv:2305.17493](https://arxiv.org/abs/2305.17493)
- Gunasekar et al., *Textbooks Are All You Need* (Phi) —
  [arXiv:2306.11644](https://arxiv.org/abs/2306.11644)

## Open questions

- The data wall: does the field run out of quality tokens before
  `scaling-laws` run out of headroom — and does synthetic data break the
  wall or the model?
