---
title: Components
description: 使用 Qore 函数和响应式文本绑定构建 DOM 视图
keywords: [Qore, components, h, mount, text]
---

# Components

Qore 组件就是返回 DOM 描述的普通函数。

## 基础视图

```ts
import { h } from '@qorejs/qore'

export const Hello = () => h('h1', {}, 'Hello, Qore')
```

## 响应式视图

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

## 组合

```ts
const Shell = () => h('main', {},
  h('header', {}, 'Qore'),
  Counter()
)
```

保持组件小而清晰，让 signal 和 stream 驱动真正需要变化的节点。
