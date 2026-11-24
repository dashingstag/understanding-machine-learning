---
id: embeddings
title: Embeddings
notation: [embed-e, cosine-s, vocab, d-model]
---

## Statement

An embedding is a learned dense vector $\mathbf{e}_i \in
\mathbb{R}^{d_{\text{model}}}$ that represents a discrete item — a token,
image patch, user, product. Two facts make it a concept rather than a
lookup table: (1) distances between vectors correlate with semantic
similarity (measured by `cosine`), and (2) directions in the space
correlate with semantic attributes — $\mathbf{e}_{king} - \mathbf{e}_{man}
+ \mathbf{e}_{woman} \approx \mathbf{e}_{queen}$.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`transformer-architecture` — tokens enter as embeddings and leave as logits
scored against embedding geometry (`unembedding`); without this step the
transformer has no input. `retrieval-augmented-generation` — the entire
index is an embedding space: retrieval is nearest-neighbour search over
`vector-search` of these vectors. Same object, two jobs.

## Teardown

1. **Lookup.** Token id $i$ selects row $\mathbf{e}_i$ of a
   $|\mathcal{V}| \times d$ table — part of `weights-theta`, learned by
   `gradient-descent` like everything else.
2. **Geometry.** `cosine` similarity turns "related" into a number; the
   famous word2vec analogies (`king − man + woman ≈ queen`, Mikolov et al.
   2013) made the geometry legible.
3. **Three ways they're trained.** (a) prediction — word2vec skip-gram;
   (b) `contrastive-learning` — CLIP pulls matching image/text pairs
   together; (c) in place — LLM embeddings learned end-to-end inside the
   stack, often tied to the output head.
4. **Beyond words.** Users, products, images (`contrastive-learning`),
   code — anything a model must compare or feed in.
5. **The output side.** The `unembedding` matrix $\mathbf{W}_U$ scores the
   final hidden state against vocabulary rows — often the same table
   transposed, which makes logits literal similarity scores.

## Worked example

Two-dim toy space: king $(0.9, 0.8)$, queen $(0.85, 0.9)$, apple
$(-0.7, 0.4)$.

- $\cos(\text{king}, \text{queen}) = \frac{0.9 \cdot 0.85 + 0.8 \cdot 0.9}
{\sqrt{0.9^2+0.8^2}\sqrt{0.85^2+0.9^2}} \approx \frac{1.485}{1.493} \approx 0.994$
- $\cos(\text{king}, \text{apple}) \approx \frac{-0.31}{1.14} \approx -0.27$

The analogy: $\mathbf{e}_{king} - \mathbf{e}_{man} + \mathbf{e}_{woman}$
points near $\mathbf{e}_{queen}$ — vector arithmetic doing lexical work.

## Sources

- Mikolov et al., *Efficient Estimation of Word Representations in Vector
  Space* (word2vec) — [arXiv:1301.3781](https://arxiv.org/abs/1301.3781)
- Pennington et al., *GloVe*, EMNLP 2014
- Radford et al., *Learning Transferable Visual Models From Natural
  Language Supervision* (CLIP) —
  [arXiv:2103.00020](https://arxiv.org/abs/2103.00020)
- Reimers & Gurevych, *Sentence-BERT* —
  [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)
- Muennighoff et al., *MTEB benchmark* —
  [arXiv:2210.07316](https://arxiv.org/abs/2210.07316)
- 3Blue1Brown ch.5, *Word embeddings* segment

## Open questions

- Are the directions real axes of meaning or a projection artefact? —
  belongs to `interpretability` and `probing`.
- Why do independently trained models learn nearly aligned spaces? —
  "platonic representation" hypothesis (Huh et al. 2024, arXiv:2405.07987).
