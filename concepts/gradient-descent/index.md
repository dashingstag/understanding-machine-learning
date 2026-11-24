---
id: gradient-descent
title: Gradient descent
notation: [weights-theta, loss-l, learning-rate, gd-update]
---

## Statement

Iteratively update the parameters by stepping against the loss gradient:

$$\theta \leftarrow \theta - \eta\,\nabla_\theta \mathcal{L}(\theta)$$

$\mathcal{L}$ is the scalar `loss-l`, $\eta$ the `learning-rate`, and
$\nabla_\theta\mathcal{L}$ is produced by `backpropagation`. Repeated over
batches of `training-data`, this is *the* learning rule — every model in
this map was produced by some variant of it (`gd-update`).

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`ml-foundations` claims "learning is optimization"; this node is the
optimization. Nothing else on the map works without it — pretraining is
gradient descent for $10^{13}$ tokens, RLHF is gradient descent on a
different loss, and the fine-tuning inside every product is the same loop
on a small dataset.

## Teardown

1. **The gradient.** For each parameter, $\partial\mathcal{L}/\partial
   \theta_i$ answers "if I nudge this weight up, does the loss rise or
   fall?" — computed once per step by `backpropagation`.
2. **The step.** $\theta \leftarrow \theta - \eta\nabla\mathcal{L}$.
   Steepest local descent; no lookahead, no momentum — yet.
3. **Batch → stochastic.** Full-batch gradients are exact but waste the
   dataset's redundancy. Minibatch (SGD) is noisier per step and far
   cheaper per epoch — and the noise itself helps escape bad basins.
4. **The learning rate.** Too small → nothing converges in budget; too
   large → oscillation/divergence. Practice: short warmup, then decay
   (cosine/linear). LR is the single most-tuned hyperparameter.
5. **Momentum and adaptivity.** Accumulate velocity (Polyak 1964, Nesterov)
   and per-parameter step sizes (AdaGrad → RMSProp → Adam, Kingma & Ba
   2014). Modern runs default to Adam-family — torn down in `optimizers`.
6. **Where it fails.** Sharp minima vs flat minima (generalization),
   saddle points, gradient pathologies (vanishing/exploding) that
   `residual-normalization` exists to fix.

## Worked example

Minimize $\mathcal{L}(w) = (w - 3)^2$ from $w_0 = 0$:

- $\nabla = 2(w - 3)$; at $w = 0$: $\nabla = -6$.
- $\eta = 0.25$: $w_1 = 0 - 0.25 \cdot (-6) = 1.5$; then $w_2 = 1.5 - 0.25 \cdot (-3) = 2.25$; converges to 3 geometrically.
- $\eta = 1.5$: $w_1 = 0 - 1.5 \cdot (-6) = 9$; next $\nabla = 12$, $w_2 = 9 - 18 = -9$ — oscillation doubling away from 3: **divergence** from one oversized step.
- $\eta = 0.05$: safe but $\sim 40$ steps to the same answer — the speed/stability trade in two lines.

## Sources

- Rumelhart, Hinton, Williams, *Learning representations by
  back-propagating errors*, Nature 1986
- Robbins & Monro, *A Stochastic Approximation Method*, 1951 — SGD's origin
- Polyak, *Some methods of speeding up the convergence of iteration
  methods*, 1964 — momentum
- Kingma & Ba, *Adam*, ICLR 2015 — [arXiv:1412.6980](https://arxiv.org/abs/1412.6980)
- Goodfellow et al., *Deep Learning*, §4.3, §8.3–8.5
- 3Blue1Brown, *Gradient descent, how neural networks learn* —
  [youtu.be/IHZwWFHWa-w](https://www.youtube.com/watch?v=IHZwWFHWa-w)

## Open questions

- Why do flat minima generalize better — and does SGD actively prefer
  them, or just land in them?
- What replaces Adam's heuristic moment estimates at 10⁴-GPU scale? —
  belongs to `optimizers` / `distributed-training`.
