---
id: scaling-laws
title: Scaling laws
notation: [loss-l, n-params, data-d, compute-c, flop]
---

## Statement

Empirical power laws: test `loss-l` falls as a smooth power of
`n-params` $N$, `data-d` $D$ and `compute-c` $C$ — $L(N,D) = E +
A/N^{\alpha} + B/D^{\beta}$ with $\alpha,\beta \approx 0.3$ (Kaplan et
al. 2020; Hoffmann et al. 2022). The `chinchilla` result: at fixed
compute, train compute-optimally at $D \approx 20N$ — most models were
under-trained, not too small.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — scaling laws are how labs turn budget into
architecture: they predict the final loss of a $10^{25}$-FLOP run from
small-scale extrapolation, so the billion-dollar decision is made on a
curve, not a hunch. They're the field's main forecasting instrument and
the premise behind `emergent-abilities` debates.

## Teardown

1. **The observation.** On log–log axes, loss vs each factor is linear
   over 6+ orders of magnitude — `kaplan-laws`.
2. **Chinchilla.** Fixed $C$: loss is U-shaped in $N$ — too big wastes
   FLOPs on params, too small wastes them on data. Optimum: $N^* \propto
   C^{0.5}$, $D^* \propto C^{0.5}$, ratio ≈ 20 tokens/param.
3. **Predictive use.** Fit exponents at $10^{18}$–$10^{21}$ FLOPs,
   extrapolate to $10^{25}$ — Muennighoff & Hoffmann style; modern labs
   report it works within ~2%.
4. **What they miss.** Capabilities (not loss) can appear discontinuously —
   `emergent-abilities` — and downstream tasks correlate imperfectly
   (`evaluation`, `goodhart-law`).
5. **The other axis.** `reasoning-models` add test-time compute: loss vs
   inference FLOPs also obeys law-like curves — the post-2024 scaling
   frontier.
6. **Data limits.** Repeated-epoch scaling decays (Muennighoff et al.,
   arXiv:2305.17493) — fresh `training-data` is the binding constraint.

## Worked example

Chinchilla sizing: budget $C = 6\times10^{23}$ FLOPs.

- $6ND = C$ and $D = 20N$ → $120N^2 = C$ → $N^* = \sqrt{5\times10^{21}} \approx 7.1\times10^{10}$ → ~70B params, ~1.4T tokens — the recipe LLaMA-65B later validated.

## Sources

- Kaplan et al. — [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)
- Hoffmann et al., Chinchilla — [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
- Muennighoff et al., *Scaling Data-Constrained LMs* —
  [arXiv:2305.17493](https://arxiv.org/abs/2305.17493)
- Wei et al., emergent abilities — [arXiv:2206.07682](https://arxiv.org/abs/2206.07682)
- Schaeffer et al., *Are Emergent Abilities a Mirage?* —
  [arXiv:2304.15004](https://arxiv.org/abs/2304.15004)

## Open questions

- Why power laws at all — which property of data/model makes the
  exponents universal? — an open theory problem.
- Does the curve survive the shift to test-time compute and synthetic
  data, or does the field need new laws? — `reasoning-models`,
  `training-data`.
