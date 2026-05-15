---
title: Reactivity
description: Learn Qore signals, computed values, effects, and fine-grained updates.
keywords: [Qore, reactivity, signal, computed, effect]
---

# Reactivity

Qore uses fine-grained signals to track exactly which DOM nodes depend on which values.

## Signal

```ts
import { signal } from '@qorejs/qore'

const count = signal(0)

count()          // read
count(10)        // write
count.update(n => n + 1)
```

## Computed

```ts
import { computed, signal } from '@qorejs/qore'

const firstName = signal('Ada')
const lastName = signal('Lovelace')
const fullName = computed(() => `${firstName()} ${lastName()}`)
```

## Effect

```ts
import { effect, signal } from '@qorejs/qore'

const todos = signal<string[]>([])

const stop = effect(() => {
  localStorage.setItem('todos', JSON.stringify(todos()))
})
```

## DOM Binding

```ts
h('p', {}, text(() => fullName()))
```

The text node subscribes to `fullName()` and updates without a virtual DOM diff.
