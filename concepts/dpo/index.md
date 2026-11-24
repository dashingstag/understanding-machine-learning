---
id: dpo
title: Direct preference optimization (DPO)
notation: [pi-policy, beta, logits-z]
---

## Statement

The closed-form shortcut around `rlhf`: under the optimal-policy
form of the KL-regularized objective, the reward can be written in terms
of the policy itself — so `dpo-loss` trains `pi-policy` directly on
preference pairs, no reward model, no sampling, no RL. A supervised loss
with an RLHF-shaped optimum.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`post-training` — most open models align with DPO-family losses rather
than full PPO: simpler (one model + frozen reference), cheaper, more
stable. It's the pragmatic majority case, and its derivations explain
what RLHF is really optimizing.

## Teardown

1. **The trick.** Rearrange the KL-regularized optimum: $r(x,y) =
   \beta \log \frac{\pi(y|x)}{\pi_{ref}(y|x)} + \beta\log Z(x)$ — reward
   becomes a log-ratio of policies; the partition term cancels inside
   the Bradley–Terry difference.
2. **The loss.** `dpo-loss`: maximize
   $\log\sigma\big(\beta[\log\frac{\pi(y_w)}{\pi_{ref}(y_w)} -
   \log\frac{\pi(y_l)}{\pi_{ref}(y_l)}]\big)$ — push chosen up, rejected
   down, relative to the frozen reference.
3. **`beta` as the leash.** Same role as the KL coefficient in
   `rlhf-obj`: small β drifts far (length bias, mode collapse); large β
   stays near SFT and learns little.
4. **Variants.** IPO (fixes overfitting), KTO (binary signals, no pairs),
   ORPO (folds SFT+pref into one loss), SimPO (reference-free) — the
   DPO-family zoo.
5. **Known failure modes.** Length exploitation, decreased diversity,
   sensitivity to pair quality — and it can't learn from *unlabeled*
   exploration the way on-policy RL can (`verifiable-rewards`).

## Worked example

Pair: chosen log-ratio $\log\frac{\pi(y_w)}{\pi_{ref}(y_w)} = -0.2$,
rejected $= -1.1$, β = 0.1:

- Margin: $0.1 \times (-0.2 + 1.1) = 0.09$ → loss $-\log\sigma(0.09) \approx 0.69$.
- After updates make the margin $0.5$: loss ≈ 0.47 — the pair is "learned" once the policy prefers chosen by a β-scaled gap over the reference.

## Sources

- Rafailov et al., DPO — [arXiv:2305.18290](https://arxiv.org/abs/2305.18290)
- Azar et al., IPO — [arXiv:2310.12036](https://arxiv.org/abs/2310.12036)
- Ethayarajh et al., KTO — [arXiv:2402.01306](https://arxiv.org/abs/2402.01306)
- Meng et al., SimPO — [arXiv:2405.14734](https://arxiv.org/abs/2405.14734)

## Open questions

- On-policy DPO/online variants — can the reference-free methods close
  the exploration gap vs real RL at `verifiable-rewards` scale?
