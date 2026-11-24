---
id: rlhf
title: RLHF (RL from human feedback)
notation: [reward-r, pi-policy, kl-div, beta]
---

## Statement

Reinforcement learning that treats the `reward-models` score as the
environment and the language model as the `pi-policy`: maximize
`rlhf-obj` — expected reward minus `kl-div` to the frozen SFT policy,
weighted by `beta`. Historically PPO; newer runs use GRPO-style group
baselines.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`post-training` — SFT imitates good answers; RLHF optimizes "preferred"
directly — the difference that made chat assistants refuse, hedge and
follow. It's also the canonical `goodhart-law` arena: optimize a proxy
hard enough and it stops measuring what you meant.

## Teardown

1. **The loop.** Sample completions from `pi-policy` → score with RM →
   PPO/GRPO ascent with KL leash to the SFT anchor.
2. **The KL term.** Without it the policy drifts to RM exploits and
   loses fluency — `beta` is the single dial between alignment and
   capability drift (the "alignment tax" knob).
3. **PPO.** Actor–critic: value network estimates baselines, clipped
   updates keep steps safe — works, but 4 models in memory
   (policy, ref, RM, critic) is heavy.
4. **GRPO.** Drop the critic: normalize reward within a group of samples
   per prompt — the DeepSeek-R1/`verifiable-rewards` default.
5. **Reward hacking.** Over-optimization curve: true quality peaks then
   falls while RM score keeps rising (Gao et al. 2023) — the empirical
   Goodhart curve every run must watch.

## Worked example

$\beta$ as the alignment dial (Gao et al., scaling laws for RM
overoptimization): at $\beta$ too small, RM score ↑ 40% but human-rated
quality ↓ after ~400 PPO steps — the policy writes longer, more
confident answers the RM over-rewards. $\beta$ too large: no learning
at all. The useful regime is a narrow middle.

## Sources

- Ouyang et al., InstructGPT — [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Schulman et al., PPO — [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)
- Gao et al., reward overoptimization — [arXiv:2210.10760](https://arxiv.org/abs/2210.10760)
- Shao et al., *DeepSeekMath/GRPO* — [arXiv:2402.03300](https://arxiv.org/abs/2402.03300)
- Christiano et al., 2017 — [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)

## Open questions

- Beyond pairwise preference: can RLHF encode "be honest" and "be
  harmless" without also encoding "be boring/sycophantic"? — the
  constitutional-AI and pluralistic-alignment research fronts.
