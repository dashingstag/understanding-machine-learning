---
id: agent-loop
title: The agent loop
notation: [loss-l]
---

## Statement

The control cycle that makes a model an agent: perceive (read context +
fresh tool results) → plan (reason about the next move, often as
`chain-of-thought`) → act (emit a `tool-calling` call) → observe (result
appended as tokens) → repeat until the task's stop condition. The state
of the machine is the context window itself.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`agents-and-tool-use` — the loop is the concept; everything else is
tooling or training that serves it. Its reliability is governed by
per-step success compounding — the arithmetic that bounds agentic
horizons.

## Teardown

1. **Perceive.** Context = task + history + latest observation; context
   management (compaction, scratchpad) decides what's still in view.
2. **Plan.** Next move as tokens — ReAct's "Thought:" channel; in
   `reasoning-models`, hidden traces play this role.
3. **Act.** One or more tool calls — the only phase that touches the
   world; everything else is tokens moving inside.
4. **Observe.** Results appended; errors included — a good loop treats
   failures as data to re-plan on, not crashes.
5. **Compounding math.** Per-step success $s$ over $n$ steps gives
   end-to-end $\sim s^n$ — the reason long-horizon tasks are hard and
   why verification checkpoints are the standard fix.
6. **Stopping.** Termination criteria, budgets, human checkpoints —
   unbounded loops are a cost and a safety problem.

## Worked example

Per-step accuracy $s = 0.95$:

- 10-step task: $0.95^{10} \approx 60\%$ end-to-end.
- 50 steps: $\approx 8\%$ — the same model, same tools. Horizon length,
  not capability, is the usual bottleneck; retries/verification change
  the exponent's base.

## Sources

- Yao et al., ReAct — [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- Park et al., generative agents — [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)
- Significant Gravitas, AutoGPT (2023) — the pattern's popularization
- Wang et al., Voyager (skill-library agent) —
  [arXiv:2305.16291](https://arxiv.org/abs/2305.16291)

## Open questions

- Reliable self-verification — an agent checking its own work is the
  same `verifiable-rewards` problem at system level.
