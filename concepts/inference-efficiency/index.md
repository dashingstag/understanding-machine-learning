---
id: inference-efficiency
title: Inference and efficiency
notation: [flop, kv-bytes, weights-theta, d-model]
---

## Statement

The engineering that sets cost per generated token: decode is
memory-bandwidth-bound (every token rereads all weights plus the
`kv-cache`), so the levers are `quantization` (fewer bytes),
`speculative-decoding` (verify many tokens per pass),
`knowledge-distillation` (smaller models), batching/caching, and
architecture variants (MoE activation, linear attention). `kv-bytes`
estimates the cache cost.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — serving economics decide what's actually
deployable: a model's real price is set here, and many "smarter"
products are partly efficiency tricks. `reasoning-models` multiplied
token counts 10–100×, which made this family of tricks the margin of
the whole industry.

## Teardown

1. **The bottleneck.** Autoregressive decode: one forward pass per
   token, bandwidth-dominated — reading `weights-theta` + the whole
   `kv-cache` per step. FLOPs aren't the wall; bytes are.
2. **KV cache.** `kv-cache`: past keys/values stored to avoid
   recomputation — `kv-bytes` grows with layers × heads × context; the
   memory hog at long context (MLA, GQA, paged attention are the
   counters).
3. **Quantization.** `quantization`: 16→8→4-bit weights/activations —
   GPTQ/AWQ/GGUF; 4× less memory, small quality cost.
4. **Speculative decoding.** `speculative-decoding`: a cheap draft
   model proposes $k$ tokens; the big model verifies all in one pass —
   mathematically identical output, 2–3× speedup.
5. **Distillation.** `knowledge-distillation`: train a small model on a
   large one's outputs — most "small" production models are students.
6. **Batching & scheduling.** Continuous batching, prefix caching,
   paged KV (vLLM) — throughput is a scheduling problem at fleet scale.

## Worked example

7B model, fp16, 4k context:

- Weights: 14GB read per token; KV cache for 32 layers × 8 KV-heads ×
  128 dim × 4k ≈ 0.5GB — decode speed ≈ memory bandwidth ÷ ~14.5GB.
- INT4 weights: 3.5GB — ~4× faster decode, quality drop <1% on most
  tasks: the cheapest "GPU upgrade" that exists.

## Sources

- Pope et al., GQA — [arXiv:2305.13245](https://arxiv.org/abs/2305.13245)
- DeepSeek, MLA — in V2 report [arXiv:2405.04434](https://arxiv.org/abs/2405.04434)
- Leviathan et al., speculative decoding —
  [arXiv:2211.17192](https://arxiv.org/abs/2211.17192)
- Frantar et al., GPTQ — [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
- Kwon et al., vLLM/PagedAttention —
  [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
- Hinton et al., distillation — [arXiv:1503.02531](https://arxiv.org/abs/1503.02531)

## Open questions

- Sub-quadratic attention at frontier quality (state-space, linear
  attn, sparse) — the open architecture race behind 10M-token
  context claims.
