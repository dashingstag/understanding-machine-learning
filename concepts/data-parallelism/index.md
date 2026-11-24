---
id: data-parallelism
title: Data parallelism
notation: [weights-theta, loss-l]
---

## Statement

Replicate the full model on every GPU, give each a different batch
slice, all-reduce the mean gradient each step so all replicas apply the
same `gd-update`. ZeRO/FSDP extend it by sharding optimizer state,
gradients and finally weights across replicas — the backbone strategy
every `distributed-training` recipe starts from.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`distributed-training` — DP is the default axis: it needs no model
changes, scales near-linearly, and only stops working when the model +
optimizer state no longer fits per-GPU — which is where ZeRO stages and
the other axes take over.

## Teardown

1. **DDP.** Forward/backward local to each replica; one all-reduce of
   $\nabla\mathcal{L}$ per step → identical updates, no staleness.
2. **Communication.** Bucketed all-reduce overlaps with backward —
   bandwidth, not compute, is the limiter; ring all-reduce dominates in
   practice.
3. **ZeRO stages.** Stage 1: shard optimizer states; 2: + gradients;
   3: + weights — memory ÷ world-size, at the cost of all-gathers in
   forward/backward (PyTorch FSDP is the production form).
4. **Batch economics.** DP turns batch size into a parallelism dial —
   but huge batches change training dynamics (`learning-rate` scaling,
   critical batch size).

## Worked example

GPT-3-class 175B: weights fp16 = 350GB; Adam state ≈ 1.4TB.

- Vanilla DDP: needs 1.75TB per GPU — impossible.
- ZeRO-3 over 1,024 GPUs: ~1.7GB sharded state/GPU + just-in-time layer
  gathers — fits in 80GB H100s; the all-gather/all-reduce traffic is the
  price paid per step.

## Sources

- Rajbhandari et al., ZeRO — [arXiv:1910.02054](https://arxiv.org/abs/1910.02054)
- Li et al., *PyTorch DDP* — [arXiv:2006.15704](https://arxiv.org/abs/2006.15704)
- Zhao et al., FSDP — [arXiv:2304.11277](https://arxiv.org/abs/2304.11277)

## Open questions

- Async/elastic DP across data centers (DiLoCo-style) — can cheap
  interconnects replace synchronous all-reduce at frontier scale?
