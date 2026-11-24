---
id: modality-tokenizers
title: Modality tokenizers
notation: [embed-e, vocab]
---

## Statement

The front-end that turns non-text data into the `embed-e`-shaped
sequences a `transformer-architecture` consumes: image patches + linear
projection (ViT), vector-quantized codes (VQ-VAE/codebooks),
spectrogram slices (audio), frame stacks (video). Each produces "tokens"
in the functional sense — indexable units of a learned vocabulary.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`multimodal-models` — the trunk only eats vectors in a sequence; this is
where every modality is made legible. The choice of tokenizer sets the
token budget (context cost), the granularity ceiling (OCR small text),
and whether generation is even possible (`diffusion-models` decoders
vs autoregressive codecs).

## Teardown

1. **Patchify (ViT).** Image → non-overlapping $P{\times}P$ patches →
   linear projection to `d-model` + position. 224px at $P{=}16$ → 196
   tokens; ~576 typical for LLM-attached vision.
2. **VQ codebooks.** Learned discrete codes: encoder → nearest entry in
   a `vocab`-sized codebook — images become *discrete* tokens a language
   model can literally predict (DALL·E-1, Parti-style).
3. **Audio.** Mel spectrogram → slice along time → project (Whisper,
   AudioLM); neural codecs (EnCodec, SoundStream) give discrete audio
   tokens for generation.
4. **Video.** Tubelet/3-D patching — space×time tokens; cost scales
   brutally: frames × patch count is why long-video understanding is
   expensive.
5. **Continuous vs discrete.** Continuous patch features → understand;
   discrete codes → generate. Some stacks do both (understand via
   patches, generate via diffusion `diffusion-models`).

## Worked example

A 448×448 screenshot into an LLM:

- $P = 14$: 32×32 = 1024 patch tokens + text → eats a third of an 8k
  context; that's why "describe this screenshot" has a literal budget
  the same way a paragraph does.

## Sources

- Dosovitskiy et al., ViT — [arXiv:2010.11929](https://arxiv.org/abs/2010.11929)
- Oord et al., VQ-VAE — [arXiv:1711.00937](https://arxiv.org/abs/1711.00937)
- Esser et al., VQGAN — [arXiv:2012.09841](https://arxiv.org/abs/2012.09841)
- Radford et al., Whisper — [arXiv:2212.04356](https://arxiv.org/abs/2212.04356)

## Open questions

- Token-free vision at LLM scale (continuous pixels in) — does patch
  granularity ever stop mattering, or is the budget the law?
