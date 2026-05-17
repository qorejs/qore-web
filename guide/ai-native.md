---
title: AI Stream Integration
description: Connect Qore stream primitives to OpenAI, Anthropic, and generic SSE.
keywords: [Qore, AI, stream, OpenAI, Anthropic, SSE]
---

# AI Stream Integration

Qore focuses on one concrete AI UI problem: **model output is a stream, and UI should react to that stream naturally**.

Every provider should end in the same shape:

```ts
const answer = stream(provider.chat(prompt))
```

The UI does not care whether the source is OpenAI, Anthropic, or your own SSE endpoint. It only reads the `QoreStream` signal.

## OpenAI

```ts
import { createOpenAI, stream } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const answer = stream(openAI.chat('Explain Qore in one sentence'))
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

Providers can change. The UI primitive stays the same.
