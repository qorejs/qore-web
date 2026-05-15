---
title: Why Qore
description: Qore is a frontend runtime designed around streaming response.
keywords: [Qore, streaming response, signal, AI UI]
---

# Why Qore

Qore is not trying to be another general-purpose UI framework. It focuses on a sharper problem: **AI and realtime applications produce streams, not snapshots.**

## The Core Primitive

```ts
const answer = stream(openAI.chat('hello'))
```

`answer` is a `QoreStream` and a readonly signal.

```ts
answer()         // accumulated value
answer.status()  // pending | streaming | completed | error | aborted
```

UI declares the dependency once:

```ts
return h('div', {}, text(() => answer()))
```

When a token arrives, Qore updates the signal. When the signal updates, Qore refreshes only the dependent text node.

## Why It Matters

| Problem | Usual approach | Qore |
| --- | --- | --- |
| Token accumulation | Manually append strings | `stream()` accumulates |
| UI updates | Component-level state updates | Text-node-level reactivity |
| Provider differences | One adapter per UI path | Async iterable + `stream()` |
| High-frequency tokens | App-level throttling | Stream runtime primitives |

## Best Fit

- AI chat, copilots, and agent workspaces
- Realtime logs, task progress, and SSE feeds
- Markdown and code streaming previews
- Lightweight UI with fine-grained updates

## Design Boundary

The core package stays small: signals, streams, DOM bindings, and provider adapters. UI kits belong in examples or separate packages.
