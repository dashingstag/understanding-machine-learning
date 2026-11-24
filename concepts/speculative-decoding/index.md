---
id: speculative-decoding
title: Speculative decoding
notation: [logits-z]
---

## Statement

Draft-then-verify: a small cheap model proposes $k$ tokens; the target
model scores all $k$ in *one* parallel pass; tokens are accepted while
the draft matched a sample of the target's distribution (with a
correction rule that makes the output distribution *exactly* the
target's). 2–3× decode speedup, mathematically lossless — the main
algorithmic lever on `inference-efficiency` latency.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`inference-efficiency` — decode latency is one-token-at-a-time by
definition; speculation breaks the serial bottleneck *without*
changing what the model would have said. It's why fast endpoints exist.

## Teardown

1. **Draft.** Small model (or the target's own early layers — EAGLE,
   Medusa heads) proposes $k$ tokens greedily — cheap because it's
   tiny.
2. **Parallel verify.** Target model computes `logits-z` for all $k$
   positions in one pass — the key: verification is parallel even
   though generation isn't.
3. **Accept/reject.** Accept tokens while target-$p$/draft-$q$ ratio
   admits; on first rejection, resample from the corrected
   distribution $\max(0, p - q)$ — Leviathan et al.'s proof that output
   distribution is exactly preserved.
4. **Acceptance rate rules everything.** Speedup ≈
   $\frac{1 + \gamma \cdot \text{accept-rate}}{1 + c}$ where $c$ is
   draft cost — good draft alignment (same tokenizer, distilled from
   target) is the whole engineering game.
5. **Self-speculation.** Draft head on the target itself (Medusa) or
   tree-structured candidates — no second model needed.

## Worked example

$k = 4$ drafted tokens, target accepts 3, rejects the 4th:

- One target pass produced 4 tokens worth of logits → ~3–4× effective
  speedup on that step; over a stream, ~2.5× — same distribution the
  target alone would emit.

## Sources

- Leviathan et al. — [arXiv:2211.17192](https://arxiv.org/abs/2211.17192)
- Chen et al., concurrent work — [arXiv:2302.01318](https://arxiv.org/abs/2302.01318)
- Cai et al., Medusa — [arXiv:2401.10774](https://arxiv.org/abs/2401.10774)
- Li et al., EAGLE — [arXiv:2401.15077](https://arxiv.org/abs/2401.15077)

## Open questions

- Speculation for `reasoning-models` long traces — acceptance rates
  drop on low-entropy reasoning chains; better drafters or
  tree-verification is the frontier.
