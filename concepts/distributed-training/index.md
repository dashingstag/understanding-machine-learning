---
id: distributed-training
title: Distributed training
notation: [compute-c, flop, weights-theta, n-params]
---

## Statement

Executing a `pretraining` run across thousands of accelerators by
splitting work along three axes: `data-parallelism` (replicate model,
shard batch), `tensor-parallelism` (shard each matrix), and
`pipeline-parallelism` (shard layers) — composed with optimizer-state
sharding (ZeRO/FSDP). Success is measured in MFU: model FLOP utilization,
typically 35–55%.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — every headline "trained on $10^{25}$ FLOPs"
claim presumes this machinery: the model is too big for one GPU's memory
and the corpus too big for one GPU's lifetime. Parallelism strategy sets
both feasibility and the real `compute-c` price tag.

## Teardown

1. **Memory math first.** Adam needs ~16 bytes/param (fp32 master +
   momentum + variance + fp16 weight) — a 70B model is >1TB of optimizer
   state before activations. No single GPU holds it.
2. **`data-parallelism`.** The default: each GPU gets a batch slice,
   gradients all-reduced every step; ZeRO-1/2/3 and FSDP shard optimizer
   state → gradients → weights across the same replicas.
3. **`tensor-parallelism`.** Split each weight matrix's columns/rows
   across GPUs in a node — needed when one layer won't fit; costs an
   all-reduce per block, so it stays inside the NVLink domain.
4. **`pipeline-parallelism`.** Layers 1–24 on GPU group A, 25–48 on B —
   micro-batched assembly line; scheduling (GPipe, 1F1B, interleaved)
   fights the "bubble" of idle stages.
5. **The network is the architecture.** All-reduce every step over
   InfiniBand/NVLink — interconnect bandwidth, not FLOPs, often sets the
   achievable MFU and the 3-D parallelism composition.

## Worked example

70B model, 8×H100 node (80GB each):

- Weights fp16: 140GB — doesn't fit on one GPU; Adam state: ~1.1TB.
- FSDP/ZeRO-3 across 64 GPUs: ~17GB optimizer state + 2.2GB weights
  sharded per GPU + activations — fits, at the price of an all-gather per
  layer and an all-reduce per step.
- MFU ≈ 40% → a 1.4T-token run at ~$6 \cdot 7\times10^{10} \cdot
  1.4\times10^{12} \approx 6\times10^{23}$ FLOPs needs ~2 weeks on 4,096
  GPUs — the real budget behind a "70B open model".

## Sources

- Rajbhandari et al., *ZeRO* — [arXiv:1910.02054](https://arxiv.org/abs/1910.02054)
- Shoeybi et al., *Megatron-LM* (tensor parallelism) —
  [arXiv:1909.08053](https://arxiv.org/abs/1909.08053)
- Huang et al., *GPipe* — [arXiv:1811.06965](https://arxiv.org/abs/1811.06965)
- Narayanan et al., *Efficient Large-Scale LM Training on GPU Clusters* —
  [arXiv:2104.04473](https://arxiv.org/abs/2104.04473)
- PyTorch FSDP docs — pytorch.org

## Open questions

- Post-10⁴-GPU scaling: fault-tolerant elastic training and
  cross-datacenter federated runs (async low-bandwidth) — active
  engineering frontier.
