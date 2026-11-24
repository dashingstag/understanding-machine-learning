---
id: unembedding
title: Unembedding and logits
notation: [unembed-w, logits-z, softmax-sym, vocab, temperature]
---

## Statement

The output head: $\mathbf{z} = \mathbf{h}_L \mathbf{W}_U^\top \in
\mathbb{R}^{|\mathcal{V}|}$ turns the final hidden state into
`logits-z` over the `vocab`-sized vocabulary; `softmax` turns logits
into a distribution; `temperature` and top-p/top-k shape sampling. In
weight-tied models $\mathbf{W}_U$ is the `embed-e` table transposed —
logits are literally similarity scores.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` — the entire stack exists to produce this one
score vector: `next-token-prediction` trains on it, and every token ever
generated was sampled from it. It's also the cheapest interpretability
tool: "logit lens" reads intermediate states through the same head.

## Teardown

1. **One matmul.** $\mathbf{h}_L$ (size `d-model`) ×
   `unembed-w` ($|\mathcal{V}| \times d$) → `logits-z`: one score per
   vocabulary item — a ~33M-row matmul for a 50k vocab.
2. **Weight tying.** Input table and output head shared: halves that
   slice of `n-params`, and makes "the model prefers tokens similar to
   its final state" literally true.
3. **From scores to tokens.** `softmax` normalizes; argmax = greedy,
   `temperature` reshapes (τ→0: greedy; τ→∞: uniform), top-p/top-k
   truncate the tail — decode policy lives here
   (`inference-efficiency`).
4. **Logit lens.** Project *any* layer's hidden state through
   $\mathbf{W}_U$: you see the model's "current guess" crystallize layer
   by layer — a standard `interpretability` probe.
5. **Vocabulary quirks surface here.** Multi-token numbers, split words —
   `tokenization` artefacts become logit-space artefacts.

## Worked example

$d = 4$ state $\mathbf{h} = [1, 0, 0.5, -0.5]$, three candidate
unembedding rows: cat $[0.9, 0.1, 0.4, -0.4]$, dog $[0.2, 0.8, 0.1, 0]$,
the $[0, 0, 1, 1]$.

- $z_{cat} = 0.9 + 0 + 0.2 + 0.2 = 1.3$; $z_{dog} = 0.2$; $z_{the} = 0$.
- Softmax(τ=1): $p_{cat} = e^{1.3}/(e^{1.3}+e^{0.2}+1) \approx 3.67/5.9 \approx 0.62$.
- τ=2: exponents halve → $p_{cat} \approx 0.48$ — flatter; τ=0.5: $\approx 0.83$ — sharper. One matmul, one dial.

## Sources

- Vaswani et al. (tied embeddings) — [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Press & Wolf, *Using the Output Embedding to Improve Language Models* —
  [arXiv:1608.05859](https://arxiv.org/abs/1608.05859)
- nostalgebraist, *interpreting GPT: the logit lens* (blog, 2020)
- Holtzman et al., *The Curious Case of Neural Text Degeneration*
  (nucleus sampling) — [arXiv:1904.09751](https://arxiv.org/abs/1904.09751)

## Open questions

- Logit-lens readings suggest mid-layer states already "know" the answer —
  what do late layers still add? — `interpretability` open thread.
