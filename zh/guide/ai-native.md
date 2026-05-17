---
title: AI 流集成
description: 使用 Qore 的 stream primitive 连接 OpenAI、Anthropic 与通用 SSE
keywords: [Qore, AI, stream, OpenAI, Anthropic, SSE]
---

# AI 流集成

Qore 不靠模糊口号定义自己。它只抓住 AI UI 最具体的问题：**模型输出是流，而 UI 应该自然响应这条流**。

每个 provider 最后都应该变成同一种形状：

```ts
const answer = stream(provider.chat(prompt))
```

UI 不关心来源是 OpenAI、Anthropic 还是你自己的 SSE 接口。它只读取 `QoreStream` 这个 signal。

## OpenAI

```ts
import { createOpenAI, stream } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const answer = stream(openAI.chat('用一句话解释 Qore'))
```

## Anthropic

```ts
import { createAnthropic, stream } from '@qorejs/qore'

const anthropic = createAnthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY })
const answer = stream(anthropic.chat('Explain streaming response UI'))
```

## 通用 SSE

```ts
import { createSSEAdapter, stream } from '@qorejs/qore'

const sse = createSSEAdapter<{ prompt: string }>({
  name: 'Local Chat',
  url: '/api/chat',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return {
      body: JSON.stringify(request)
    }
  },
  eventToText(event) {
    if (typeof event.data === 'string') return event.data
    if (event.data && typeof event.data === 'object' && 'text' in event.data) {
      return String(event.data.text ?? '')
    }
    return undefined
  }
})

const answer = stream(sse.streamText({ prompt: 'hello' }))
```

## UI

```ts
import { h, text } from '@qorejs/qore'

export const Answer = () => h('article', {},
  text(() => answer())
)
```

Provider 可以变化，UI primitive 不变。
