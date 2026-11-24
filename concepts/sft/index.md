---
id: sft
title: Supervised fine-tuning (SFT)
notation: [loss-l, weights-theta]
---

## Statement

Stage one of `post-training`: continue `next-token-prediction` training
on a small curated set of (instruction, ideal-response) demonstrations —
typically 10³–10⁵ examples. Same `cross-entropy` machinery, new
distribution: the model learns chat format, tone, and the
assistant/refusal boundary.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`post-training` — preference stages (RLHF/DPO) shape *which* good
response is produced; SFT installs the response format itself. It's also
the cheapest capability lever known: LIMA showed ~1,000 top-quality
examples can surface competence a base model already had.

## Teardown

1. **Format over facts.** SFT mainly teaches *how to respond* — style,
   structure, role tokens — not new knowledge; hallucinations often
   trace to it teaching the model to *answer* rather than say "I don't
   know" (Gekhman et al. 2024).
2. **Data.** Human demonstrations (InstructGPT: contractor-written) or
   distilled teacher outputs (Alpaca-style self-instruct); quality ≫
   quantity.
3. **Chat markup.** Special tokens (`<|im_start|>`, roles) are trained
   here — the control channel `tool-calling` and
   `agents-and-tool-use` reuse.
4. **Continual-learning tension.** Fine-tuning drifts from base
   capabilities; mitigations: low LR, few epochs, KL-anchored losses —
   the "alignment tax" debate.

## Worked example

LIMA (Zhou et al. 2023): 65B model + 1,000 curated examples beat
crowd-favourite Alpaca (52k distilled examples) on helpfulness — the
canonical "less is more" datapoint for SFT quality.

## Sources

- Ouyang et al., InstructGPT — [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Zhou et al., *LIMA: Less Is More for Alignment* —
  [arXiv:2305.11206](https://arxiv.org/abs/2305.11206)
- Taori et al., *Alpaca* (self-instruct distillation) — Stanford CRFM 2023
- Gekhman et al., *Does Fine-Tuning LLMs on New Knowledge Encourage
  Hallucinations?* — [arXiv:2405.05904](https://arxiv.org/abs/2405.05904)

## Open questions

- Can SFT teach "I don't know" without suppressing real answers? —
  calibration-through-demonstration is unresolved.
