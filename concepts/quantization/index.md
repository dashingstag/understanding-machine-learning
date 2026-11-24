---
id: quantization
title: Quantization
notation: [weights-theta, flop]
---

## Statement

Store `weights-theta`, activations and the `kv-cache` in fewer bits:
fp16 → int8 → 4-bit (GPTQ, AWQ, GGUF) or even ~1.6-bit extremes. The
model's *compute* stays the same shape; the bytes moved per operation
shrink — and since decode is memory-bound, that's a near-linear speedup
for a small quality cost.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`inference-efficiency` — the cheapest lever on the memory wall: 4-bit
weights run a 70B model on hardware that couldn't hold it at fp16. It's
also why open weights are practically deployable — GGUF is the delivery
format of local LLMs.

## Teardown

1. **What gets quantized.** Weights (easy — static), activations (hard —
   outliers), KV cache (medium — per-channel works).
2. **Schemes.** Post-training quantization (GPTQ/AWQ: second-order or
   activation-aware weight rounding) vs quantization-aware training;
   block-wise scales keep accuracy at 4-bit.
3. **The outlier problem.** A few activation channels are 50–100×
   larger — naïve quantization destroys them; fixes: mixed-precision
   outlier lanes (LLM.int8), smoothing (SmoothQuant).
4. **Formats.** GGUF/GGML for CPU/local; GPTQ/AWQ/Marlin for GPU;
   FP8 (Hopper-native) as the training+serving middle ground.
5. **Quality frontier.** 8-bit ≈ lossless; 4-bit ≈ <1% on benchmarks
   with good schemes; ≤2-bit needs exotic methods (QuIP, ternary
   architectures trained that way — BitNet).

## Worked example

70B model memory math:

- fp16: 140GB — needs 2×80GB GPUs. INT4: ~40GB — one 48GB card.
- Decode is bandwidth-bound → ≈3.5× faster per token, benchmark hit
  ≈ 1 point on MMLU. The entire consumer-70B ecosystem runs on that
  trade.

## Sources

- Frantar et al., GPTQ — [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
- Lin et al., AWQ — [arXiv:2306.00978](https://arxiv.org/abs/2306.00978)
- Dettmers et al., LLM.int8 — [arXiv:2208.07339](https://arxiv.org/abs/2208.07339)
- Xiao et al., SmoothQuant — [arXiv:2211.10438](https://arxiv.org/abs/2211.10438)
- Wang et al., BitNet (1.58-bit) — [arXiv:2310.11453](https://arxiv.org/abs/2310.11453)

## Open questions

- Native low-bit training (FP4/ternary) — train in the format you
  serve, rather than degrading into it.
