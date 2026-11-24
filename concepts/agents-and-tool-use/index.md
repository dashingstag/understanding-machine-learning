---
id: agents-and-tool-use
title: Agents and tool use
notation: [logits-z, loss-l]
---

## Statement

The model as a controller in a loop: perceive context → `agent-loop`
plan → `tool-calling` act (function calls through schemas, increasingly
via `mcp-protocol`) → observe results fed back as tokens → repeat until
done. Coding agents, computer-use, deep-research systems are this loop
productized; `reasoning-models` supply the planning, RAG supplies the
memory.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`modern-machine-learning` — the 2026 product form of ML is the agent
loop, not the single completion: it reuses nearly every concept on the
map (reasoning traces as plans, tools as actions, retrieval as memory,
evals as guardrails). "LLM" is now a component, not the system.

## Teardown

1. **The loop.** `agent-loop`: perceive → plan → act → observe — a
   state machine where the state is the context window itself.
2. **Tools.** `tool-calling`: JSON-schema'd functions — search, code
   exec, file IO, APIs; results re-enter the context as observations.
3. **Protocols.** `mcp-protocol`: one socket standard between agents
   and tools — the interoperability layer of 2026 agent systems.
4. **Context management.** The loop's memory is finite — compaction,
   scratchpads, RAG-in-loop decide what the agent "remembers".
5. **Failure modes.** Loops without termination, tool hallucination,
   compounding errors over long horizons, prompt injection through
   tool results — the agent-era security surface.
6. **Training.** Agents aren't just prompted: RL on task completion
   (SWE-bench-verified, browser tasks) — `verifiable-rewards` at the
   system level.

## Worked example

A coding-agent turn (SWE-bench-class):

- Plan: decompose issue → read files (tool: `read_file`) → edit (tool:
  `write_file`) → test (tool: `run_tests`).
- Each result re-enters context; the model re-plans; ~30–100 tool calls
  per resolved issue — a task "the model solved" is actually the loop
  solving with the model inside.
- Pass@1 numbers in benchmarks are loop+model scores, not model scores.

## Sources

- Yao et al., ReAct — [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- Schick et al., Toolformer — [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)
- Jimenez et al., SWE-bench — [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)
- Anthropic MCP spec — modelcontextprotocol.io
- OpenAI function calling docs (2023+) — the schema pattern everyone
  inherited

## Open questions

- Long-horizon credit assignment — which tool call deserved the
  reward? — the RL question for agents.
- Verification-vs-capability: agents on unverifiable tasks need the
  same checker infrastructure as `verifiable-rewards`.
