---
id: expert-routing
title: Expert routing
notation: [gate-g, softmax-sym]
---

## Statement

The mechanism choosing which experts see each token: a small linear
layer produces `gate-g` scores over $E$ experts, `softmax` normalizes,
top-$k$ winners run and their outputs mix weighted by the gate. Making
that discrete choice differentiable — gate scores act as output
weights — plus keeping the load balanced is the entire difficulty of
`mixture-of-experts`.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`mixture-of-experts` — every MoE paper is mostly a routing paper: the
expert FFNs are copies of a known quantity; the router decides whether
sparsity is a win or a collapse onto one expert.

## Teardown

1. **Top-k gating.** Scores → softmax → keep top-$k$ (Switch: $k{=}1$;
   Mixtral: $k{=}2$; DeepSeek: $k{=}8$ of 256) — output is the
   gate-weighted sum of expert outputs; gradients flow via the weights.
2. **Load balancing.** Without intervention tokens pile onto early
   winners (rich-get-richer). Fixes: auxiliary load-balance loss
   (Switch), expert-choice routing, aux-loss-free bias adjustment
   (DeepSeek-V3's scheme).
3. **Capacity factor.** Per-expert token cap $\times$ buffer: overflow
   tokens are dropped (residual passthrough) — a silent quality leak.
4. **Shared/fine-grained experts.** Always-on shared expert handles
   common structure (DeepSeek); many small experts give finer
   specialization — current design frontier.
5. **Sequence vs token routing.** AuxFree/stable routing, hashing, and
   learned "expert domains" — alternatives when learned routing
   oscillates.

## Worked example

8 experts, gate logits $[2.1, 0.3, -0.5, 1.8, 0.1, -1, 0.7, 0.2]$, $k=2$:

- Top-2: experts 0 and 3 → softmax over just those: weights
  $\approx [0.57, 0.43]$ — output $= 0.57\,E_0(x) + 0.43\,E_3(x)$.
- If every token picks expert 0, its capacity overflows while experts
  1–7 idle: the aux loss punishes exactly this skew.

## Sources

- Shazeer et al. — [arXiv:1701.06538](https://arxiv.org/abs/1701.06538)
- Fedus et al., Switch (top-1 + aux loss) —
  [arXiv:2101.03961](https://arxiv.org/abs/2101.03961)
- DeepSeek-AI V3 (aux-loss-free balancing) —
  [arXiv:2412.19437](https://arxiv.org/abs/2412.19437)
- Zhou et al., expert-choice routing — [arXiv:2202.09368](https://arxiv.org/abs/2202.09368)

## Open questions

- Is learned routing converging to semantic partitions or just
  balanced hash tables? — open `interpretability` question.
