---
title: Core Concepts
description: Understand streams, signals, fine-grained DOM updates, and provider adapters.
keywords: [Qore, core concepts, stream, signal, TypeScript]
---

# Core Concepts

## Stream = Signal

A Qore stream is a data source and a UI dependency at the same time.

```ts
const response = stream(openAI.chat('hello'))

response() // current accumulated content
```

## Fine-Grained DOM Updates

```ts
return h('article', {}, text(() => response()))
```

Only this text node updates when the stream changes.

## Async Iterable First

Any sync iterable, async iterable, SSE adapter, or provider adapter can become a Qore stream.

```ts
const logs = stream(fetchLogLines())
const answer = stream(openAI.chat(messages))
```

## Runtime State

```ts
answer.status()
answer.error()
answer.chunkCount()
answer.ready
```

The runtime owns these fields, so your UI can observe them without corrupting stream state.

## Small Core

Qore core focuses on signals, streams, DOM binding, and provider adapters. Components such as buttons or dialogs should live outside the runtime package.
