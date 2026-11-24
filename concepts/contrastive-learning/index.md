---
id: contrastive-learning
title: Contrastive learning
notation: [embed-e, cosine-s, temperature, loss-l]
---

## Statement

Learn a shared `embed-e` space by pulling matching pairs together and
pushing all others apart — InfoNCE:
$\mathcal{L} = -\log \frac{e^{s_{ii}/\tau}}{\sum_j e^{s_{ij}/\tau}}$ with
`cosine-s` similarities $s$ and `temperature` τ. CLIP trains dual
encoders on 400M image–caption pairs this way; no labels needed — the
pairing itself is supervision.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`multimodal-models` — the cheapest route to cross-modal meaning: a
contrastively-aligned space lets an LLM's projector "understand" images
without retraining from scratch. `embeddings` and
`retrieval-augmented-generation` use the same machinery for
text-only retrieval models (E5, BGE).

## Teardown

1. **The pair is the label.** An image and its caption are a free
   positive; all $B{-}1$ other pairs in the batch are negatives —
   batch size is the negative supply.
2. **InfoNCE.** Softmax over similarities at temperature τ — a
   classification problem where class = "my partner".
3. **Dual encoders.** Two towers trained to agree — each side usable
   alone afterward (CLIP's zero-shot classification trick: encode
   "a photo of a {class}" and argmax).
4. **Text-only variants.** SimCSE, E5, BGE: same loss, different
   positives (adjacent spans, dropout views, hard negatives) — the
   embedding models `vector-search` actually runs on.
5. **Limits.** Learns what's *co-mentioned*, not what's true — counting,
   negation and fine detail are notoriously weak; modality gap (the two
   spaces stay slightly disjoint) is measurable.

## Worked example

Batch of 4 image–text pairs, τ = 0.07:

- Correct pair similarity $s_{11} = 0.31$, negatives $0.05, -0.02, 0.11$.
- Loss: $-\log \frac{e^{0.31/0.07}}{e^{0.31/0.07} + e^{0.05/0.07} + e^{-0.02/0.07} + e^{0.11/0.07}}
= -\log \frac{83}{83 + 2.0 + 0.75 + 4.8} \approx 0.09$ — near zero when the pair dominates.

## Sources

- Radford et al., CLIP — [arXiv:2103.00020](https://arxiv.org/abs/2103.00020)
- Oord et al., InfoNCE/CPC — [arXiv:1807.03748](https://arxiv.org/abs/1807.03748)
- Chen et al., SimCLR — [arXiv:2002.05709](https://arxiv.org/abs/2002.05709)
- Gao et al., SimCSE — [arXiv:2104.08821](https://arxiv.org/abs/2104.08821)

## Open questions

- The modality gap — why aligned spaces keep disjoint shells, and
  whether it matters for downstream `multimodal-models` performance.
