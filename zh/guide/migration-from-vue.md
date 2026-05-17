---
title: 从 Vue 迁移
description: 将 Vue refs 和 watchers 映射到 Qore signals、effects 与 streams
keywords: [Qore, Vue, migration, ref, watch, signal]
---

# 从 Vue 迁移

Vue Composition API 和 Qore signals 有相近的心智模型：响应式值是显式的。

## 概念映射

| Vue | Qore | 说明 |
| --- | --- | --- |
| `ref()` | `signal()` | 可调用读写值 |
| `computed()` | `computed()` | 派生值 |
| `watchEffect()` | `effect()` | 自动追踪副作用 |
| 模板插值 | `text(() => value())` | 细粒度文本绑定 |
| Stream reader loop | `stream()` | Async stream + readonly signal |

## Ref 到 Signal

```ts
const count = ref(0)
count.value++
```

```ts
const count = signal(0)
count(count() + 1)
```

## Computed

```ts
const double = computed(() => count() * 2)
```

## Streaming

```ts
const answer = stream(provider.chat(messages))

return h('article', {}, text(() => answer()))
```

## 迁移策略

1. Qore 接管 DOM 的区域，可以把局部 `ref` 状态替换为 `signal`。
2. 派生值继续使用 `computed`。
3. 模型输出、日志、SSE 和进度事件使用 `stream()`。
4. 既有屏幕继续保留 Vue，把 streaming-heavy widget 抽到 Qore。
