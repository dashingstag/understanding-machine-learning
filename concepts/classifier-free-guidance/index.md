---
id: classifier-free-guidance
title: Classifier-free guidance
notation: [eps-noise, beta]
---

## Statement

Steer `diffusion-models` sampling toward the prompt by running the
denoiser twice — conditioned $\epsilon_\theta(x_t, c)$ and unconditioned
$\epsilon_\theta(x_t, \varnothing)$ — and extrapolating:
$\hat\epsilon = \epsilon_{uncond} + s\,(\epsilon_{cond} -
\epsilon_{uncond})$. The guidance scale $s$ (typically 1.5–12) is the
dial every prompt UI exposes: higher = prompt-faithful, lower = freer.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`diffusion-models` — text conditioning alone produces weak adherence;
CFG is what makes prompts actually bind. It's also the source of
diffusion's signature failure modes (saturated colors, artefacts at
high $s$) — knowing what the knob *does* explains what it breaks.

## Teardown

1. **Two passes.** Same network, run once with conditioning dropped
   (~10% of training examples drop the condition so the model learns
   both) — no separate classifier needed.
2. **The extrapolation.** Difference $(\epsilon_{cond} -
   \epsilon_{uncond})$ points "toward the prompt"; scaling by $s>1$
   amplifies it — literally walking further in the prompt direction.
3. **The tradeoff.** $s$ high → sharp adherence, distorted
   distribution, artefacts and desaturation; $s$ low → diverse,
   natural, loosely-on-prompt. Negative $s$ explores the *opposite*.
4. **Modern patches.** Guidance rescale, interval guidance (apply only
   at certain $t$), distilled CFG (bake guidance in, halve the cost) —
   the production refinements.

## Worked example

$s = 7.5$ (the SD default): the noise estimate is pushed 7.5× in the
conditional direction — equivalent to saying "the prompt matters 7.5
times more than the unconditional prior". At $s = 1$: plain conditional
sampling; $s = 0$: ignore the prompt entirely.

## Sources

- Ho & Salimans — [arXiv:2207.12598](https://arxiv.org/abs/2207.12598)
- Lin et al., *Common Diffusion Noise Schedules and Sample Steps are
  Flawed* (guidance rescale) — [arXiv:2305.08891](https://arxiv.org/abs/2305.08891)
- Kynkäänniemi et al., interval guidance —
  [arXiv:2404.13040](https://arxiv.org/abs/2404.13040)

## Open questions

- Guidance-free generation (autoguidance, distilled CFG) — is the
  double-forward tax permanently buyable, or only deferrable?
