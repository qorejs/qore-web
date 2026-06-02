---
title: Qore 1.0 Release
description: Qore 1.0 ships a focused runtime for streaming UI.
---

# Qore 1.0 Release

Qore 1.0 is the first stable release of the reactive stream runtime for AI-native interfaces.

The core idea is still the same:

```ts
const answer = stream(provider.chat(prompt))
```

But 1.0 is the point where that idea becomes a reliable product surface rather than a promising prototype.

## What Ships In 1.0

- `stream = signal` as the primary runtime model
- readonly stream lifecycle state
- stream composition primitives:
  - `merge`
  - `concat`
  - `pipe`
  - `race`
  - `retryable`
  - `switchMap`
- built-in providers for:
  - OpenAI
  - Anthropic
  - OpenRouter
  - DeepSeek
  - Ollama
  - generic SSE
  - line-stream transport
- server-side `createSSEResponse(...)`
- browser regression, tarball smoke, public API freeze, and release gates

## The Product Boundary

Qore 1.0 does **not** try to be another full-spectrum UI framework.

It is intentionally centered on one job:

> let streaming data arrive as naturally as reactive UI state

That is why the runtime stays focused on signals, streams, DOM bindings, and provider/server integration instead of a large built-in component layer.

## Why 1.0 Matters

Most frontend stacks still assume that data is a snapshot.

AI products break that assumption every day:

- tokens arrive gradually
- state is partial until it is done
- abort, retry, and resume are normal
- the UI needs to react at chunk frequency without broad rerenders

Qore exists to make that path feel native.

## Start Here

- [Why Qore](/guide/why-qore)
- [Streaming Response](/guide/streaming)
- [Provider Integration](/guide/ai-native)
- [Server Streaming](/guide/server-streaming)
