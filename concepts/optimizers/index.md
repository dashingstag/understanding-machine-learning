---
id: optimizers
title: Optimizers (SGD, momentum, Adam)
notation: [learning-rate, weights-theta, loss-l, beta]
---

## Statement

The update-rule family applied to `gradient-descent`'s output: SGD adds
momentum (velocity $v \leftarrow \beta v + \nabla\mathcal{L}$, step by
$v$); Adam (Kingma & Ba 2014) tracks both gradient mean and variance
($m, v$) and steps by $\hat m/(\sqrt{\hat v}+\epsilon)$ — per-parameter
adaptive rates. AdamW decouples weight decay; most frontier training is
Adam-family at `learning-rate` $10^{-4}$ scale with warmup+cosine decay.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`ml-foundations` — the descent rule is a choice with real consequences:
Adam's per-parameter normalization is why transformers train stably at
scale where SGD stalls, and its hyperparameters ($\beta_1, \beta_2$,
`beta` weight decay) fill every run sheet.

## Teardown

1. **SGD.** Pure `gd-update` on minibatches — simple, generalizes well,
   but fragile: one global LR for 10¹¹ heterogeneous parameters.
2. **Momentum.** Polyak/Nesterov velocity — smooths noise, accelerates
   through valleys, overshoots less; still one LR.
3. **AdaGrad → RMSProp.** Per-parameter step sizes scaled by accumulated
   squared gradients — rare/large gradients get smaller steps.
4. **Adam.** Momentum ($m$, β₁=0.9) + RMSProp ($v$, β₂=0.999) + bias
   correction — the 2015 default; memory cost: 2 extra tensors per
   parameter (a real line-item at 100B+, cf. `distributed-training`).
5. **AdamW.** Weight decay pulled out of the gradient path — the actual
   standard; variants (Lion, Sophia, Muon) challenge the crown at
   frontier scale.
6. **Schedules.** Linear warmup (first ~0.5% steps), then cosine/linear
   decay — `learning-rate` is the highest-leverage knob.

## Worked example

Parameter with gradients $[10, 0.1, 10, 0.1, \dots]$ (alternating
scale):

- SGD, $\eta$: oscillates — 10s dominate the step.
- Momentum: direction stabilizes, oscillation damped by β.
- Adam: each step ≈ $\eta \cdot \text{sign-like}$ — the 10s and 0.1s get
  *equal* effective step size via $\sqrt{\hat v}$ normalization: the
  noisy parameter converges without a global LR compromise.

## Sources

- Kingma & Ba, Adam — [arXiv:1412.6980](https://arxiv.org/abs/1412.6980)
- Loshchilov & Hutter, AdamW — [arXiv:1711.05101](https://arxiv.org/abs/1711.05101)
- Polyak 1964; Nesterov 1983 — momentum
- Ruder, *An overview of gradient descent optimization algorithms* —
  [arXiv:1609.04747](https://arxiv.org/abs/1609.04747)

## Open questions

- Second-order methods (Shampoo, Muon) at frontier scale — can they
  beat AdamW's generality without its tuning tax?
- Why does Adam outperform SGD on transformers specifically — curvature,
  sparsity, or noise structure? — still debated.
