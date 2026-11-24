# References — pointers, not copies

Outside material this repo links to. Tag each entry with the concept ids it
serves. Add a row when a page cites a new source.

## Foundational papers

- Vaswani et al., *Attention Is All You Need*, NeurIPS 2017 — <https://arxiv.org/abs/1706.03762> · `attention-mechanism`, `transformer-architecture`
- Bahdanau, Cho, Bengio, *Neural Machine Translation by Jointly Learning to Align and Translate*, ICLR 2015 — <https://arxiv.org/abs/1409.0473> · `attention-mechanism`
- Shazeer et al., *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer*, ICLR 2017 — <https://arxiv.org/abs/1701.06538> · `mixture-of-experts`
- Hoffmann et al., *Training Compute-Optimal Large Language Models* ("Chinchilla"), NeurIPS 2022 — <https://arxiv.org/abs/2203.15556> · `scaling-laws`, `pretraining`
- Radford et al., *Improving Language Understanding by Generative Pre-Training* (GPT-1), 2018 — <https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf> · `pretraining`
- Ouyang et al., *Training Language Models to Follow Instructions with Human Feedback* (InstructGPT), NeurIPS 2022 — <https://arxiv.org/abs/2203.02155> · `post-training`
- Rafailov et al., *Direct Preference Optimization*, NeurIPS 2023 — <https://arxiv.org/abs/2305.18290> · `post-training`
- Ho, Jain, Abbeel, *Denoising Diffusion Probabilistic Models*, NeurIPS 2020 — <https://arxiv.org/abs/2006.11239> · `diffusion-models`
- Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, NeurIPS 2020 — <https://arxiv.org/abs/2005.11401> · `retrieval-augmented-generation`
- Devlin et al., *BERT: Pre-training of Deep Bidirectional Transformers*, NAACL 2019 — <https://arxiv.org/abs/1810.04805> · `pretraining`, `transformer-architecture`
- Kaplan et al., *Scaling Laws for Neural Language Models*, 2020 — <https://arxiv.org/abs/2001.08361> · `scaling-laws`

## Explainers (video / interactive)

- 3Blue1Brown, *Attention in transformers, visually explained* (DL ch.6), 2024 — <https://www.youtube.com/watch?v=eMlx5fFNoYc> · `attention-mechanism`
- Jay Alammar, *The Illustrated Transformer*, 2018 — <https://jalammar.github.io/illustrated-transformer/> · `transformer-architecture`, `attention-mechanism`
- Andrej Karpathy, *Let's build GPT: from scratch, in code, spelled out*, 2023 — <https://www.youtube.com/watch?v=kCc8FmEb1nY> · `transformer-architecture`, `pretraining`
- Andrej Karpathy, *Let's build the GPT Tokenizer*, 2024 — <https://www.youtube.com/watch?v=zduSFxRajkE> · `tokenization`
- Anthropic, *Transformer Circuits* thread — <https://transformer-circuits.pub/> · `interpretability`

## Docs / canonical implementations

- `Attention` in PyTorch: `torch.nn.MultiheadAttention` — <https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html> · `attention-mechanism`
- The Annotated Transformer (Harvard NLP) — <https://nlp.seas.harvard.edu/annotated-transformer/> · `transformer-architecture`, `attention-mechanism`
- Model Context Protocol spec — <https://modelcontextprotocol.io/> · `agents-and-tool-use`
