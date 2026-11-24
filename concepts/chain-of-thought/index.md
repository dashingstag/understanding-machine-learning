---
id: chain-of-thought
title: Chain-of-thought
notation: [logits-z]
---

## Statement

Generating intermediate reasoning steps as tokens before the final
answer — "let's think step by step". Functionally it's working memory:
a transformer can't store intermediate products between layers, but it
can write them as tokens and read them back through
`attention-mechanism`. The substrate `reasoning-models` are trained to
produce, extend and improve.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`reasoning-models` — test-time compute only exists because the model can
spend tokens on intermediate steps; the chain is the currency that axis
spends. Also the least-trained capability in the stack: discovered by
prompting, industrialized by RL.

## Teardown

1. **The mechanism.** Each generated token re-enters the context —
   self-produced working memory; the KV cache becomes the scratchpad.
2. **Prompting discovery.** Wei et al. 2022: few-shot traces →
   arithmetic jumps ~3×; zero-shot "step by step" (Kojima et al.)
   showed it's latent, not learned from the examples.
3. **Self-consistency.** Wang et al.: sample k chains, majority-vote —
   cheap ensembling over reasoning paths.
4. **Faithfulness problem.** Turpin et al. 2023: traces can
   post-rationalize — the written chain isn't guaranteed to be the real
   computation (relevant to `interpretability`).
5. **From prompt to policy.** `reasoning-models` bake CoT in via RL —
   long hidden traces, backtracking, verification emerge as trained
   behaviour, not prompt tricks.

## Worked example

"A café has 23 apples, buys 2 crates of 12, uses 20." 

- Direct: often wrong — one forward pass can't hold $23 + 24 - 20$'s intermediate.
- CoT: "23 + 24 = 47; 47 − 20 = 27" — each product is written to the context where the next step can attend to it. The chain isn't explanation; it's storage.

## Sources

- Wei et al. — [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)
- Kojima et al., zero-shot CoT — [arXiv:2205.11916](https://arxiv.org/abs/2205.11916)
- Wang et al., self-consistency — [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)
- Turpin et al., *LMs Don't Always Say What They Think* —
  [arXiv:2305.04388](https://arxiv.org/abs/2305.04388)

## Open questions

- Faithful-by-construction traces (latent reasoning, verified chains)
  vs post-hoc rationalization — the open safety question.
