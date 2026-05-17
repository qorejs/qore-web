---
title: 从 React 迁移
description: 将 React state 和 effects 映射到 Qore signals、effects 与 streams
keywords: [Qore, React, migration, useState, useEffect, signal]
---

# 从 React 迁移

Qore 把 streaming UI 的热路径从组件 rerender 循环里移出来。

## 概念映射

| React | Qore | 说明 |
| --- | --- | --- |
| `useState` | `signal` | 可调用响应式值 |
| `useMemo` | `computed` | 带缓存的派生值 |
| `useEffect` | `effect` | 自动追踪依赖的副作用 |
| Stream reader loop | `stream()` | Async stream + readonly signal |
| Component rerender | Text node update | 细粒度 DOM 绑定 |

## State

```tsx
const [count, setCount] = useState(0)
```

```ts
const count = signal(0)
count(count() + 1)
```

## Text Binding

```tsx
return <p>{count}</p>
```

```ts
return h('p', {}, text(() => count()))
```

## Streaming

React 应用通常读取 token，再手动 append 到 state。

```tsx
for await (const token of aiStream) {
  setText(prev => prev + token)
}
```

Qore 直接让 stream 成为状态源。

```ts
const value = stream(aiStream)
return h('p', {}, text(() => value()))
```

## 迁移策略

1. 把高频变化状态移到 signals。
2. 用 `stream()` 替代 token append loop。
3. 用 `text(() => response())` 绑定流式输出。
4. 需要生态的地方继续保留 React；streaming response 是瓶颈的地方交给 Qore。
