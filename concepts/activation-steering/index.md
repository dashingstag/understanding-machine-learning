---
id: activation-steering
title: Activation steering
notation: [embed-e, weights-theta]
---

## Statement

Edit behaviour by adding directions to the residual stream mid-
forward-pass: compute a steering vector (e.g., mean activation
difference between "refuse" and "comply" examples), add a scaled copy
to `embed-e`-space activations during generation, and the behaviour
shifts — no `gradient-descent`, no retraining. The use-the-parts-you-
found half of `interpretability`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`interpretability` — it's the causal test of everything the field
claims: if adding a direction reliably changes behaviour, the feature
was real. It's also the cheapest possible intervention — inference-
time control without touching `weights-theta`.

## Teardown

1. **Finding the direction.** Mean-difference of activations between
   contrast pairs ("honest" vs "sycophantic" completions), or read off
   an `sparse-autoencoders` feature directly.
2. **Applying it.** $\mathbf{h} \leftarrow \mathbf{h} + \alpha
   \mathbf{v}$ at chosen layers per token — strength α controls the
   dosage; too large → gibberish.
3. **Golden Gate demo.** Anthropic's mascot experiment: steer with a
   bridge-feature direction and the model answers everything about
   the Golden Gate — proof the direction carries meaning.
4. **Honesty/safety uses.** Honesty vectors (turn down sycophancy),
   deception probes, refusal directions — alignment knobs you can
   dial at inference.
5. **Limits.** Coarse control (real traits aren't single directions),
   context sensitivity (a "honesty" vector can break syntax), and the
   open question of whether it edits causes or decorates them.

## Worked example

Sycophancy steering (illustrative): collect 100 prompt pairs where the
model agrees-with-user vs disagrees-honestly; direction =
mean(honest) − mean(agreeing) at layer 15; $\alpha = -3$ during
decode → flattery rate drops measurably on a held-out test — control
with zero weight updates.

## Sources

- Turner et al., steering vectors — [arXiv:2308.10248](https://arxiv.org/abs/2308.10248)
- Templeton et al., Scaling Monosemanticity (Golden Gate) —
  transformer-circuits.pub/2024/scaling-monosemanticity
- Zou et al., *Representation Engineering* —
  [arXiv:2310.01405](https://arxiv.org/abs/2310.01405)
- Rimsky et al., *Steering Llama 2 via Contrastive Activation
  Addition* — [arXiv:2312.06681](https://arxiv.org/abs/2312.06681)

## Open questions

- Can steering be a production safety control (calibrated, monitored)
  or is it an interpretability diagnostic only?
