---
title: Getting Started
description: 安装 Qore 并理解核心概念
keywords: [Qore, getting started, install, signal, stream]
---

# Getting Started

## 要求

- Node.js 18+
- pnpm、npm 或 yarn
- 用于 DOM 渲染的浏览器环境

## 安装

```bash
pnpm add @qorejs/qore
```

## Signals

Signal 是可调用值。

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
  h('input', {
    value: name(),
    oninput: (event: Event) => name((event.currentTarget as HTMLInputElement).value)
  }),
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
