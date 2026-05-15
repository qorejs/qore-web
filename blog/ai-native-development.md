---
title: Building AI Interfaces with Streaming Response
date: 2026-04-05
author: Qore Team
---

# Building AI Interfaces with Streaming Response

AI UI is not snapshot UI. It is a stream of partial output, tool calls, progress updates, and final content.

Qore treats that stream as a first-class UI primitive.

```ts
const answer = stream(openAI.chat(messages))

return h('article', {}, text(() => answer()))
```

## Design Principle

Do not copy tokens from a stream into state manually. Let the stream be the signal.

## What This Unlocks

- Token-level rendering
- Provider adapters with one UI model
- Backpressure and pacing as runtime concerns
- Cleaner demos for real AI applications
