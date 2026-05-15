---
title: AI 流集成
description: 使用 Qore 的 stream primitive 连接 OpenAI、Anthropic 与通用 SSE
keywords: [Qore, AI, stream, OpenAI, Anthropic, SSE]
---

# AI 流集成

Qore 不靠模糊口号定义自己。它只抓住 AI UI 最具体的问题：**模型输出是流，而 UI 应该自然响应这条流**。

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

## Generic SSE

```ts
import { createSSEAdapter, stream } from '@qorejs/qore'

const sse = createSSEAdapter({ endpoint: '/api/chat' })
const answer = stream(sse.stream({ prompt: 'hello' }))
```

## UI

```ts
import { h, text } from '@qorejs/qore'

export const Answer = () => h('article', {},
  text(() => answer())
)
```

Provider 可以变化，UI primitive 不变。
