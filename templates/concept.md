---
id: concept-id        # must match a node in map.json
title: Concept title
notation: []      # ids from notation.json used on this page
---

<!--
  The graph (parents, level) lives in map.json, not here.
  Folder rules:
  - the folder name must equal this page's id
  - a concept needed by several parents lives at concepts/<id>/
  - only a concept with exactly one parent may nest inside that parent's folder
  After creating this page, run: python tools/build.py
-->

## Statement

The precise statement, with every symbol defined.

## In my own words

One paragraph, as few symbols as possible. Written by me, not copied.

## Why the parent needs it

What breaks upstream without this.

## Teardown

The steps of the proof or construction. Each step points either to a child
concept (add it to map.json) or to a source.

1. …

## Worked example

A small case computed by hand, or in `playground/` (link the script).

## Sources

- Paper (arXiv id), section
- Docs page / canonical implementation
- Computation: `playground/<script>.py`

## Open questions

- What I still don't get.
