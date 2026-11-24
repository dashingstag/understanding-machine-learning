---
id: reasoning-models
title: Reasoning and test-time compute
notation: [loss-l, compute-c, reward-r]
---

## Statement

Models trained to produce long internal `chain-of-thought` traces —
thousands of tokens of scratchpad before answering — and rewarded via
RL on `verifiable-rewards` (correct math, passing tests). The result is
a second scaling axis: `compute-c` spent at inference buys accuracy
that parameter scale alone didn't reach. o1/R1-class systems are the
existence proof.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — the 2025–26 capability frontier runs on
inference-time compute, not just bigger `pretraining`: "thinking" modes
trade latency and token cost for accuracy on math, code and science —
a new dial on `scaling-laws` and a new pricing axis in
`inference-efficiency`.

## Teardown

1. **CoT as scratchpad.** `chain-of-thought`: intermediate steps
   externalize working memory — attention alone can't store
   intermediate products.
2. **From prompting to training.** Wei et al. prompted it; o1/R1 trained
   it — RL on verifiable outcomes discovers *which* trace habits pay
   (backtracking, verification, decomposition).
3. **Verifiability as the gate.** `verifiable-rewards`: only domains
   with cheap checkers (math, code, formal proofs) admit dense RL
   signal — the enabling condition and the current boundary.
4. **Test-time scaling laws.** Accuracy vs reasoning-tokens is law-like
   (log-linear over ranges) — "think longer" is a real, purchasable axis.
5. **Cost and control.** Traces cost tokens+time, leak into pricing;
   hidden-CoT debates (faithfulness — does the trace show the real
   computation?) feed `interpretability` and `agents-and-tool-use`.

## Worked example

o1-style budget arithmetic (illustrative): GSM-style problem, direct
answer ~60% for a strong base model; 500 reasoning tokens → ~85%; best-
of-4 500-token traces → ~93%.

- The same weights, no new `pretraining` — the delta is entirely spent
  `flop`s at inference. The "reasoning scaling curve" is that accuracy-
  vs-tokens line.

## Sources

- Wei et al., CoT — [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)
- DeepSeek-AI, *R1* — [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)
- Snell et al., *Scaling LLM Test-Time Compute* —
  [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
- Lightman et al., *Let's Verify Step by Step* —
  [arXiv:2305.20050](https://arxiv.org/abs/2305.20050)
- Shao et al., GRPO — [arXiv:2402.03300](https://arxiv.org/abs/2402.03300)

## Open questions

- Verifiability frontier: extending dense rewards to non-checkable
  domains (writing, strategy, science) — rubric judges, process RMs or
  self-consistency?
- Faithfulness: does the visible trace reflect the real computation? —
  Turpin et al. showed it often doesn't; safety stakes in
  `interpretability`.
