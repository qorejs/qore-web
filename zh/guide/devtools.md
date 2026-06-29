# DevTools Hook

Qore 暴露了一个很小的开发期 stream inspection hook。默认完全不启用；当你安装 `globalThis.__QORE_DEVTOOLS__` 后，命名 stream 会 emit lifecycle 和 chunk event。

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
