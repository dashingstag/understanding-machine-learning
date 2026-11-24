---
id: kv-cache
title: KV cache
notation: [kv-bytes, key-matrix, value-matrix, key-dim]
---

## Statement

Cache of every past token's key/value tensors so attention doesn't
recompute them during decode: after prefill, each new token computes
its own `key-matrix`/`value-matrix` projections once and appends them;
attention reads the whole cache. Cost: `kv-bytes` — linear in layers ×
KV-heads × `key-dim` × context — the structure decode speed and memory
both live and die on.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`inference-efficiency` — every decode step rereads the whole cache:
it's the serving-memory bottleneck, the long-context price, and the
reason GQA/MQA/MLA exist. `attention-mechanism`'s quadratic compute
became a linear memory problem that serving must now pay.

## Teardown

1. **What it stores.** Per layer, per past token: K and V vectors —
   decode of token $n$ needs only the cache + the new token's own Q/K/V.
2. **The size.** `kv-bytes`: $2 L n_{kv} d_h \cdot \text{ctx} \cdot
   \text{bytes/elem}$ — e.g., 32L × 8KV × 128d fp16 ≈ 131KB/token;
   128k context ≈ 17GB per sequence.
3. **Shrinking it.** MQA (1 KV head), GQA (8 of 64), MLA (low-rank
   latent compression — DeepSeek's answer), quantization of the cache
   itself.
4. **Paging.** vLLM's PagedAttention treats the cache like virtual
   memory — fixed-size blocks, copy-on-write for beam/prefix sharing:
   the throughput trick behind modern serving.
5. **Prefix caching.** Shared system prompts/tool docs reuse the same
   cache — the "it remembered my instructions" trick in production.

## Worked example

Llama-70B-class (80 layers, GQA-8, $d_h = 128$, fp16):

- Per token: $2 \cdot 80 \cdot 8 \cdot 128 \cdot 2B = 327$KB.
- 32k context → 10.5GB cache — more than the model's weights slice on
  many GPUs; MLA compresses this ~10× by storing a shared low-rank
  latent instead of full K/V.

## Sources

- Pope et al., GQA — [arXiv:2305.13245](https://arxiv.org/abs/2305.13245)
- Shazeer, MQA — [arXiv:1911.02150](https://arxiv.org/abs/1911.02150)
- DeepSeek V2 (MLA) — [arXiv:2405.04434](https://arxiv.org/abs/2405.04434)
- Kwon et al., PagedAttention — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)

## Open questions

- Sublinear context memory (compression, retrieval, state-space) —
  can "remember everything" be cheaper than "store everything"?
