---
id: post-training
title: Post-training and alignment
notation: [reward-r, pi-policy, kl-div, beta, loss-l]
---

## Statement

Everything after `pretraining` that turns a base model into a product:
`sft` (imitation on demonstrations), `reward-models` (a learned proxy
for preference), `rlhf` (RL against that proxy — the `rlhf-obj`
objective), `dpo` (closed-form preference loss, `dpo-loss`), and
`verifiable-rewards` RL (the `reasoning-models` recipe). Each stage
trades `pi-policy` distance from the base model for desired behaviour.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — a raw base model is unusable: it completes
text, doesn't follow instructions, and learned every toxicity of its
corpus. Post-training installs instruction-following, style, refusals
and reasoning habits — the difference between "a model" and "an
assistant".

## Teardown

1. **SFT.** `sft` — supervised fine-tuning on curated demonstrations;
   installs format and basic helpfulness; every later stage assumes it.
2. **Preference data.** Humans rank pairs of completions — the raw
   signal alignment actually optimizes.
3. **Reward model.** `reward-models` — a classifier trained to predict
   human preference; the scalable stand-in for the rater.
4. **RLHF.** `rlhf` — PPO maximizes `reward-r` minus `kl-div` to the SFT
   policy (`beta` controls drift) — `rlhf-obj`.
5. **DPO.** `dpo` — skips the reward model entirely: the closed-form
   `dpo-loss` optimizes preferences directly off pairs.
6. **RL on verifiable rewards.** `verifiable-rewards` — where answers are
   checkable (math, code, tests), RL trains on ground truth — the
   `reasoning-models` pipeline (GRPO-family).
7. **Failure modes.** `goodhart-law`: reward hacking, sycophancy,
   mode collapse, "alignment tax" on capability.

## Worked example

One preference pair: prompt $x$, chosen $y_w$, rejected $y_l$.

- RM training: Bradley–Terry — maximize $\log \sigma(r(x,y_w) - r(x,y_l))$;
  a 1.5-point reward gap between two answers is all the signal needed.
- DPO on the same pair: increase $\log \pi(y_w|x) - \log \pi(y_l|x)$
  relative to the frozen reference — same signal, no RM, no sampling.

## Sources

- Ouyang et al., *InstructGPT* — [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Christiano et al., *Deep RL from Human Preferences* —
  [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)
- Rafailov et al., *DPO* — [arXiv:2305.18290](https://arxiv.org/abs/2305.18290)
- Bai et al., *Constitutional AI* — [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)
- Ziegler et al., *Fine-Tuning LMs from Human Preferences* —
  [arXiv:1909.08593](https://arxiv.org/abs/1909.08593)

## Open questions

- Scalable oversight: aligning models on tasks humans can't verify —
  the open problem everything else routes around.
- Alignment tax vs tax-free alignment: does RLHF measurably reduce
  base-model capability, and can better objectives avoid it?
