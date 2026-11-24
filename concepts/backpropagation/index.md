---
id: backpropagation
title: Backpropagation
notation: [loss-l, weights-theta, learning-rate]
---

## Statement

Reverse-mode automatic differentiation applied to the loss graph: for
each parameter, $\partial\mathcal{L}/\partial\theta_i$ is computed by
propagating error signals backward through the chain rule — every
intermediate node receives its "blame" and passes blame to its inputs.
Cost ≈ one extra forward pass; output = the full
$\nabla_\theta\mathcal{L}$ that `gradient-descent` consumes.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`ml-foundations` — the loop "loss → gradient → update" only exists
because backprop manufactures the gradient at tractable cost. Without it,
deep learning computes one partial derivative per parameter per step —
literally impossible at $10^{11}$ parameters.

## Teardown

1. **Chain rule, cached.** For $z = f(g(x))$: $\partial z/\partial x =
   f'(g(x))\,g'(x)$. Backprop stores each node's forward value, then
   multiplies local Jacobians backward — memoized differentiation.
2. **Reverse, not forward.** One output (the scalar `loss-l`) × millions
   of inputs ⇒ reverse mode wins: a single backward sweep produces *all*
   partials for ~2× forward cost, vs $N$ sweeps for forward mode.
3. **The computation graph.** Frameworks record ops as nodes (matmul,
   activation, norm); each knows its local derivative; autograd walks
   the DAG — you write forward code, the backward is free.
4. **Pathologies.** Repeated multiplication kills signals: sigmoid
   saturation → vanishing gradients; large weights → explosion —
   `residual-normalization` exists partly to keep the chain tame.
5. **Memory trade.** Backward needs forward activations — activation
   checkpointing re-computes them to fit bigger models
   (`distributed-training` budgets this).

## Worked example

$z = w x$ then $\mathcal{L} = (z - y)^2$, $x = 2, y = 1, w = 3$:

- Forward: $z = 6$, $\mathcal{L} = 25$.
- Backward: $\partial\mathcal{L}/\partial z = 2(z-y) = 10$;
  $\partial z/\partial w = x = 2$ → $\partial\mathcal{L}/\partial w = 20$.
- One backward sweep gives the update $w \leftarrow 3 - \eta\cdot20$ —
  same answer as symbolic differentiation, at graph-walk cost.

## Sources

- Rumelhart, Hinton & Williams, *Learning representations by
  back-propagating errors*, Nature 1986 — the popularization
- Linnainmaa, 1970 / Werbos, 1974 — earlier reverse-mode history
- Baydin et al., *Automatic Differentiation in ML: a Survey* —
  [arXiv:1502.05767](https://arxiv.org/abs/1502.05767)
- 3Blue1Brown ch.3 — [youtu.be/Ilg3gGewQ5U](https://www.youtube.com/watch?v=Ilg3gGewQ5U)

## Open questions

- Is there a biologically plausible credit-assignment rule that
  backprop approximates? — neuroscience/ML crossover, still open.
