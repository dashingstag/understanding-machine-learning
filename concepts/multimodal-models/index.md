---
id: multimodal-models
title: Multimodal models
notation: [embed-e, d-model, vocab]
---

## Statement

One model over text, image, audio and video: each modality is turned
into `embed-e`-shaped input by `modality-tokenizers`, often aligned via
`contrastive-learning`, then processed by the same
`transformer-architecture` stack — with decoders (`diffusion-models`,
token decoders) on the output side. Vision-language-action models extend
the same recipe to robot control.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — 2026-era products are natively multimodal:
image understanding, voice, video and robotics all route through the
same trunk. Understanding them needs the fusion story — how pixels
become tokens — not just the text stack.

## Teardown

1. **Tokenizing the world.** `modality-tokenizers`: ViT patches, VQ
   codes, spectrogram slices — every modality becomes a sequence the
   trunk can attend to.
2. **Two fusion styles.** Early fusion (native multimodal transformers —
   one stack eats mixed tokens) vs late fusion (CLIP-style encoders + an
   LLM via projector/adapter).
3. **Contrastive alignment.** `contrastive-learning`: CLIP's dual
   encoder pulls matching image–text pairs together — the embedding
   space most open multimodal systems stand on.
4. **Generation vs understanding.** Understanding reuses the LM head;
   generation needs modality decoders — diffusion for pixels
   (`diffusion-models`), codec decoders for audio.
5. **Embodiment.** VLA models (RT-2, π0): same trunk, action tokens out —
   robotics is multimodality with motors attached.

## Worked example

A "what's in this photo?" query, GPT-4V-class:

- Image → ViT patches (~14×14 px each) → patch embeddings + learned
  projector → same `d-model` stream as text tokens.
- The prompt's text tokens and image patch tokens share one
  attention block — cross-modal reasoning is just attention over a
  mixed sequence.
- The model never "sees pixels" — it sees ~576 token-shaped vectors.

## Sources

- Radford et al., CLIP — [arXiv:2103.00020](https://arxiv.org/abs/2103.00020)
- Liu et al., LLaVA — [arXiv:2304.08485](https://arxiv.org/abs/2304.08485)
- Dosovitskiy et al., ViT — [arXiv:2010.11929](https://arxiv.org/abs/2010.11929)
- Driess et al., PaLM-E — [arXiv:2303.03378](https://arxiv.org/abs/2303.03378)
- Brohan et al., RT-2 — [arXiv:2307.15818](https://arxiv.org/abs/2307.15818)

## Open questions

- Truly native token-free multimodality (pixels in, pixels out, one
  network) vs bolted-on encoders/decoders — which wins at scale?
- Do modalities share an internal "meaning" representation — the
  platonic-hypothesis question from `embeddings`.
