---
id: interpretability
title: Interpretability and safety
notation: [weights-theta, embed-e, logits-z]
---

## Statement

Reverse-engineering what a trained model computes: `probing` (does a
layer encode property X), `sparse-autoencoders` (decompose activations
into named features), `activation-steering` (edit behaviours by adding
directions mid-forward-pass), and the residual-stream lens from
`residual-normalization`. "Mechanistic" = causal claims about circuits,
not correlations.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — we deploy systems we cannot yet audit:
understanding what a model actually computes is the long-term route to
trusting it, and it takes the whole stack as its subject — attention
heads (`attention-mechanism`), FFN storage (`feedforward-layer`), the
stream (`residual-normalization`), the head (`unembedding`).

## Teardown

1. **The problem.** Neurons are superposed — one unit fires on French
   text AND code AND parentheses; polysemanticity defeats naive
   neuroscience.
2. **Probing.** `probing`: train a linear classifier on activations —
   "does layer 12 encode tense?" Cheap, correlational, the oldest
   instrument.
3. **SAEs.** `sparse-autoencoders`: dictionary-learn features over the
   activations — sparse codes disentangle superposition into
   nameable features (Golden Gate Claude's famous feature).
4. **Steering.** `activation-steering`: add a feature direction to the
   residual stream → behaviour changes; the causal test of
   interpretability claims.
5. **Circuits.** Attention-head programs (induction heads: copy
   previous-pattern) — the micro-mechanisms behind macro behaviour;
   Transformer Circuits thread.
6. **Safety stakes.** Alignment faking, deceptive CoT, unfaithful
   reasoning (`chain-of-thought` faithfulness) — interpretability is
   where these become checkable claims rather than vibes.

## Worked example

Induction head (Olsson et al. 2022): pattern `[A][B] … [A]` → head
attends from second `[A]` to the token after first `[A]` = `[B]` —
in-context learning's micro-mechanism, causally verified by ablation:
kill the head, ICL scores drop.

## Sources

- Olah et al., Transformer Circuits thread — transformer-circuits.pub
- Olsson et al., *In-context Learning and Induction Heads* —
  [arXiv:2209.11895](https://arxiv.org/abs/2209.11895)
- Cunningham et al., SAEs — [arXiv:2309.08600](https://arxiv.org/abs/2309.08600)
- Templeton et al., *Scaling Monosemanticity* —
  transformer-circuits.pub/2024/scaling-monosemanticity
- Turner et al., steering vectors — [arXiv:2308.10248](https://arxiv.org/abs/2308.10248)

## Open questions

- Can interpretability scale to the frontier (100B+ models, long
  contexts) — or does it stay a small-model science?
- Causal faithfulness: do SAE features correspond to real mechanisms
  or post-hoc readouts? — the field's deepest open question.
