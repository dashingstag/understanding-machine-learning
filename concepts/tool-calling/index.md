---
id: tool-calling
title: Tool calling
notation: [logits-z, vocab]
---

## Statement

The I/O convention that lets a model act: tools are declared as JSON
schemas (name, description, typed arguments); the model emits a
specially-formatted completion naming a function + arguments; a wrapper
executes it and feeds the result back as tokens. Every act in an
`agent-loop` bottoms out here.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`agents-and-tool-use` — the loop's "act" phase is just this protocol,
repeated. The schema design (names, descriptions, error formats)
decides how reliably the model picks the right tool — tool calling is
an interface-design problem as much as a capability.

## Teardown

1. **Schema as prompt.** Tool descriptions live in the system prompt
   (or a trained special-token channel) — description quality is a
   routing decision, literally what the model reads.
2. **The call.** Structured output: `{"name": "search", "arguments":
   {"q": "..."}}` — emitted under schema-constrained decoding so it's
   parseable by construction.
3. **The result.** Tool output becomes a tool-role message in context —
   the model "observes" only through tokens; errors should be readable
   (LLM-first error design).
4. **Parallel + chained calls.** Modern APIs emit multiple calls per
   turn; sequencing and dependency handling is scaffold work, not
   model work.
5. **Failure surface.** Hallucinated arguments, wrong tool, injected
   instructions in results — tool security is input validation all
   over again (see `agents-and-tool-use`).

## Worked example

`get_weather(city: string)` schema registered:

- User: "Paris tomorrow?" → model emits `get_weather("Paris")` → API
  returns `{temp: 18, rain: 0.7}` → model composes the answer citing
  the result — three turns, one visible reply.

## Sources

- OpenAI function calling docs (2023) — the schema convention
- Schick et al., Toolformer — [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)
- Qin et al., ToolLLM/Berkeley function-calling leaderboard —
  [arXiv:2307.16789](https://arxiv.org/abs/2307.16789)
- Anthropic MCP spec — modelcontextprotocol.io

## Open questions

- Learned tool synthesis — agents that write their own tools (Voyager-
  style skill libraries) vs fixed registries.
