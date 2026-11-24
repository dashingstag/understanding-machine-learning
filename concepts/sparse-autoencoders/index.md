---
id: sparse-autoencoders
title: Sparse autoencoders
notation: [embed-e, loss-l, sigma-act]
---

## Statement

Dictionary learning over a model's activations: train an autoencoder
with a bottleneck *wider* than the input and a sparsity penalty so that
each hidden unit captures one feature — decomposing superposed
`embed-e`-space directions into nameable, steerable features. The
workhorse that turned `interpretability` from neuron-reading into
feature-finding (Cunningham et al.; Templeton et al. "Scaling
Monosemanticity").

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`interpretability` — neurons are polysemantic (French + code + parens
in one unit); SAEs disentangle the soup into a bigger sparse basis
where features are single-purpose — the prerequisite for
`activation-steering` and feature-level auditing.

## Teardown

1. **Architecture.** Encoder: activations → wide sparse layer
   ($\mathrm{ReLU}$ or TopK); decoder: features → reconstructed
   activations. Loss = reconstruction + sparsity penalty.
2. **Superposition fix.** The model packs $F$ features into $d < F$
   neurons; the SAE unpacks them back into ~$F$ dictionary atoms —
   each atom hopefully one concept.
3. **Naming.** Features are labeled by inspection: max-activating
   examples + automated explanations — "Golden Gate Bridge feature"
   became the field's mascot via `activation-steering`.
4. **Scale.** Anthropic's 2024 runs: millions of features across
   mid-stack layers of Claude — hierarchical: features split into
   finer sub-features as the dictionary grows.
5. **Open problems.** Feature splitting/merging instability, dead
   latents, missing the *computational* role (a feature exists ≠ the
   model uses it), SAE-vs-transcoder debates for circuits.

## Worked example

Residual stream activation $\mathbf{h} \in \mathbb{R}^{768}$ at
layer 12, SAE width $32k$, top-64 sparsity:

- Output: 64 active features — e.g., #412 "mentions of dates", #8817
  "sycophantic agreement phrasing" — each a direction you can read or
  add back as an edit.

## Sources

- Cunningham et al., SAEs for LMs — [arXiv:2309.08600](https://arxiv.org/abs/2309.08600)
- Templeton et al., Scaling Monosemanticity —
  transformer-circuits.pub/2024/scaling-monosemanticity
- Gao et al., TopK SAEs — [arXiv:2406.04093](https://arxiv.org/abs/2406.04093)
- Bricken et al., *Towards Monosemanticity* —
  transformer-circuits.pub/2023/monosemantic-features

## Open questions

- Do SAE features capture mechanisms (causal roles) or just clusters?
  Transcoders and circuit-level evaluation are the proposed tests.
