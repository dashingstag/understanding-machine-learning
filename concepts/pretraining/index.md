---
id: pretraining
title: Pretraining
notation: [loss-l, weights-theta, n-params, compute-c, data-d, perplexity-s]
---

## Statement

Self-supervised training of a `transformer-architecture` on
`training-data` at trillion-token scale with the
`next-token-prediction` objective — one `cross-entropy` term per
position. The run consumes `compute-c` FLOPs, produces the base model
every later stage (`post-training`, `knowledge-distillation`) assumes,
and is where `scaling-laws` do their forecasting.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — pretraining is where almost all capability
enters: post-training shapes behaviour but the knowledge, grammar and
latent reasoning are installed here. It's also ~95% of the training
compute bill — the stage `distributed-training` exists to run.

## Teardown

1. **Objective.** `next-token-prediction` — `cross-entropy` on the model's
   `logits-z` at every position; `perplexity-s` is its readable form
   (`ppl`).
2. **Data.** `training-data` — curation, dedup, filtering, mixing ratios;
   half the capability story is corpus design.
3. **Compute.** `flops-6nd` — a full pass ≈ $6ND$ FLOPs for `n-params`
   $N$, tokens $D$; at $N = 10^{11}$, $D = 10^{13}$ that's
   $6\times10^{24}$ — weeks on thousands of GPUs (`distributed-training`).
4. **Stability.** Loss spikes, gradient explosions, hardware failures —
   the run is babysat via `learning-rate` schedules, checkpointing,
   gradient clipping.
5. **What emerges.** Grammar first, then facts, then patterns researchers
   call `emergent-abilities` — capabilities that appear abruptly with
   scale (`scaling-laws` frames the debate).

## Worked example

Chinchilla-optimal sizing: `chinchilla` says $D \approx 20N$ tokens per
parameter. For $N = 7$B: $D \approx 140$B tokens.

- FLOPs ≈ $6 \cdot 7{\times}10^{9} \cdot 1.4{\times}10^{11} \approx 5.9\times10^{21}$.
- On 1,000 A100s at ~40% MFU (~120 TFLOP/s each): ≈ $1.6\times10^{7}$ s ≈ 190 GPU·days → ~6 days wall-clock.
- GPT-2-scale check ($N{=}124$M): optimal $D \approx 2.5$B tokens — tiny; the field overshoots (trains longer) for inference economics.

## Sources

- Radford et al., GPT-2 report (2019); Brown et al., GPT-3 —
  [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Hoffmann et al., *Chinchilla* — [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
- Gao et al., *The Pile* — [arXiv:2101.00027](https://arxiv.org/abs/2101.00027)
- Touvron et al., LLaMA — [arXiv:2302.13971](https://arxiv.org/abs/2302.13971)
- Karpathy, *Let's reproduce GPT-2* —
  [youtu.be/l8pRSuU81PU](https://www.youtube.com/watch?v=l8pRSuU81PU)

## Open questions

- Data wall: high-quality public text ≈ tens of trillions of tokens —
  does synthetic data (`training-data`) extend the curve or collapse it?
- How much of "emergence" is metric discontinuity vs real phase change?
  — `emergent-abilities` / `evaluation` thread.
