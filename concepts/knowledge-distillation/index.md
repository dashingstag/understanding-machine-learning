---
id: knowledge-distillation
title: Knowledge distillation
notation: [kl-div, loss-l, temperature]
---

## Statement

Train a small "student" model to imitate a large "teacher": match the
teacher's full output distribution (soft labels, `kl-div` to teacher
`logits-z` softened by `temperature`) rather than the hard corpus
labels. The student learns *which wrong answers were close* — richer
signal per example — at ~2–5% of pretraining compute.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`inference-efficiency` — most "small" production models are students:
capability reaches cheap hardware by imitation, not by training small
models on raw data. It's also the mechanism behind cheap model
variants, `speculative-decoding` drafters, and some
`post-training` pipelines (distilling a reasoning model's traces).

## Teardown

1. **Soft targets.** Hinton et al. 2015: teacher probabilities at high
   `temperature` carry "dark knowledge" — p(cat)=0.7, p(tiger)=0.2,
   p(car)=0.0001 encodes similarity structure hard labels lose.
2. **The loss.** $KL(p_{teacher}^{\tau} \| p_{student}^{\tau})$ +
   optional ground-truth term — token-level for LMs: each position
   gets a full distribution to match.
3. **Sequence-level.** Teacher *generates* the training set (Alpaca,
   Phi-style, R1-trace distillation) — the student SFTs on teacher
   outputs; simplest and the dominant modern form.
4. **Feature-level.** Also match hidden states/attention maps —
   richer, but requires white-box teacher access.
5. **Legal/contest frontier.** Distilling proprietary outputs sits in
   a ToS/grey zone — several 2024–25 "who distilled whom" debates
   hinge on trace provenance.

## Worked example

Reasoning distillation (DeepSeek-R1 → 1.5B student):

- Teacher generates 800k verified reasoning traces → student SFTs on
  them → small model outperforms same-size models trained on raw data
  by ~15–30 points on math — the "capability travels down" result in
  one number.

## Sources

- Hinton et al., *Distilling the Knowledge in a Neural Network* —
  [arXiv:1503.02531](https://arxiv.org/abs/1503.02531)
- Taori et al., Alpaca — Stanford CRFM 2023
- Gunasekar et al., Phi — [arXiv:2306.11644](https://arxiv.org/abs/2306.11644)
- DeepSeek-AI R1 distillation — [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)

## Open questions

- Does distillation preserve tail behaviour (failure modes travel too)
  — or can a student exceed its teacher in the regimes the teacher
  never demonstrated?
