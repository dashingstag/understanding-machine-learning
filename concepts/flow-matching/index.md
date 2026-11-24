---
id: flow-matching
title: Flow matching
notation: [x-t, eps-noise, loss-l]
---

## Statement

Learn the velocity field that transports noise to data: define a
probability path $x_t$ from Gaussian to data (typically linear
interpolation $x_t = (1-t)x_0 + t\epsilon$), train $v_\theta(x_t, t)$
to predict the path's velocity $dx/dt$, then integrate the ODE from
$t{=}1$ to $t{=}0$. The modern reformulation of
`diffusion-models` — straighter paths, fewer steps, simpler objectives.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`diffusion-models` — flow matching + diffusion transformers is the
2024+ default recipe (Stable Diffusion 3, Flux, Sora-class video). It
explains *why* denoising works as transport, samples in fewer steps,
and unifies DDPM-style noise schedules as special cases of path design.

## Teardown

1. **Paths, not schedules.** Define any interpolant $x_t$ between noise
   and data; the model learns its velocity field — DDPM is a curved
   special case; linear ("rectified flow") is the simple one.
2. **Conditional flow matching.** Train on per-pair paths: pick
   $(x_0, \epsilon)$, form $x_t$, regress $v_\theta(x_t,t)$ onto
   $x_0 - \epsilon$ — tractable despite the marginal field being
   intractable.
3. **Sampling = ODE solve.** Euler/Heun/Runge–Kutta from $t{=}1$ —
   straighter paths need fewer solver steps (the rectified-flow result:
   reflow makes paths straighter).
4. **Why it won.** Deterministic, interpretable as transport theory,
   better at high guidance, compatible with distillation to few-step
   students — the practical recipe everywhere new models ship.

## Worked example

Linear path $x_t = (1-t)x_0 + t\epsilon$:

- Target velocity is constant: $dx/dt = \epsilon - x_0$ — the model
  learns to point from noise straight at data.
- Euler with 20 steps on a straightened path ≈ DDIM with 100+ on the
  curved one — the fewer-steps claim in one line.

## Sources

- Lipman et al. — [arXiv:2210.02747](https://arxiv.org/abs/2210.02747)
- Liu et al., rectified flow — [arXiv:2209.03003](https://arxiv.org/abs/2209.03003)
- Esser et al., SD3 (MM-DiT + flow) — [arXiv:2403.03206](https://arxiv.org/abs/2403.03206)
- Kingma & Gao — [arXiv:2306.01809](https://arxiv.org/abs/2306.01809)

## Open questions

- Text-native flow/diffusion (discrete or continuous tokens) vs
  autoregression — same question as `diffusion-models`' open thread.
