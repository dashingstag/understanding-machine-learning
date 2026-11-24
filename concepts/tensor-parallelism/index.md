---
id: tensor-parallelism
title: Tensor parallelism
notation: [weights-theta]
---

## Statement

Shard each weight matrix itself: split $W \in \mathbb{R}^{d \times 4d}$
column-wise across GPUs (Megatron-LM style), each device computes its
slice of the output, and partial results are combined by an all-reduce
inside the block. Attention heads and FFN units partition naturally —
the intra-layer axis of `distributed-training`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`distributed-training` — when a single layer exceeds one GPU's memory
(or a node's worth of parallel efficiency), the matrix itself must be
divided. TP is why layer shape and NVLink topology appear together in
every training architecture diagram.

## Teardown

1. **Column/row splits.** FFN: split $W_1$ column-wise (each GPU owns a
   slice of hidden units), $W_2$ row-wise → one all-reduce per FFN.
   Attention: split by heads — embarrassingly parallel until output
   projection.
2. **The all-reduce tax.** Two collectives per block per microbatch —
   microseconds on NVLink (~900GB/s), deadly across Ethernet: TP lives
   inside the node by construction.
3. **Sequence/context parallelism.** Long-context training shards the
   sequence dimension too (Ring Attention, Ulysses) — TP's sibling for
   the attention dimension.
4. **Composition.** TP(8) inside a node × PP across nodes × DP across
   replicas — the standard Megatron recipe for 100B+ models.

## Worked example

FFN $W_1$: $12288 \times 49152$ on 8-way TP: each GPU holds
$12288 \times 6144$ — computes its $6144$-slice of hidden activations;
$W_2$ splits row-wise so the output is a partial sum → one all-reduce
joins them. Attention with 128 heads: each GPU owns 16 heads outright.

## Sources

- Shoeybi et al., Megatron-LM — [arXiv:1909.08053](https://arxiv.org/abs/1909.08053)
- Narayanan et al., *Efficient Large-Scale LM Training* —
  [arXiv:2104.04473](https://arxiv.org/abs/2104.04473)
- Liu et al., Ring Attention — [arXiv:2310.01889](https://arxiv.org/abs/2310.01889)

## Open questions

- Can TP escape the NVLink island (optical/switch fabric) or will
  topology always bound the intra-layer axis?
