---
id: mcp-protocol
title: MCP (Model Context Protocol)
notation: [logits-z]
---

## Statement

An open JSON-RPC standard for connecting models/agents to tools and
data: servers expose resources (readable data), tools (callable
functions) and prompts; clients (the agent hosts) discover and invoke
them through one uniform protocol. "USB-C for AI" — one socket instead
of an N×M mess of bespoke integrations. Anthropic-open, donated to the
Linux Foundation.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

`agents-and-tool-use` — interoperability is what makes tool ecosystems
possible: without a standard, every agent/tool pair needs custom glue
(N tools × M hosts). MCP made `tool-calling` a network, not a
point-to-point project.

## Teardown

1. **Roles.** Host (the agent app) holds clients; each client connects
   to servers — a GitHub server, a filesystem server, a database
   server.
2. **Three primitives.** Tools (model-invoked functions), resources
   (context data the host/user picks), prompts (reusable templates) —
   capability discovery is built in via `tools/list`.
3. **Transport.** stdio for local servers, HTTP+SSE/streamable for
   remote — same messages either way.
4. **Security model.** Explicit consent gates + scoped servers — and a
   real attack surface (malicious tool descriptions, confused-deputy
   problems) that's actively mapped in 2025+ advisories.
5. **Ecosystem effect.** One implementation per tool serves every
   compliant host — the reason "support MCP" became a product checkbox.

## Worked example

An agent with GitHub + filesystem MCP servers:

- `tools/list` → sees `create_issue`, `read_file`… → model emits
  `call_tool("create_issue", {title, body})` → server executes → JSON
  result back into context — no custom API code in the agent at all.

## Sources

- modelcontextprotocol.io — the specification
- Anthropic MCP announcement (Nov 2024) + Linux Foundation donation (2025)
- MCP security analyses: Invariant Labs tool-poisoning notes (2025)

## Open questions

- Capability auth/delegation at scale — fine-grained permissions for
  what an agent may do through a server is the unfinished spec
  frontier.
