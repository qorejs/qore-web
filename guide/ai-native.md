---
title: AI Stream Integration
description: Connect Qore stream primitives to OpenAI, Anthropic, and generic SSE without leaking provider keys.
keywords: [Qore, AI, stream, OpenAI, Anthropic, SSE]
---

# AI Stream Integration

Qore focuses on one concrete AI UI problem: **model output is a stream, and UI should react to that stream naturally**.

The shape stays the same no matter which provider you use:

```ts
const answer = stream(provider.chat(prompt))
```

## Key Placement

Provider keys belong on your server or another trusted runtime. Do not put `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or any vendor secret in browser code.

The production shape is:

```txt
browser prompt -> POST /api/chat -> provider adapter on server -> SSE tokens -> QoreStream signal
```

## Server Proxy

This server-side route keeps `OPENAI_API_KEY` private and streams safe SSE events to the browser.

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

## Browser UI

The browser talks only to your `/api/chat` proxy. The provider secret never crosses the network to the client.

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

const answer = stream(chat.chat('Explain Qore in one sentence'))

export const Answer = () => h('article', {}, text(() => answer()))
```

## OpenAI

Use the OpenAI adapter on the server:

```ts
import { createOpenAI, stream } from '@qorejs/qore'

const openAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-5'
})

const answer = stream(openAI.chat('Explain Qore in one sentence'))
```

## Anthropic

Swap the server adapter. The UI code can stay unchanged if your `/api/chat` contract stays the same.

```ts
import { createAnthropic, stream } from '@qorejs/qore'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514'
})

const answer = stream(anthropic.chat('Explain streaming response UI'))
```

## Generic SSE

If your backend already streams `text/event-stream`, map its events once and keep using `stream()`.

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

Providers can change. The UI primitive stays the same.
