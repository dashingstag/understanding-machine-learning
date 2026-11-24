---
id: tokenization
title: Tokenization
notation: [vocab, logits-z]
---

## Statement

The reversible codec between raw text and the integer sequences a model
sees: a fixed `vocab` of subword units (typically 32k–256k) built by a
compression algorithm such as `bpe`. Token count denominates everything —
context windows, dataset sizes, API prices.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — models never see characters or words; the
tokenizer's choices *are* the model's sensorium. Arithmetic difficulty,
multilingual cost, prompt-injection surfaces and even benchmark scores
trace back to how text was cut. `embeddings` and `unembedding` are both
`vocab`-sized tables.

## Teardown

1. **Why not characters/words.** Characters → sequences too long
   ($\mathcal O(n^2)$ attention); words → open vocabulary, morphology
   lost. Subwords split the difference: common strings whole, rare ones
   composed.
2. **BPE.** `bpe` — start from bytes, merge the most frequent pair
   greedily $k$ times; the merge list *is* the tokenizer.
3. **Other recipes.** Unigram LM (SentencePiece) — probabilistic vocab,
   scores instead of greedy merges; byte-level BPE — any UTF-8 text
   encodable, no `UNK`.
4. **Special structure.** Chat markup, tool calls, reasoning tags are
   reserved tokens — `sft`/`agents-and-tool-use` depend on them; token
   boundaries around digits make "how many r's in strawberry" genuinely
   hard.
5. **Costs.** Vocab size trades compression (fewer tokens, bigger
   embedding table) — and multilingual corpora tokenize 2–4× worse in
   English-trained vocabs, a hidden tax.

## Worked example

GPT-2 BPE (50,257 vocab) on `understanding`:

- `understanding` → tokens `under` + `standing` (2 tokens) — a common word split.
- `Strawberry` → `Str` + `aw` + `berry` — the model never sees the letters; "count the r's" asks it to count what it can't see.
- Compare: 100 random English words ≈ 130 tokens; the same words in Welsh ≈ 400+ tokens — the multilingual tax in numbers.

## Sources

- Sennrich et al., *Neural Machine Translation of Rare Words with Subword
  Units* (BPE for NLP) — [arXiv:1508.07909](https://arxiv.org/abs/1508.07909)
- Kudo & Richardson, *SentencePiece* — [arXiv:1808.06226](https://arxiv.org/abs/1808.06226)
- OpenAI tiktoken — [github.com/openai/tiktoken](https://github.com/openai/tiktoken)
- Karpathy, *Let's build the GPT Tokenizer* —
  [youtu.be/zduSFxRajkE](https://www.youtube.com/watch?v=zduSFxRajkE)

## Open questions

- Can token-free (byte/character) models (MambaByte, BLT-style patchers)
  beat the tokenizer without paying the sequence-length bill? — an active
  2025+ frontier.
