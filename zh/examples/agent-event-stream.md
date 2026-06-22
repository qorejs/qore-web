# Agent Event Stream

Qore 不只处理文本 token。Agent interface 还会持续流出 status、tool call、tool result、diff、artifact、retry 和 error。

关键做法是：把这些更新保留在一条 typed event stream 里，然后选择 UI 需要的 surface。

## Event Model

```ts
type AgentEvent =
  | { type: 'status'; label: string }
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; input: string }
  | { type: 'tool_result'; name: string; output: string }
  | { type: 'diff'; patch: string }
```

## Runtime

```ts
import { stream } from '@qorejs/qore'

const events = stream.events<AgentEvent>(agent.run(task))

const markdown = events.select('text', {
  seed: '',
  reduce: (current, event) => current + event.text
})

const tools = events.select('tool_call')
const results = events.select('tool_result')
const statuses = events.select('status')

const diff = events.select('diff', {
  seed: '',
  reduce: (current, event) => current + event.patch
})
```

`events` 是完整 timeline。每个 select 出来的值也仍然是 `QoreStream`，所以每个 UI surface 都可以独立细粒度更新。

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

Agent 只需要 emit 一条 event stream。Qore 把它投射成多个细粒度 UI surface，不需要额外状态仓库。

## 为什么重要

React / AI SDK 的路径通常会拆成多个 state bucket：messages、status、tool calls、metadata 和 local UI flags。

Qore 的模型更小：

```text
agent events -> QoreEventStream -> selectors -> UI surfaces
```

这就是 runtime 差异：streaming 不是特殊情况。Streaming 本身就是状态模型。
