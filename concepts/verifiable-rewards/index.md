---
id: verifiable-rewards
title: Verifiable rewards
notation: [reward-r, pi-policy, kl-div]
---

## Statement

RL where the reward comes from a checker, not a learned model: exact-
match math answers, passing unit tests, formal proof acceptance, game
outcomes. `reward-r` becomes ground truth — unhackable, dense, and
cheap — and `rlhf`-style optimization (usually GRPO) can push
`pi-policy` hard without `goodhart-law` biting.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`reasoning-models` — long `chain-of-thought` is only improvable where
correctness is cheap to verify. Verifiability is the enabling condition
of the whole test-time-compute era and the boundary it currently stops
at.

## Teardown

1. **The checker.** Math: exact/graded match (GSM, MATH); code: unit
   tests + hidden tests; formal: Lean/Coq acceptance — binary or graded
   signal, no model in the loop.
2. **Why it resists hacking.** A reward model's blind spots don't exist
   when the reward is a test — the optimization target is the real
   thing, so `rlhf`'s over-optimization problem mostly evaporates.
3. **GRPO.** Group-relative advantage: sample $k$ solutions per problem,
   normalize `reward-r` within the group — no value network needed;
   DeepSeek-R1's engine.
4. **Process vs outcome.** Outcome reward (final answer only) is cheap;
   process rewards (per-step scores, Lightman et al.) give denser signal
   but reintroduce a learned, hackable scorer.
5. **The frontier problem.** Most valuable domains (essays, strategy,
   science) lack checkers — the field is extending verification via
   rubric judges, self-consistency, and learned critics.

## Worked example

Math problem, $k = 8$ sampled solutions, GRPO:

- 5 correct (reward 1), 3 wrong (reward 0) → advantages: correct
  $+0.6$, wrong $-1.0$ after group normalization.
- The policy is pushed toward whatever the 5 did — including a 12-step
  chain with a self-check nobody trained. That trace behaviour is
  *discovered by the reward shape*, which is the deep point.

## Sources

- DeepSeek-AI, R1 — [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)
- Shao et al., GRPO — [arXiv:2402.03300](https://arxiv.org/abs/2402.03300)
- Lightman et al., *Let's Verify Step by Step* —
  [arXiv:2305.20050](https://arxiv.org/abs/2305.20050)
- Lambert et al., *Tulu 3* — [arXiv:2411.15124](https://arxiv.org/abs/2411.15124)

## Open questions

- Reward shaping for unverifiable domains without re-opening the
  Goodhart wound — the field's current bottleneck.
