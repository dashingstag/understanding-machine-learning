---
id: latent-diffusion
title: Latent diffusion
notation: [x-t, eps-noise]
---

## Statement

Run `diffusion-models`' denoising in a learned compressed space instead
of pixel space: a VAE encodes 512² RGB to a ~64×64 latent
(perceptual compression ~8× per side), the noise-prediction network
operates there, and the decoder renders once at the end. Rombach et
al. 2022 — the compute trick that put image generation on consumer
GPUs.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`diffusion-models` — pixel-space DDPM needed 1000+ expensive steps on
full-resolution tensors; the latent move is *the* reason Stable
Diffusion is cheap and open. Video, audio and 3-D generators all
reuse it.

## Teardown

1. **The autoencoder.** Encoder: pixels → smooth low-res latent;
   decoder: latent → pixels. Trained perceptually (LPIPS + adversarial)
   so the latent carries semantics, not noise.
2. **Diffusion in latent.** `ddpm-loss` unchanged — but each UNet/DiT
   pass is ~50× cheaper; sampling 20–50 steps is seconds.
3. **Why it preserves quality.** Compression removes imperceptible
   high-frequency redundancy — the denoiser spends capacity on
   structure, not dithering.
4. **Conditioning.** Cross-attention layers read text
   `embed-e` (CLIP/T5) — how "a photo of X" steers the latent trajectory.
5. **Failure modes.** Latent ceiling: fine text/faces degrade through
   the VAE; higher-ratio autoencoders trade fidelity for speed.

## Worked example

512×512×3 = 786k values vs 64×64×4 = 16k latent values — a 48×
reduction. One denoising step in latent ≈ 2% of the pixel-space cost —
50 steps ≈ 1 pixel step's worth of work, which is the entire consumer
story.

## Sources

- Rombach et al., *High-Resolution Image Synthesis with Latent Diffusion* —
  [arXiv:2112.10752](https://arxiv.org/abs/2112.10752)
- Esser et al., VQGAN (the latent recipes' origin) —
  [arXiv:2012.09841](https://arxiv.org/abs/2012.09841)
- stability.ai — the SD model family releases

## Open questions

- How far can compression go (128×? token-level latents) before the
  autoencoder becomes the bottleneck?
