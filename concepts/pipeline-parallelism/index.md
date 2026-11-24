---
id: pipeline-parallelism
title: Pipeline parallelism
notation: [weights-theta]
---

## Statement

Assign contiguous layer ranges to different device groups and stream
micro-batches through them like an assembly line — stage $i$ computes
layers, ships activations to stage $i+1$. The idle time at fill/drain is
the "pipeline bubble"; schedules (GPipe, 1F1B, interleaved) exist to
shrink it. The layer-wise axis of `distributed-training`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`distributed-training` — when the model outgrows even a sharded node's
tensor-parallel slice, layers must span machines. PP crosses
inter-node links cheaply (activations only, at stage boundaries) at the
price of scheduling complexity — it's what makes 100+ layer,
trillion-parameter stacks resident at all.

## Teardown

1. **Stage split.** Layers divided evenly across $P$ stages; each stage
   holds only its slice of `weights-theta` + its activations.
2. **The bubble.** A pipeline of depth $P$ with $M$ microbatches idles
   ~$(P-1)/(P+M-1)$ of the schedule — more microbatches → smaller
   bubble, more memory/queueing.
3. **Schedules.** GPipe: fill, then drain (big bubble); 1F1B: steady
   alternating forward/backward (smaller); interleaved virtual stages:
   multiple smaller chunks per GPU — Megatron's production default.
4. **Communication.** Only boundary activations cross stages — cheap;
   the real cost is imbalance and the first/last-stage load (embeddings,
   head).

## Worked example

96 layers on 8 stages = 12 layers/stage, $M = 32$ microbatches:

- GPipe bubble fraction ≈ $7/39 \approx 18\%$ of the step idle.
- Interleaved (2 virtual stages): bubble halves to ~9% — same hardware,
  ~10% more real throughput, which is why it ships.

## Sources

- Huang et al., GPipe — [arXiv:1811.06965](https://arxiv.org/abs/1811.06965)
- Narayanan et al., 1F1B / interleaved — [arXiv:2104.04473](https://arxiv.org/abs/2104.04473)
- Harlap et al., PipeDream — [arXiv:1806.03377](https://arxiv.org/abs/1806.03377)

## Open questions

- Asynchronous pipelines with stale weights (PipeDream-style) vs
  synchronous MFU — is staleness tolerable at LLM scale?
