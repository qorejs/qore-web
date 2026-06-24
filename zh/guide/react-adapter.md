# React Adapter

Qore 首先是 stream runtime。React adapter 让已有 React 应用订阅 Qore stream，而不是把每个 token 都变成组件 state update。

> 状态：preview adapter 已在 Qore 仓库中。npm 包会在 adapter package 发布后启用。

## 心智模型

```text
Provider / AsyncIterable
  -> QoreStream
  -> React external store
  -> Component view
```

React 继续做 view layer。Qore 负责 streaming state、lifecycle、abort、chunks 和 readonly snapshot。

## Hook 形态

```tsx
import { stream } from '@qorejs/qore'
import { useQoreStream } from '@qorejs/react'

export function Answer({ prompt }: { prompt: string }) {
  const answer = useQoreStream(
    () => stream(fetch(`/api/chat?prompt=${encodeURIComponent(prompt)}`).then((response) => response.body)),
    [prompt],
    { initialValue: '' }
  )

  return (
    <article>
      <p>{answer.value}</p>
      <small>{answer.status}</small>
      <button onClick={() => answer.abort()}>Stop</button>
    </article>
  )
}
```

`useQoreStream` 会在 mount 后启动 stream，通过 `useSyncExternalStore` 订阅，并在依赖变化或组件卸载时 abort 上一个 stream。

## 你会得到什么

- `value`: 当前 stream signal value。
- `status`: `idle`、`streaming`、`completed`、`failed` 或 `aborted`。
- `error`: 当前 stream error。
- `chunks`: 防御性 chunk history snapshot。
- `streaming`、`completed`、`failed`、`aborted`: 派生生命周期布尔值。
- `chunkCount`、`buffered`、`dropped`: runtime counter。
- `abort()`: 取消当前 stream。

## 安全边界

不要把 provider secret 放进浏览器 React 代码。应该由服务端暴露自己的 SSE 或 NDJSON endpoint，再把这个 endpoint stream 到 Qore。
