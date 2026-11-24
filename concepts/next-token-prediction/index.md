---
id: next-token-prediction
title: Next-token prediction
notation: [logits-z, softmax-sym, perplexity-s, loss-l]
---

## Statement

The pretraining objective: at every position $t$, the model's
`logits-z` are softmaxed into a distribution and scored by
`cross-entropy` against the true next token —
$\mathcal{L} = -\sum_t \log p_\theta(x_{t+1} \mid x_{\le t})$. One term,
trillions of times. `perplexity-s` ($e^{\mathcal{L}}$, see `ppl`) is the
readable score: effective vocabulary size the model is still confused
among.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`pretraining` — this is the entire training signal; everything else is
logistics. The surprising theorem of the field: a good enough density
estimator of text *becomes* capable — "predict the next word" compiles
grammar, facts and reasoning into `weights-theta`.

## Teardown

1. **Self-supervision.** The label is in the data — no humans annotate;
   the corpus is both input and answer key.
2. **Per-position supervision.** One sequence of length $n$ yields $n$
   training examples — the density that makes trillion-token corpora
   tractable.
3. **What it forces.** To predict well, the model must learn syntax,
   then facts, then discourse structure, then (at the frontier) latent
   reasoning steps — the objective is capability-neutral but demanding.
4. **Teacher forcing.** Training feeds *true* prefixes; generation feeds
   *its own* outputs — the exposure-bias gap behind compounding errors
   (`post-training` mitigates).
5. **Alternatives.** Masked prediction (BERT), span corruption (T5),
   diffusion objectives (`diffusion-models`) — next-token won for
   generation + scale; the comparison is why LLMs are decoders.

## Worked example

Sequence `the cat sat` → three supervised steps: given `the` predict
`cat`; `the cat` → `sat`; `the cat sat` → next.

- If $p(\text{cat}\mid\text{the}) = 0.3$: contribution $-\ln 0.3 \approx 1.20$.
- $p(\text{sat}\mid\text{the cat}) = 0.6$: $-\ln 0.6 \approx 0.51$.
- Mean loss ≈ 0.85 → perplexity $e^{0.85} \approx 2.3$ — the model is "choosing" among ~2.3 effective options.

## Sources

- Radford et al., *Improving Language Understanding by Generative
  Pre-Training* (GPT-1, 2018)
- Shannon, *Prediction and Entropy of Printed English* (1951) — the
  original framing
- Bengio et al., neural language model — [JMLR 2003]
- Kaplan et al. — [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)

## Open questions

- Does next-token training produce genuine world models or surface
  statistics? — the `interpretability` research thread; see also
  `emergent-abilities`.
