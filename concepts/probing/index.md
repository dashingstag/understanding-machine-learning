---
id: probing
title: Probing
notation: [embed-e, loss-l]
---

## Statement

Train a lightweight classifier (usually linear, sometimes a small MLP)
on a frozen model's activations to predict a property — POS, tense,
sentiment, truth-value. If the probe reads it, the representation
contains it. The cheapest instrument in `interpretability` — and the
oldest, with the deepest caveat: presence ≠ use.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`interpretability` — probing is the first thing you point at a new
representation: "does layer N encode X?" is answerable in an hour. Its
limitations (correlation vs causation, probe learning the task itself)
defined what stronger methods had to prove.

## Teardown

1. **The setup.** Freeze the model, collect hidden states at a layer,
   train a linear head to predict the labelled property — accuracy =
   "information is present".
2. **Control tasks.** Hewitt & Liang: probe accuracy must beat accuracy
   on randomized task — otherwise the probe learned the property
   itself, not the representation's.
3. **Linear vs expressive.** Linear probes claim "linearly accessible"
   information (the strong claim); MLP probes find more but prove less.
4. **MDL probes.** Minimum description length / information-theoretic
   variants — how *easily* the information is extracted, not just
   whether.
5. **What probes can't say.** Correlation, not causation: the layer may
   encode X without the network using X — `activation-steering` and
   ablation are the causal instruments that complete the claim.

## Worked example

Layer-wise POS probing on BERT: accuracy peaks mid-stack (~layers
5–8) then drops — "syntax lives in the middle, semantics at the top" —
the canonical layered-representation result (Tenney et al., "BERT
rediscovers the classical NLP pipeline").

## Sources

- Alain & Bengio, *Understanding intermediate layers using linear
  classifier probes* — [arXiv:1610.01644](https://arxiv.org/abs/1610.01644)
- Tenney et al., BERT pipeline — [arXiv:1905.05950](https://arxiv.org/abs/1905.05950)
- Hewitt & Liang, control tasks — [arXiv:1909.03368](https://arxiv.org/abs/1909.03368)
- Voita & Titov, MDL probes — [arXiv:2004.12298](https://arxiv.org/abs/2004.12298)

## Open questions

- Probing "capability" (deception, planning) vs surface properties —
  how do you label a behaviour you can't verify? — the safety-adjacent
  probing frontier.
