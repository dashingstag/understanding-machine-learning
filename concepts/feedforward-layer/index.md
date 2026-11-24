---
id: feedforward-layer
title: Feed-forward layer
notation: [d-model, sigma-act, weights-theta, n-params]
---

## Statement

The position-wise two-layer perceptron inside every transformer block —
see `ffn`: expand from `d-model` $d$ to $4d$ (gated variants: ~$8d/3$),
apply `sigma-act` (ReLU/GELU/SiLU), project back. Identical weights at
every position; ~⅔ of a model's `n-params` lives here.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` — attention only *routes* information between
positions; the FFN is where each position's representation is actually
transformed. `interpretability` work (Geva et al. 2021) finds factual
memories stored as key–value pairs in FFN matrices — "the store" to
attention's "router".

## Teardown

1. **Shape.** $x \mapsto W_2\,\sigma(W_1 x + b_1) + b_2$,
   $W_1 \in \mathbb{R}^{4d \times d}$ — two fat matmuls.
2. **Role.** Attention mixes; FFN computes. Each position is processed
   independently — the FFN can't see other tokens, which is why it must
   happen *after* attention has gathered context.
3. **Activations.** ReLU → GELU (GPT-2) → SiLU/SwiGLU (Llama-family):
   gated variants split the up-projection in two and multiply —
   $\text{SwiGLU}(x) = (\text{Swish}(xW) \otimes xV)\,W_2$.
4. **Where knowledge lives.** Probing and causal interventions implicate
   mid-stack FFNs in factual recall (e.g., "the Eiffel Tower is in
   Paris" firing specific neurons) — see `probing`,
   `sparse-autoencoders`.
5. **The MoE hook.** `mixture-of-experts` is just the FFN replicated $E$
   times with a `gate-g` router choosing — same shape, sparse activation.

## Worked example

GPT-2 small block: $d = 768$, FFN inner $= 4d = 3072$.

- $W_1$: $768 \times 3072 \approx 2.36$M, $W_2$ same $\Rightarrow$
  $\approx 4.72$M params vs attention's $\approx 2.36$M — exactly the ⅔
  split quoted across this map.
- Per token FLOPs $\approx 2 \times 4.72$M $\approx 9.4$M multiply-adds —
  cheap alone, dominant over 12 blocks.

## Sources

- Vaswani et al., §3.3 — [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Geva et al., *Transformer Feed-Forward Layers Are Key-Value Memories* —
  [arXiv:2012.14913](https://arxiv.org/abs/2012.14913)
- Shazeer, *GLU Variants Improve Transformer* —
  [arXiv:2002.05202](https://arxiv.org/abs/2002.05202)
- Touvron et al., *LLaMA* (SwiGLU choice) —
  [arXiv:2302.13971](https://arxiv.org/abs/2302.13971)

## Open questions

- Are FFN "memories" retrievable/editable surgically (ROME-style) or
  hopelessly entangled? — the `interpretability` research question.
