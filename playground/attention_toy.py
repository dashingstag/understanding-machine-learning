"""Toy scaled dot-product attention on a 3-token example — backs the
attention-mechanism article's worked numbers.

    python playground/attention_toy.py

Sentence: "cat sat down" (3 tokens, d_model = 2, one head).
Numbers chosen so the softmax stays readable; the point is the SHAPE of the
computation: scores -> scale -> softmax -> weighted mix of V.
"""

import math

TOKENS = ["cat", "sat", "down"]

# Token embeddings X (one row per token).
X = [
    [1.0, 0.0],   # cat
    [0.0, 1.0],   # sat
    [1.0, 1.0],   # down
]

# Fixed projection weights (learned in a real model — inside theta).
W_Q = [[1.0, 0.5],
       [0.0, 1.0]]
W_K = [[1.0, 0.0],
       [0.5, 1.0]]
W_V = [[2.0, 0.0],
       [0.0, 2.0]]

D_K = 2  # key dimension -> scale by sqrt(2)


def matmul(a, b):
    return [[sum(x * y for x, y in zip(row, col)) for col in zip(*b)] for row in a]


def softmax(row):
    m = max(row)  # subtract max for stability: softmax(z + c) = softmax(z)
    e = [math.exp(v - m) for v in row]
    s = sum(e)
    return [v / s for v in e]


def fmt(m):
    return [[round(v, 4) for v in row] for row in m]


Q = matmul(X, W_Q)
K = matmul(X, W_K)
V = matmul(X, W_V)

scores = matmul(Q, [[K[j][i] for j in range(len(K))] for i in range(len(K[0]))])
scaled = [[s / math.sqrt(D_K) for s in row] for row in scores]
weights = [softmax(row) for row in scaled]
out = matmul(weights, V)

print("Q =", fmt(Q))
print("K =", fmt(K))
print("V =", fmt(V))
print("raw scores QK^T =", fmt(scores))
print("scaled by 1/sqrt(d_k) =", fmt(scaled))
print("attention weights =", fmt(weights))
print("output = weights @ V =", fmt(out))

# The contrast the paper draws: without the 1/sqrt(d_k) factor the same
# scores land much closer to one-hot.
unscaled = [softmax(row) for row in scores]
print("weights WITHOUT scaling =", fmt(unscaled))

# Causal mask: token i may only attend to j <= i (decoder self-attention).
NEG = float("-inf")
masked = [[scaled[i][j] if j <= i else NEG for j in range(len(row))]
          for i, row in enumerate(scaled)]
causal = [softmax(row) for row in masked]
print("weights with causal mask =", fmt(causal))
