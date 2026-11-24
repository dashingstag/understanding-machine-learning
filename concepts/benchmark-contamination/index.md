---
id: benchmark-contamination
title: Benchmark contamination
notation: [data-d, perplexity-s]
---

## Statement

Test data leaking into `training-data`: benchmark questions (or
near-duplicates) present in the pretraining corpus turn a capability
measure into a memorization check. Detected by n-gram overlap,
per-example `perplexity-s` anomalies, or canary strings — the first
thing to rule out on any headline `evaluation` score.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`evaluation` — a contaminated benchmark measures recall, not skill,
and contamination is nearly unavoidable when corpora are scraped at
internet scale. It's the standard explanation when scores jump
implausibly between model generations.

## Teardown

1. **How it gets in.** Benchmarks are public text on the web; scrapers
   ingest them with everything else — GitHub issues, Quizlet decks,
   "MMLU answer key" pages.
2. **Direct vs indirect.** Verbatim questions (easy to catch) vs
   paraphrases/translations/solutions written elsewhere (hard) —
   "effective contamination" is a spectrum.
3. **Detection.** n-gram overlap audits, perplexity gaps (suspiciously
   low loss on "test" items), canary GUIDs (BIG-bench embeds
   `26b5c67b-…` strings whose presence in corpus proves ingestion),
   held-out private test sets.
4. **Mitigation.** Decontamination pipelines (filter n-gram matches —
   standard but imperfect), dynamic/rotating benchmarks, private
   evals, post-hoc disclosure.
5. **Adjacent sins.** Train-on-test fine-tuning, eval-set peeking in
   prompt engineering, judge-model training on the same data —
   `llm-as-judge` circularity.

## Worked example

GPT-3's own audit (Brown et al.): flagged contaminated benchmarks
showed inflated scores — e.g., removing detected overlaps moved some
few-shot scores by 1–4 points; subsequent audits (Dodge et al., C4)
found ~4–14% of some test sets present in common crawls. Scale of the
problem in two numbers.

## Sources

- Dodge et al., C4 documentation — [arXiv:2104.08758](https://arxiv.org/abs/2104.08758)
- Brown et al., GPT-3 contamination appendix —
  [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Srivastava et al., BIG-bench canaries —
  [arXiv:2206.04615](https://arxiv.org/abs/2206.04615)
- Golchin & Surdeanu, *Time Travel in LLMs* —
  [arXiv:2310.17561](https://arxiv.org/abs/2310.17561)

## Open questions

- Certifiably-clean evals (canary-embedded, private, rotated) vs the
  economics of public benchmarks — the infrastructure question of
  `evaluation`.
