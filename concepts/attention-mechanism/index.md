---
id: attention-mechanism
title: Attention mechanism
notation: [query-matrix, key-matrix, value-matrix, key-dim, softmax-sym, logits-z, attn, multi-head]
---

## Statement

Given a sequence of $n$ token embeddings $X \in \mathbb{R}^{n \times d_{\text{model}}}$,
scaled dot-product attention forms three learned projections
$\mathbf{Q} = X\mathbf{W}^Q$, $\mathbf{K} = X\mathbf{W}^K$,
$\mathbf{V} = X\mathbf{W}^V$ and returns

$$\mathrm{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V}) = \mathrm{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^{\top}}{\sqrt{d_k}}\right)\mathbf{V}$$

Each output row is a convex combination of the value rows — the weights of
that combination are computed, per token, from query–key similarity. This is
the `attn` formula; the multi-head variant runs $h$ copies in parallel
(`multi-head`).

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` needs exactly one operation that lets information
move **between** token positions. Everything else in a transformer layer —
the feed-forward network, layer norm, residual adds — is applied per
position independently. Remove attention and each token's representation is
frozen to its own `embeddings` vector: no pronoun can find its noun, no
question can find its context. Attention is the whole reason the
architecture exists; the rest is plumbing around it.

## Teardown

1. **Project.** Each input row $x_i$ is multiplied by three learned weight
   matrices (part of `weights-theta`), producing a query row, a key row and
   a value row. The paper uses $d_k = d_v = 64$ per head with
   $d_{\text{model}} = 512$ (Vaswani et al. 2017, §3.2.2).
2. **Score.** $S = \mathbf{Q}\mathbf{K}^{\top}$ — entry $(i,j)$ is the dot
   product $q_i \cdot k_j$: token $i$'s raw interest in token $j$.
3. **Scale.** Divide by $\sqrt{d_k}$. The paper's argument (§3.2.1): if
   $q$ and $k$ have unit-variance components, their dot product has variance
   $d_k$, so for large $d_k$ the `softmax-sym` input saturates and gradients
   vanish. Dividing by $\sqrt{d_k}$ restores variance $\approx 1$.
4. **Mask (optional).** Set disallowed scores to $-\infty$ before the
   softmax. A *causal* mask forbids $j > i$ — decoder self-attention cannot
   look at future tokens, which is what makes left-to-right `pretraining`
   well-defined.
5. **Normalise.** `softmax` row-wise: each row becomes weights summing to 1.
6. **Mix.** Multiply by $\mathbf{V}$: output row $i$ is the weighted blend
   of all value rows.
7. **Heads.** In practice this runs $h$ times in parallel with different
   projections, concatenated and re-projected by $\mathbf{W}^O$ (`multi-head`).
   Head-specialisation evidence: Voita et al. 2019 pruned most heads of a
   trained model with little loss — a few heads carry identifiable roles
   (positional, syntactic, rare-word).
8. **Cost.** $S$ has $n^2$ entries — memory and FLOPs grow quadratically in
   context length (`attn-complexity`). Everything in
   `inference-efficiency` about long contexts is a workaround for this line.

## Worked example

Three tokens — "cat sat down" — with $d_{\text{model}} = d_k = d_v = 2$, one
head, computed by `playground/attention_toy.py` (run it; output below):

```
Q = [[1.0, 0.5], [0.0, 1.0], [1.0, 1.5]]
K = [[1.0, 0.0], [0.5, 1.0], [1.5, 1.0]]
V = [[2.0, 0.0], [0.0, 2.0], [2.0, 2.0]]
raw scores QK^T = [[1.0, 1.0, 2.0], [0.0, 1.0, 1.0], [1.0, 2.0, 3.0]]
scaled by 1/sqrt(d_k) = [[0.7071, 0.7071, 1.4142], [0.0, 0.7071, 0.7071], [0.7071, 1.4142, 2.1213]]
attention weights = [[0.2483, 0.2483, 0.5035], [0.1978, 0.4011, 0.4011], [0.14, 0.284, 0.576]]
output = weights @ V = [[1.5035, 1.5035], [1.1978, 1.6044], [1.432, 1.7199]]
weights WITHOUT scaling = [[0.2119, 0.2119, 0.5761], [0.1554, 0.4223, 0.4223], [0.09, 0.2447, 0.6652]]
weights with causal mask = [[1.0, 0.0, 0.0], [0.3302, 0.6698, 0.0], [0.14, 0.284, 0.576]]
```

Read row 2 ("sat"): even with made-up weights it places most mass on
"down" — and under a causal mask row 0 can only look at itself. Note the
last block: without $1/\sqrt{d_k}$ the same scores land measurably closer to
one-hot — small here at $d_k = 2$, but the effect grows with dimension.

## Sources

- Vaswani et al., *Attention Is All You Need*, NeurIPS 2017, §3.2.1–3.2.2 —
  [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Bahdanau, Cho, Bengio, *Neural Machine Translation by Jointly Learning to
  Align and Translate*, ICLR 2015 — [arXiv:1409.0473](https://arxiv.org/abs/1409.0473)
- Voita et al., *Analyzing Multi-Head Self-Attention*, ACL 2019 —
  [arXiv:1905.09418](https://arxiv.org/abs/1905.09418)
- Jay Alammar, *The Illustrated Transformer* —
  [jalammar.github.io/illustrated-transformer](https://jalammar.github.io/illustrated-transformer/)
- 3Blue1Brown, *Attention in transformers, visually explained* —
  [youtu.be/eMlx5fFNoYc](https://www.youtube.com/watch?v=eMlx5fFNoYc)
- Computation: `playground/attention_toy.py` in this repo

## Open questions

- The paper prefers dot-product over additive scoring mostly for matmul
  speed — is there a deeper reason multiplicative scoring wins in practice?
- What do individual heads compute in frontier models? — see
  `interpretability`.
- Which alternatives keep quality at sub-quadratic cost (linear attention,
  state-space models)? — belongs under `inference-efficiency`.
