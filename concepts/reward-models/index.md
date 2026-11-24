---
id: reward-models
title: Reward models
notation: [reward-r, kl-div, loss-l]
---

## Statement

A learned scalar proxy for human preference: a (usually transformer)
head trained on pairwise rankings via Bradley–Terry —
$\mathcal{L}_{RM} = -\log \sigma(r(x, y_w) - r(x, y_l))$. In `rlhf`,
the `reward-r` it outputs *is* the environment; `dpo` shows the same
signal can be used without building the model at all.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`post-training` — humans can't score the millions of samples RL needs;
the RM is the scalable stand-in for "a person liked this". Every
`goodhart-law` failure in alignment — hacking, sycophancy, verbosity
bias — is a reward-model flaw being optimized.

## Teardown

1. **Pairwise > absolute.** Raters agree more on "which is better" than
   on scores — Bradley–Terry converts rankings to a scalar via the
   logistic difference.
2. **Architecture.** Usually the SFT model minus the LM head plus a
   scalar head — it reads completions, not generates them.
3. **Calibration tricks.** Ensemble RMs, margin regularization,
   out-of-distribution penalty terms — all patches on the same wound:
   the RM is only valid near its training distribution.
4. **Reward hacking.** The policy exploits RM blind spots: length
   inflation, sycophancy, formatting tells — mitigated by `kl-div`
   penalty to the SFT policy (`beta`), never eliminated.
5. **Generative/verifiable alternatives.** `verifiable-rewards` where
   checkable; rubric-scored judges (`llm-as-judge`) elsewhere; RM is
   the middle ground for fuzzy human taste.

## Worked example

RM score spread: chosen $r = 2.1$, rejected $r = -0.4$ on prompt $x$.

- Pair loss contribution: $-\log\sigma(2.1 - (-0.4)) = -\log\sigma(2.5) \approx 0.078$ — already confident.
- If the policy finds an exploit producing $r = 8$ on gibberish, nothing in the RM stops it — the KL leash and OOD penalties are the only brakes. That's reward hacking in one number.

## Sources

- Christiano et al., deep RL from human preferences —
  [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)
- Ouyang et al., InstructGPT — [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Gao et al., *Scaling Laws for Reward Model Overoptimization* —
  [arXiv:2210.10760](https://arxiv.org/abs/2210.10760)
- Bradley & Terry 1952 — the ranking model itself

## Open questions

- Process reward models (step-level scores) vs outcome RMs — which
  resists hacking better at `reasoning-models` scale?
- Can RMs be made to say "I don't know" on OOD inputs? — the
  Goodhart-robustness question.
