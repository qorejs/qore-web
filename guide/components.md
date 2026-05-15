---
title: Components
description: Build DOM views with Qore functions and reactive text bindings.
keywords: [Qore, components, h, mount, text]
---

# Components

Qore components are plain functions that return DOM descriptions.

## Basic View

```ts
import { h } from '@qorejs/qore'

export const Hello = () => h('h1', {}, 'Hello, Qore')
```

## Reactive View

```ts
import { h, signal, text } from '@qorejs/qore'

export const Counter = () => {
  const count = signal(0)

  return h('section', {},
    h('button', { onclick: () => count(count() + 1) }, 'Increment'),
    h('p', {}, text(() => `Count: ${count()}`))
  )
}
```

## Composition

```ts
const Shell = () => h('main', {},
  h('header', {}, 'Qore'),
  Counter()
)
```

Keep components small. Let signals and streams drive the nodes that actually need to change.
