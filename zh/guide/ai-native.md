---
title: AI 流集成
description: 使用 Qore 的 stream primitive 安全连接 OpenAI、Anthropic 与通用 SSE
keywords: [Qore, AI, stream, OpenAI, Anthropic, SSE]
---

# AI 流集成

Qore 不靠模糊口号定义自己。它只抓住 AI UI 最具体的问题：**模型输出是流，而 UI 应该自然响应这条流**。

无论使用哪个模型厂商，最后都应该变成同一种形状：

```ts
const answer = stream(provider.chat(prompt))
```

## Key 放在哪里

模型厂商的 key 应该放在服务端或可信运行环境里。不要把 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 或任何厂商密钥写进浏览器代码。

生产形态应该是：

```txt
browser prompt -> POST /api/chat -> server provider adapter -> SSE tokens -> QoreStream signal
```

## 服务端代理

这个服务端路由会把 `OPENAI_API_KEY` 留在后端，只向浏览器输出安全的 SSE 事件。

```ts
import { createOpenAI } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { prompt } = await request.json() as { prompt: string }
  const encoder = new TextEncoder()

  return new Response(new ReadableStream({
    async start(controller) {
      for await (const token of openAI.chat(prompt)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: token })}\n\n`))
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  }), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/event-stream; charset=utf-8'
    }
  })
}
```

## 浏览器 UI

浏览器只请求你的 `/api/chat` 代理。模型厂商 key 不会进入客户端。

```ts
import { createSSEAdapter, h, stream, text } from '@qorejs/qore'

const chat = createSSEAdapter<{ prompt: string }, string, { text?: string }>({
  name: 'Server Chat',
  url: '/api/chat',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return { body: JSON.stringify(request) }
  },
  buildChatRequest(prompt) {
    return { prompt }
  },
  eventToText(event) {
    return event.data.text
  }
})

const answer = stream(chat.chat('用一句话解释 Qore'))

export const Answer = () => h('article', {}, text(() => answer()))
```

## OpenAI

在服务端使用 OpenAI adapter：

```ts
import { createOpenAI, stream } from '@qorejs/qore'

const openAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-5'
})

const answer = stream(openAI.chat('用一句话解释 Qore'))
```

## Anthropic

切换服务端 adapter 即可。如果 `/api/chat` 的协议保持一致，UI 代码不需要变化。

```ts
import { createAnthropic, stream } from '@qorejs/qore'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514'
})

const answer = stream(anthropic.chat('Explain streaming response UI'))
```

## 通用 SSE

如果你已有 `text/event-stream` 后端，把事件映射成文本后继续使用 `stream()` 即可。

```ts
import { createSSEAdapter, stream } from '@qorejs/qore'

const sse = createSSEAdapter<{ prompt: string }, string, { text?: string }>({
  name: 'Local Chat',
  url: '/api/chat',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return { body: JSON.stringify(request) }
  },
  buildChatRequest(prompt) {
    return { prompt }
  },
  eventToText(event) {
    return event.data.text
  }
})

const answer = stream(sse.chat('hello'))
```

Provider 可以变化，UI primitive 不变。
