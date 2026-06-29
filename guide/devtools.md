# DevTools Hook

Qore exposes a tiny development hook for stream inspection. It is inert by default. When you install `globalThis.__QORE_DEVTOOLS__`, every named stream can emit lifecycle and chunk events.

```ts
globalThis.__QORE_DEVTOOLS__ = {
  events: [],
  emit(event) {
    console.log(event.phase, event.name, event.status)
  },
}

const answer = stream(model.chat('hello'), { name: 'answer' })
```

Events include `create`, `status`, `chunk`, `complete`, `error`, and `abort`.

```ts
const events = stream.events(agent.run(task), { name: 'agent-events' })
const markdown = events.select('text', {
  name: 'agent-markdown',
  seed: '',
  reduce: (current, event) => current + event.text,
})
```

The hook is best-effort and never affects stream control flow. It is designed for browser extensions, local inspectors, tests, and custom debugging dashboards.
