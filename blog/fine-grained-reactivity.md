---
title: Fine-Grained Reactivity for Streaming UI
date: 2026-04-10
author: Qore Team
---

# Fine-Grained Reactivity for Streaming UI

Streaming UI changes the performance profile of frontend apps. Instead of one final response, AI interfaces receive many small chunks.

## The Problem

A token should not force a full component rerender.

```ts
const answer = stream(openAI.chat('hello'))

h('p', {}, text(() => answer()))
```

In Qore, the text node is the subscriber. Tokens update that node directly.

## Why It Helps

- Less work per token
- Cleaner application code
- Fewer intermediate loading states
- A direct path from data stream to UI dependency
