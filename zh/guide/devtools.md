# DevTools Hook

Qore 暴露了一个很小的开发期 stream inspection hook。默认完全不启用。大多数项目可以先用内置的 stream inspector，不需要手动处理全局 hook。

## Stream Inspector

```ts
import { createStreamInspector, stream } from '@qorejs/qore'

const inspector = createStreamInspector({
  maxEvents: 200,
})

const answer = stream(model.chat('hello'), { name: 'answer' })
const trace = inspector.stream('answer')
await answer.ready

console.table(inspector.streams())
console.log(trace()?.firstChunkLatencyMs, trace()?.chunksPerSecond)

inspector.dispose()
```

`inspector.events()` 是最近原始 lifecycle events 的 readonly signal。`inspector.streams()` 是 stream summary 的 readonly signal，包含 `id`、`name`、`status`、`chunkCount`、时间戳、最新值和运行时指标。

summary 包含：

- `firstChunkLatencyMs`：从 stream 创建到第一个 chunk 的耗时
- `durationMs`：从 stream 创建到终态的耗时；active 状态下是最新更新时间
- `chunksPerSecond`：观察到的 chunk 吞吐
- `terminal`：stream 是否已经 completed、errored 或 aborted

如果面板只关心一个 stream，可以用 `inspector.stream(idOrName)`：

```ts
const answerTrace = inspector.stream('answer')

answerTrace.subscribe((summary) => {
  console.log(summary?.status, summary?.durationMs)
})
```

如果只想看时序、不想保留 token payload，可以关闭 payload capture：

```ts
const inspector = createStreamInspector({
  maxEvents: 500,
  capturePayloads: false,
})
```

## Raw Hook

当你安装 `globalThis.__QORE_DEVTOOLS__` 后，命名 stream 会 emit lifecycle 和 chunk event。

```ts
globalThis.__QORE_DEVTOOLS__ = {
  events: [],
  emit(event) {
    console.log(event.phase, event.name, event.status)
  },
}

const answer = stream(model.chat('hello'), { name: 'answer' })
```

事件包括 `create`、`status`、`chunk`、`complete`、`error` 和 `abort`。

```ts
const events = stream.events(agent.run(task), { name: 'agent-events' })
const markdown = events.select('text', {
  name: 'agent-markdown',
  seed: '',
  reduce: (current, event) => current + event.text,
})
```

这个 hook 是 best-effort，不会影响 stream 控制流。它适合浏览器扩展、本地 inspector、测试和自定义调试面板。
