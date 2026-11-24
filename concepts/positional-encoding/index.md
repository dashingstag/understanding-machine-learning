---
id: positional-encoding
title: Positional encoding
notation: [embed-e, query-matrix, key-matrix]
---

## Statement

Self-attention is permutation-invariant: shuffle the input and every
output row shuffles with it — nothing marks "first" or "after".
Positional encoding injects order, either by adding position vectors to
`embed-e` (sinusoidal/learned, Vaswani et al. 2017) or by rotating
`query-matrix`/`key-matrix` pairs as a function of position (RoPE, Su et
al. 2021), which makes attention scores depend on *relative* distance.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` — without position, the stack is a bag-of-words
machine: "dog bites man" ≡ "man bites dog". RoPE specifically is why
modern models can extend context (YaRN, NTK scaling) — the encoding
family decides length-extrapolation behaviour.

## Teardown

1. **The problem.** Attention compares all pairs symmetrically; order
   must enter as *data*, not structure.
2. **Absolute methods.** Sinusoidal $PE_{(pos,2i)} = \sin(pos/10000^{2i/d})$
   — fixed, frequency-spaced; learned position embeddings — trainable but
   capped at train-time max length.
3. **Relative methods.** What attention wants is distance $m-n$, not
   addresses. RoPE rotates each 2-D slice of $\mathbf{q}_m,\mathbf{k}_n$
   by angle $m\theta_i$, so $\mathbf{q}_m^\top\mathbf{k}_n$ becomes a
   function of $(m-n)$ — free, parameterless, and composable with
   `attention-mechanism` unchanged.
4. **Length extrapolation.** Models trained at 4k fail at 100k —
   frequencies hit unseen phases. Fixes: position interpolation, NTK/YaRN
   frequency rescaling — the engineering behind "1M context" claims
   (`inference-efficiency`).

## Worked example

RoPE on a 2-D pair $(q_1, q_2)$ at position $m$: rotation matrix
$R_{m\theta}$ maps $q \mapsto (q_1\cos m\theta - q_2\sin m\theta,\;
q_1\sin m\theta + q_2\cos m\theta)$. Then
$\mathbf{q}_m^\top \mathbf{k}_n =
\mathbf{q}^\top R_{(m-n)\theta}\,\mathbf{k}$ — depends only on the
*offset*. With $\theta = 1$: tokens 5 apart always produce the same
relative rotation regardless of where in the sequence they sit.

## Sources

- Vaswani et al., *Attention Is All You Need*, §3.5 —
  [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Su et al., *RoFormer: Rotary Position Embedding* —
  [arXiv:2104.09864](https://arxiv.org/abs/2104.09864)
- Peng et al., *YaRN: Efficient Context Window Extension* —
  [arXiv:2309.00071](https://arxiv.org/abs/2309.00071)
- Press et al., *ALiBi* — [arXiv:2108.12409](https://arxiv.org/abs/2108.12409)

## Open questions

- Do models use position semantically ("earlier in the document") or just
  mechanically? — connects to `lost-in-middle` and `interpretability`.
