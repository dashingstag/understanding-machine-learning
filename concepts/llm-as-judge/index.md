---
id: llm-as-judge
title: LLM-as-judge
notation: [loss-l]
---

## Statement

Using a language model to grade another model's outputs — pairwise
preference, rubric scores, or pass/fail — where no answer key exists.
The scalable evaluator `evaluation` leans on for open-ended tasks
(chat quality, agent trajectories, safety refusals), with documented
biases: verbosity, position, self-preference, format favouritism.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`evaluation` — most valuable behaviours can't be checked by string
match; a judge model is how they get graded at all. Its biases set the
noise floor of every open-ended benchmark result and are a
`goodhart-law` surface: models get tuned to please the judge.

## Teardown

1. **Modes.** Pairwise (which answer is better — position-swapped to
   cancel order bias), rubric score (1–10 on defined criteria), and
   G-Eval-style (grade against a checklist of steps).
2. **Known biases.** Position bias (first/second swap changes
   verdicts), verbosity bias (longer wins), self-preference (judges
   favour their own family), and authority mimicry (confident tone
   beats correct hedging).
3. **Calibration.** Judge vs human agreement is the reported metric —
   ~80% on MT-Bench-class tasks; lower on technical correctness where
   the judge can't verify claims.
4. **Judge drift.** Same judge, different versions → different
   rankings — results are only comparable under a pinned judge, prompt
   and protocol (the reproducibility requirement).
5. **Meta-risk.** Training against the judge bakes its taste into the
   model — eval-judge and training-judge circularity is a real
   contamination-adjacent worry.

## Worked example

MT-Bench-style pairwise grade: answer A (concise, correct) vs B
(verbose, mostly correct):

- Judge picks B ~60% of the time — verbosity bias measured directly by
  shuffling order: if verdicts flip, the judge read length, not
  quality. Position swap + rubric anchoring is the standard mitigation.

## Sources

- Zheng et al., MT-Bench/judging LLM judges —
  [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)
- Liu et al., G-Eval — [arXiv:2303.16634](https://arxiv.org/abs/2303.16634)
- Zheng et al., Arena (Elo rating) — same paper as above
- Bavaresco et al., *LLMs instead of Human Judges? A Large Scale
  Empirical Study* — [arXiv:2406.18403](https://arxiv.org/abs/2406.18403)

## Open questions

- Judge ensembles/rubrics that reach >95% human agreement on technical
  domains — or is the ceiling set by what judges can themselves
  verify?
