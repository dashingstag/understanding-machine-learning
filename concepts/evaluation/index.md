---
id: evaluation
title: Evaluation
notation: [loss-l, perplexity-s]
---

## Statement

The science of measuring what models can do: curated benchmarks
(MMLU, GSM, SWE-bench), human preference arenas (Chatbot Arena),
`llm-as-judge` graders, and `perplexity-s` on held-out data —
undermined by `benchmark-contamination` (test data in pretraining
corpora), saturation, and `goodhart-law` pressure on every metric that
becomes a target.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — every claim in this map ("reasoning works",
"MoE wins", "R1 beats o1") stands or falls on evals. Eval methodology
is where the field is weakest: contaminated benchmarks, judge bias,
and saturation mean headline numbers are often the noisiest signal in
the whole system.

## Teardown

1. **Intrinsic vs extrinsic.** `perplexity-s` on held-out text vs task
   accuracy — perplexity predicts pretraining progress; tasks claim
   capability. They correlate loosely.
2. **Static benchmarks.** MMLU (knowledge), GSM8K/MATH (reasoning),
   HumanEval/SWE-bench (code), ARC/HellaSwag — the canonical suite,
   all aging and saturating.
3. **Human evaluation.** Arena-style pairwise battles → Elo — the gold
   standard for "feels better", slow and taste-laden.
4. **LLM-as-judge.** `llm-as-judge`: a model grades the model —
   scalable, but biased (verbosity, position, self-preference).
5. **The contamination problem.** `benchmark-contamination`: test sets
   scraped into `training-data` — scores measure memorization, not
   capability.
6. **Saturation + Goodhart.** Benchmarks saturate in ~2 years now —
   and once a metric is marketed, it gets optimized
   (`goodhart-law`); the response is private/live evals and
   contamination audits.

## Worked example

MMLU history as an eval obituary: introduced 2020 with GPT-3 at ~44%;
frontier models hit ~90% by 2024 → MMLU-Pro and GPQA minted to
restore headroom. The cycle — benchmark → saturation → scandal over
contamination → harder successor — is now ~2 years per generation.

## Sources

- Hendrycks et al., MMLU — [arXiv:2009.03300](https://arxiv.org/abs/2009.03300)
- Zheng et al., Chatbot Arena/MT-Bench —
  [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)
- Jimenez et al., SWE-bench — [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)
- Rein et al., GPQA — [arXiv:2311.12022](https://arxiv.org/abs/2311.12022)
- Srivastava et al., BIG-bench — [arXiv:2206.04615](https://arxiv.org/abs/2206.04615)
- Dodge et al., *Documenting the English Colossal Clean Crawled
  Corpus* (contamination methodology) —
  [arXiv:2104.08758](https://arxiv.org/abs/2104.08758)

## Open questions

- Evals that measure what matters (robustness, honesty, real-world
  value) vs what's easy to score — the field's unresolved central
  question.
