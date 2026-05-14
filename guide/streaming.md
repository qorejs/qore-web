---
title: 流式响应
description: Qore stream = signal 的设计与使用方式
keywords: [Qore, 流式响应, Streaming, Signal, AI, SSE]
---

# 流式响应

Qore 的灵魂是四个字：**流式响应**。

传统 UI 把数据看成一次快照：请求、等待、拿到完整结果、再渲染。AI 应用不是这样。模型会一段一段地产生 token，UI 应该像接住水流一样接住它。

Qore 的做法是：

```ts
const answer = stream(openAI.chat('hello'))
```

`answer` 既是 stream，也是 signal。

```ts
answer() // 当前累积内容
```

只要视图依赖它，chunk 到达时 UI 会自动更新。

```ts
return h('div', {}, text(() => answer()))
```

## 最小 AI 响应

```ts
import { createOpenAI, h, mount, stream, text } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const answer = stream(openAI.chat('hello'))

mount('#app', () => h('main', {},
  h('h1', {}, 'AI response'),
  h('p', {}, text(() => answer())),
  h('small', {}, text(() => answer.status()))
))
```

这里没有手动拼字符串，没有 loading 状态散落在组件里，也没有整棵树重绘。`text(() => answer())` 对应的那个 text node 会更新。

## 多轮对话

```ts
import { h, list, signal, stream, text } from '@qorejs/qore'

const messages = signal<{ role: 'user' | 'assistant'; content: string }[]>([])

async function send(content: string) {
  messages([...messages(), { role: 'user', content }])

  const answer = stream(openAI.chat([...messages(), { role: 'user', content }]))

  messages([...messages(), { role: 'assistant', content: '' }])

  for await (const _ of answer) {
    const next = [...messages()]
    next[next.length - 1] = { role: 'assistant', content: answer() }
    messages(next)
  }
}

export const Chat = () => h('section', {},
  list(messages, message => h('p', { class: message.role }, message.content)),
  h('button', { onclick: () => send('Explain Qore') }, 'Ask')
)
```

如果只需要展示一条正在生成的回复，可以直接把 `stream()` 返回值交给 UI；如果要把完成后的内容写回历史消息，也可以用 async iterator 消费同一个 stream。

## 打字机效果

```ts
const answer = stream.paced(openAI.chat('hello'), 24)
```

`paced()` 会给 chunk commit 增加最小间隔，适合让高频 token 以更稳定的节奏进入 UI。

## Backpressure

当 provider 发得比 UI 消费更快，可以限制缓冲区。

```ts
const answer = stream.withBackpressure(openAI.chat('hello'), {
  interval: 16,
  buffer: 128,
  overflow: 'drop-oldest'
})
```

这让“流太快了要控速”成为框架 primitive，而不是每个应用自己重写一次。

## Provider

Qore 的 provider story 围绕同一个接口：任何 provider 最终都变成 async iterable，然后交给 `stream()`。

```ts
const openAIAnswer = stream(openAI.chat(prompt))
const claudeAnswer = stream(anthropic.chat(prompt))
const genericAnswer = stream(sse.stream({ prompt }))
```

UI 不关心来源，只关心 signal。

## 设计原则

- `stream` 负责数据如何流动。
- `signal` 负责 UI 如何响应。
- `QoreStream` 把两者合成一个只读 runtime 状态。
- UI 更新应该细到 text node，而不是整棵树。

[查看 Streaming API](/api/streaming)
