# Agent Event Stream

Qore is not limited to text tokens. Agent interfaces also stream status changes, tool calls, tool results, diffs, artifacts, retries, and errors.

The important move is to keep all of those updates in one typed event stream, then select the UI surfaces you need.

## Event Model

```ts
type AgentEvent =
  | { type: 'status'; label: string }
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; input: string }
  | { type: 'tool_result'; name: string; output: string }
  | { type: 'diff'; patch: string }
  | { type: 'artifact'; title: string; content: string }
  | { type: 'retry'; attempt: number; reason: string }
  | { type: 'error'; message: string; recoverable: boolean }
```

## Runtime

```ts
import { stream } from '@qorejs/qore'

const events = stream.events<AgentEvent>(agent.run(task), { name: 'agent-events' })

const markdown = events.select('text', {
  seed: '',
  reduce: (current, event) => current + event.text
})

const tools = events.select('tool_call')
const results = events.select('tool_result')
const statuses = events.select('status', { maxItems: 20 })
const retries = events.select('retry')
const errors = events.select('error')
const artifacts = events.select('artifact')

const diff = events.select('diff', {
  seed: '',
  reduce: (current, event) => current + event.patch
})
```

`events` is the full timeline. Every selected value is also a `QoreStream`, so each surface can be rendered independently.

## UI

```ts
import { h, list, mount, text } from '@qorejs/qore'

mount('#app', () => h('main', {},
  h('section', {},
    h('h2', {}, 'Timeline'),
    list(() => events(), (event) => h('p', {}, event.type))
  ),

  h('article', {},
    h('h2', {}, 'Markdown'),
    text(() => markdown())
  ),

  h('aside', {},
    h('h2', {}, 'Tools'),
    list(() => [...tools(), ...results()], (event) =>
      h('p', {}, event.type === 'tool_call'
        ? `${event.name}: ${event.input}`
        : `${event.name}: ${event.output}`)
    )
  ),

  h('pre', {}, text(() => diff()))
))
```

The agent emits one event stream. Qore turns it into multiple fine-grained UI surfaces without separate state stores.


## DevTools Trace

```ts
const inspector = createStreamInspector({ maxEvents: 200 })

const events = stream.events(agent.run(task), { name: 'agent-events' })

console.table(inspector.streams())
```

You can now inspect `create`, `chunk`, `complete`, `error`, and `abort` events for every named stream from one readonly timeline. Use `capturePayloads: false` when the trace should avoid retaining token content.

## Why This Matters

React / AI SDK paths often turn this into several state buckets: messages, status, tool calls, metadata, and local UI flags.

Qore keeps the model smaller:

```text
agent events -> QoreEventStream -> selectors -> UI surfaces
```

That is the runtime difference: streaming is not a special case. Streaming is the state model.


## Long-running Agent UI

Agent timelines can keep running for minutes. Keep the full event stream useful while giving each UI pane its own bounded window:

```ts
const events = stream.events(agent.run(task), { maxItems: 500 })
const statuses = events.select('status', { maxItems: 20 })
const tools = events.select('tool_call', { maxItems: 50 })
```

`maxItems` limits the current signal array only. It does not hide chunks from async iteration or lifecycle counters.
