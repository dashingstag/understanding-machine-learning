---
id: mixture-of-experts
title: Mixture of experts
notation: [gate-g, weights-theta, n-params, flop]
---

## Statement

Replace the dense `feedforward-layer` with $E$ expert FFNs plus a
learned `gate-g` router that sends each token to the top-$k$ experts —
`moe-layer`. Parameters grow ~$E\times$ while per-token compute stays
flat: capacity without proportional `flop` cost. Switch Transformer,
Mixtral, DeepSeek-V3 and most frontier open models are MoE.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — MoE set the price/performance curve of the
whole field: Mixtral-8×7B-quality on ~13B activated params changed what
"small" means, and DeepSeek-V3's MoE recipe reset expectations of
open-model capability. Sparsity is the main trick `scaling-laws` didn't
see coming.

## Teardown

1. **The swap.** Dense FFN → $E$ expert FFNs (same shape) + router.
   Per token: gate → top-$k$ experts → weighted sum — `moe-layer`.
2. **The router problem.** `expert-routing`: softmax gates over experts,
   top-$k$ keep — discrete choice made differentiable by scaling the
   expert output by the gate score.
3. **Load balancing.** Tokens flock to favourite experts → auxiliary
   loss penalizing skew (Switch), or bias-free balancing (DeepSeek's
   router aux-loss-free trick).
4. **Capacity factor.** Tokens-per-expert cap: overflow tokens are
   dropped/bypassed — the memory-compute bargain's ugly edge.
5. **Why it works.** Specialization emerges (code expert, math expert —
   though routing isn't cleanly semantic); sparse activation keeps
   inference cheap: `inference-efficiency` loves it, memory doesn't
   (all experts must be resident).
6. **Variants.** Shared experts (one always-on), fine-grained experts
   (many small), expert-choice routing — the 2024+ design space.

## Worked example

Mixtral 8×7B: $E = 8$ experts, top-$k = 2$ per token.

- Total FFN params ≈ 8× dense; activated per token ≈ 2/8 = 25% — 
  47B total, ~13B activated: dense-13B speed, 47B capacity.
- DeepSeek-V3 pushes further: 256 routed + 1 shared expert per layer,
  top-8 → 671B total, 37B activated — the recipe that made an open
  model trade punches with frontier closed ones.

## Sources

- Shazeer et al., *Outrageously Large Neural Networks* —
  [arXiv:1701.06538](https://arxiv.org/abs/1701.06538)
- Fedus et al., Switch Transformer — [arXiv:2101.03961](https://arxiv.org/abs/2101.03961)
- Jiang et al., Mixtral — [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)
- DeepSeek-AI, V3 technical report —
  [arXiv:2412.19437](https://arxiv.org/abs/2412.19437)

## Open questions

- Do experts specialize semantically or just statistically? —
  `interpretability` meets routing; evidence is mixed.
- Fine-grained + shared expert designs vs classic top-k — the open
  architecture frontier.
