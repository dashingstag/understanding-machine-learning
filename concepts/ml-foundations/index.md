---
id: ml-foundations
title: ML foundations
notation: [weights-theta, loss-l, learning-rate, gd-update]
---

## Statement

Machine learning, reduced to five working claims:

1. A **model** is a parameterized function $f_\theta$: input sequence in,
   probability distribution out. $\theta$ is all learned weights
   (`weights-theta`).
2. **Learning** is minimizing a scalar `loss-l` $\mathcal{L}(\theta)$ over
   `training-data` — one number that says how wrong the model is.
3. The update is `gd-update`: step opposite the gradient, scaled by
   `learning-rate` $\eta$.
4. The gradient comes from `backpropagation` — the chain rule run backward
   through the computation graph.
5. **Generalization** — performance on data never seen — is the only score
   that counts.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` is a map of systems; this node is the physics.
Every other concept's teardown lands here — attention's Q/K/V are learned
weights, RLHF's objective is still a loss, MoE's router is still trained by
backprop. Without the foundations, the rest of the map is a parts list with
no mechanism.

## Teardown

1. **Function.** A neural network is layers of affine maps plus
   nonlinearities — `feedforward-layer`, `transformer-architecture` are the
   specific shapes. In principle such stacks compute anything
   (`universal-approximation`), though depth and data decide what is
   practical.
2. **Loss.** The task becomes one scalar — `cross-entropy` for language
   models. Loss design *is* model design: predict noise
   (`ddpm-loss`), match preferences (`dpo-loss`).
3. **Descent.** `gradient-descent`: compute $\nabla_\theta \mathcal{L}$,
   step by $-\eta\nabla$. `optimizers` (momentum, Adam) are the real-world
   versions.
4. **Backprop.** `backpropagation` — recursive chain rule; gives every
   parameter's partial derivative for the cost of ~2 forward passes.
5. **Fitting vs generalizing.** The model can memorize or generalize;
   `evaluation` is how we tell which happened; `double-descent` is the
   modern complication of that picture.

## Worked example

One gradient step by hand. Model $f(x) = wx$, loss
$\mathcal{L} = (wx - y)^2$ on the single point $(x, y) = (2, 6)$, starting
$w = 0$, $\eta = 0.25$:

- $\nabla_w \mathcal{L} = 2(wx - y)\cdot x = 2(0 - 6)\cdot 2 = -24$
- $w \leftarrow 0 - 0.25 \cdot (-24) = 6$ — the update lands exactly on the
  best $w$ for this one point because the loss is quadratic.

Change $\eta$ to $0.6$: $w \leftarrow 0 - 0.6 \cdot (-24) = 14.4$, then the
next gradient $2(28.8 - 6)\cdot 2 = 91.2$ — oscillation into divergence.
Same mechanics, toy numbers: the step-size drama on the `gradient-descent`
page is already here in one line.

## Sources

- Goodfellow, Bengio, Courville, *Deep Learning* (2016), ch. 2–8 —
  [deeplearningbook.org](https://www.deeplearningbook.org/)
- Rumelhart, Hinton, Williams, *Learning representations by
  back-propagating errors*, Nature 1986
- Rosenblatt, *The perceptron*, Psychological Review 1958
- Karpathy, *Neural Networks: Zero to Hero* —
  [karpathy.ai/zero-to-hero](https://karpathy.ai/zero-to-hero.html)
- Ng, CS229 lecture notes —
  [cs229.stanford.edu](https://cs229.stanford.edu/)

## Open questions

- Why do grotesquely overparameterized networks generalize at all?
  (`double-descent`, `emergent-abilities`)
- What does the loss landscape actually look like at scale — and why is
  SGD+Adam's implicit bias what it is?
- Where is the clean theoretical account of in-context learning? — belongs
  to `interpretability`.
