---
id: diffusion-models
title: Diffusion and flow generation
notation: [eps-noise, x-t, weights-theta, loss-l]
---

## Statement

Generation by iterated denoising: forward — destroy data by adding
Gaussian noise over $T$ steps; learn $\epsilon_\theta(x_t, t)$ to
predict the noise (`ddpm-loss`), then reverse — start from pure noise
and denoise into a sample. `latent-diffusion` runs it in a VAE latent;
`flow-matching` learns the velocity field directly;
`classifier-free-guidance` controls prompt adherence.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — generative media is the other half of the
field: images, video, audio, and increasingly robot actions. Different
objective, different architecture family (U-Nets/diffusion
transformers vs decoder stacks), different sampling economics — and
the modality output head for `multimodal-models`.

## Teardown

1. **Forward process.** $x_t = \sqrt{\bar\alpha_t}\,x_0 +
   \sqrt{1-\bar\alpha_t}\,\epsilon$ — a fixed corruption schedule, no
   learning.
2. **The objective.** Train `eps-noise` predictor with `ddpm-loss` —
   literally "guess the noise that was added", one per noise level.
3. **Reverse sampling.** DDPM: stochastic reverse chain; DDIM/
   ODE-solvers: deterministic, 20–50 steps instead of 1000.
4. **Latent space.** `latent-diffusion`: compress pixels → denoise the
   latent → decode. 8× spatial compression is why SD ran on consumer
   GPUs.
5. **Conditioning.** Text via cross-attention (CLIP/T5 embeddings);
   `classifier-free-guidance` extrapolates away from an unconditional
   pass — the "creativity vs prompt-faithfulness" dial.
6. **Flow matching.** `flow-matching`: learn $dx/dt = v_\theta$ — the
   straight-path reformulation; DiT + flow is the 2024+ default
   (SD3, Flux, Sora-class).

## Worked example

Latent diffusion on a 512² image:

- VAE: 512² RGB → 64×64×4 latent — 64× fewer values to denoise.
- 50 DDIM steps ≈ $50 \times$ one UNet pass ≈ a few seconds on a
  consumer GPU — vs 1000+ pixel-space steps for 2020-era DDPM.
- Guidance 7.5: $\hat\epsilon = \epsilon_{uncond} + 7.5(\epsilon_{cond}
  - \epsilon_{uncond})$ — the prompt pulls 7.5× harder.

## Sources

- Ho et al., DDPM — [arXiv:2006.11239](https://arxiv.org/abs/2006.11239)
- Song et al., DDIM — [arXiv:2010.02502](https://arxiv.org/abs/2010.02502)
- Rombach et al., LDM/Stable Diffusion —
  [arXiv:2112.10752](https://arxiv.org/abs/2112.10752)
- Ho & Salimans, classifier-free guidance —
  [arXiv:2207.12598](https://arxiv.org/abs/2207.12598)
- Lipman et al., flow matching — [arXiv:2210.02747](https://arxiv.org/abs/2210.02747)
- Peebles & Xie, DiT — [arXiv:2212.09748](https://arxiv.org/abs/2212.09748)

## Open questions

- Diffusion-for-text: masked/continuous diffusion LMs vs autoregressive —
  an active frontier that could unify the two halves of the map.
