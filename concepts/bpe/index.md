---
id: bpe
title: Byte-pair encoding (BPE)
notation: [vocab]
---

## Statement

Greedy compression turned alphabet: start with the 256 bytes as tokens;
repeatedly merge the most frequent adjacent pair in the corpus into a new
token, ~$|\mathcal{V}| - 256$ times. Encoding applies the learned merge
list in order; decoding is a lookup. See
`tokenization`'s playback for the merges running on a toy string.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`tokenization` — BPE is the concrete mechanism behind GPT/Llama-family
vocabularies: the merge list *is* the tokenizer artifact. Its quirks
(word-initial vs mid-word variants, digit splitting) shape what
`next-token-prediction` can express.

## Teardown

1. **Training.** Count adjacent-pair frequencies over the corpus; merge
   argmax; repeat. Pure statistics — no model, no gradients.
2. **Byte-level base.** Starting from bytes (not unicode chars) makes any
   input encodable — no `UNK` token ever needed.
3. **Encoding.** Apply merges in learned order — deterministic, longest-
   match-style; "un" + "der" + "stand" + "ing" if those merges rank.
4. **Variants.** SentencePiece/Unigram chooses a probabilistic vocab;
   WordPiece merges by likelihood gain rather than raw count — same
   family, different scoring.
5. **Artefacts.** Merges learned on English split other languages
   worse; digits merge inconsistently → arithmetic operates on ragged
   chunks; casing creates duplicate tokens (`The`/` the`/`THE`).

## Worked example

Corpus: `aab aab aac` (counts).

- Pairs: `aa`×3, `ab`×2, `ac`×1 → merge `aa` → vocab {bytes, aa}.
- Now `aab aab aac`: pairs `aab`? — `aa`+`b` → merge `aab` next iteration.
- Result: `aab` is one token; `aac` splits as `aa`+`c` — merges encode corpus frequency, not meaning.

## Sources

- Sennrich et al., BPE for NMT — [arXiv:1508.07909](https://arxiv.org/abs/1508.07909)
- Gage, *A New Algorithm for Data Compression* (1994) — the original BPE
- Radford et al., GPT-2 (byte-level BPE) — 2019
- Karpathy, *Let's build the GPT Tokenizer* —
  [youtu.be/zduSFxRajkE](https://www.youtube.com/watch?v=zduSFxRajkE)

## Open questions

- Learned tokenizers (end-to-end, differentiable) vs fixed BPE — does
  co-adapting the cut to the model help, or is the tokenizer's job done
  at compression time?
