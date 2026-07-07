---
title: 服务端流式输出
description: 用和浏览器侧同一套 Qore 工具，在服务端生成 SSE。
keywords: [Qore, server streaming, SSE, createSSEResponse, AI]
---

# 服务端流式输出

Qore 1.0 不只是浏览器运行时，它也提供了把整条链路闭合起来的服务端 helper：

```ts
import { createSSEResponse, createOpenAI } from '@qorejs/qore'
```

## 整体形态

推荐的生产形态是：

```txt
浏览器 prompt -> 你的服务端路由 -> provider stream -> createSSEResponse(...) -> 浏览器 stream(...) -> text(() => answer())
```

这样厂商 key 留在服务端，客户端拿到的始终是统一的流式契约。

## 最小路由

```ts
import { createOpenAI, createSSEResponse } from '@qorejs/qore'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  const { prompt } = await request.json() as { prompt: string }
  return createSSEResponse(openai.chat(prompt))
}
```

## 结构化事件

如果前端不只需要纯文本，也可以直接输出显式事件帧：

```ts
import { createSSEResponse } from '@qorejs/qore'

export async function GET() {
  return createSSEResponse([
    { event: 'status', data: { phase: 'starting' } },
    { event: 'token', data: { text: 'Hello ' } },
    { event: 'token', data: { text: 'Qore' } }
  ])
}
```

## 为什么重要

- 服务端输出和浏览器消费使用同一套工具
- 不需要在每个项目里重复写 SSE framing 胶水代码
- provider stream 可以直接通向 UI signal
- 更容易在统一路由后面做重试、续接和 provider 切换

## 建议配合阅读

- [Provider 集成](/zh/guide/ai-native)
- [流式响应](/zh/guide/streaming)
- [Streaming API](/zh/api/streaming)


## 安全边界

Provider adapter 应运行在服务端或可信运行时。不要把 OpenAI、Anthropic 或其他模型服务的 API key 放进浏览器代码。

推荐路径：

```text
Browser UI -> your SSE / NDJSON endpoint -> provider adapter -> model provider
```

浏览器只消费你自己的 endpoint，并把它交给 Qore stream。
