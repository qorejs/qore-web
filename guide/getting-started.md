---
title: Getting Started
description: Install Qore and learn the core concepts.
keywords: [Qore, getting started, install, signal, stream]
---

# Getting Started

## Requirements

- Node.js 18+
- pnpm, npm, or yarn
- A browser environment for DOM rendering

## Install

```bash
pnpm add @qorejs/qore
```

## Signals

Signals are callable values.

```ts
import { signal } from '@qorejs/qore'

const count = signal(0)

count()      // read
count(1)     // write
count.set(2) // also write
```

## Effects

```ts
import { effect, signal } from '@qorejs/qore'

const count = signal(0)

const stop = effect(() => {
  console.log('count:', count())
})

count(count() + 1)
stop()
```

## DOM Rendering

```ts
import { h, mount, signal, text } from '@qorejs/qore'

const name = signal('Qore')

mount('#app', () => h('main', {},
  h('input', { value: name(), oninput: event => name(event.target.value) }),
  h('p', {}, text(() => `Hello, ${name()}!`))
))
```

## Streaming

```ts
import { h, mount, stream, text } from '@qorejs/qore'

const response = stream(async function* () {
  yield 'stream '
  yield 'becomes '
  yield 'signal'
})

mount('#app', () => h('p', {}, text(() => response())))
```
