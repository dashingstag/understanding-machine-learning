---
id: transformer-architecture
title: Transformer architecture
notation: [d-model, weights-theta, n-params, layernorm-s, sigma-act]
---

## Statement

A transformer maps a sequence of token ids to a distribution over the next
token by stacking identical blocks: each block is multi-head
`attention-mechanism` followed by a position-wise `feedforward-layer`,
wrapped in `residual-normalization`. The whole stack is a single
differentiable function $f_\theta$ — see `transformer-block` for the block
formula — trained by `gradient-descent` on `next-token-prediction`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — the transformer's layers are the object that
everything else in this map trains (`pretraining`), aligns
(`post-training`), serves (`inference-efficiency`), scales
(`scaling-laws`) or inspects (`interpretability`). It displaced RNNs and
convolutions because attention's constant-depth paths parallelize
perfectly over accelerators — the architecture *is* the scaling story.

## Teardown

1. **Tokens in.** `tokenization` → `embeddings` lookup: ids become rows of
   a `vocab`-sized table plus `positional-encoding`.
2. **The residual stream.** One `d-model`-wide highway every sublayer
   reads from and writes to — `residual-normalization` is what makes
   96+ layers trainable.
3. **Attention.** `attention-mechanism` mixes information *across
   positions* — the only place tokens see each other. `attn` is $\mathcal
   O(n^2)$ in context length, which shapes everything downstream
   (`kv-cache`, sparse/linear attention research).
4. **FFN.** `feedforward-layer` — two matmuls with a `sigma-act`
   nonlinearity, ~⅔ of `n-params`, the likely home of factual recall.
5. **The head.** `unembedding` scores the last hidden state against the
   vocabulary → `logits-z` → `softmax` → next-token distribution, sampled
   under `temperature`.
6. **Why this won.** Parallel training (no recurrence), constant-length
   gradient paths, and hardware-shaped simplicity: it is three primitives
   (matmul, softmax, layernorm) repeated — ideal for `distributed-training`.

## Worked example

GPT-2 small: `n-params` $= 124$M, `d-model` $d = 768$, $L = 12$ blocks,
12 heads $\Rightarrow$ `key-dim` $d_k = 64$.

- Per block: attention $\approx 4d^2 = 2.36$M params; FFN
  $\approx 8d^2 = 4.72$M $\Rightarrow$ $\approx 7.1$M/block, $\times 12 \approx 85$M.
- Embeddings: $50{,}257 \times 768 \approx 38.6$M (tied with the head) $\Rightarrow$ $\approx 124$M total. The parameter budget is ~⅓ vocabulary, ~⅔ blocks.

## Sources

- Vaswani et al., *Attention Is All You Need* — [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Radford et al., *Language Models are Unsupervised Multitask Learners*
  (GPT-2 report, 2019)
- Kaplan et al., *Scaling Laws for Neural Language Models* —
  [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)
- Brown et al., *GPT-3* — [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)
- Karpathy, nanoGPT — [github.com/karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)
- 3Blue1Brown ch.5–7, *Transformers* series

## Open questions

- Is attention-load-bearing or just the easiest-to-scale mixer? —
  alternatives (state-space models, linear attention) test this; see
  `inference-efficiency`.
- Where exactly do capabilities live — heads, FFNs, or the stream? —
  belongs to `interpretability`.
