---
id: residual-normalization
title: Residuals and normalization
notation: [layernorm-s, sigma-act, learning-rate]
---

## Statement

Every transformer sublayer is wrapped as
$x \mapsto x + \mathrm{sublayer}(\mathrm{Norm}(x))$: the skip connection
keeps the residual stream intact, and `layernorm` rescales each position's
vector to zero-mean/unit-variance (RMSNorm drops the mean subtraction).
Together they keep gradients finite and signal readable through 100+
layers — see `transformer-block` for where they sit.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` — without residual paths, a 96-layer stack's
gradient vanishes long before layer 1 (`gradient-descent` stalls); without
norms, activations drift and LR tuning becomes impossible. This node is
why depth is cheap, and why `interpretability` can read the stream.

## Teardown

1. **The skip.** $x + f(x)$ gives every layer a direct identity path —
   gradients flow backward unimpeded; the sublayer learns a *delta*, not
   a replacement. (Residual learning: He et al. 2015, ResNet.)
2. **The stream.** Residuals make the hidden state a *shared bus*: every
   sublayer reads it and writes back — the object
   `interpretability` reads, `activation-steering` edits.
3. **The norm.** `layernorm` = $(x-\mu)/\sigma \cdot \gamma + \beta$ per
   position. RMSNorm (Llama): $x/\mathrm{RMS}(x)\cdot g$, no mean —
   ~10% cheaper, same effect.
4. **Pre vs post.** Original: post-norm $x + \mathrm{Norm}(f(x))$ —
   fragile at depth. Modern: pre-norm — norm inside the branch, identity
   path pure — what GPT/Llama use.
5. **Why not BatchNorm.** Sequences have variable length and tiny
   effective batches — batch statistics are unstable; per-position
   normalization has no batch dependence.

## Worked example

Signal magnitude check: without residual, a 96-layer net with per-layer
gain 1.05 sees forward scale $1.05^{96} \approx 108\times$ — and
gradients shrink by the same factor backward. With the skip path, the
gradient at layer 1 includes a copy of the output gradient *directly* —
the identity term never multiplies below 1.

## Sources

- He et al., *Deep Residual Learning* — [arXiv:1512.03385](https://arxiv.org/abs/1512.03385)
- Ba et al., *Layer Normalization* — [arXiv:1607.06450](https://arxiv.org/abs/1607.06450)
- Zhang & Sennrich, *RMSNorm* — [arXiv:1910.07467](https://arxiv.org/abs/1910.07467)
- Xiong et al., *On Layer Normalization in the Transformer Architecture*
  (pre-norm analysis) — [arXiv:2002.04745](https://arxiv.org/abs/2002.04745)

## Open questions

- Do residual streams have privileged "channels" that carry the
  computation — and can deleting one lobotomize the model? —
  `interpretability` / `activation-steering` territory.
