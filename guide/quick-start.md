---
title: 5-Minute Quick Start
description: Build your first streaming Qore UI in five minutes.
keywords: [Qore, quick start, streaming response, signal, frontend]
---

# 5-Minute Quick Start

Qore is a small frontend runtime built around one idea: **a stream should be a signal**.

## Install

```bash
pnpm add @qorejs/qore
```

## Mount Your First View

```ts
import { h, mount, signal, text } from '@qorejs/qore'

const count = signal(0)

mount('#app', () => h('main', {},
  h('h1', {}, 'Qore'),
  h('button', { onclick: () => count(count() + 1) }, 'Increment'),
  h('p', {}, text(() => `Count: ${count()}`))
))
```

Only the text node that reads `count()` updates.

## Stream Into UI

```ts
import { h, mount, stream, text } from '@qorejs/qore'

const answer = stream(['Hello ', 'from ', 'Qore'])

mount('#app', () => h('main', {},
  h('p', {}, text(() => answer()))
))
```

`answer` is both an async stream and a readonly signal.

## Next

- [Why Qore?](/guide/why-qore)
- [Streaming Response](/guide/streaming)
- [Streaming API](/api/streaming)
