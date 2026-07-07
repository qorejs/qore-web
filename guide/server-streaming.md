---
title: Server Streaming
description: Produce SSE on the server with the same Qore toolkit you use in the browser.
keywords: [Qore, server streaming, SSE, createSSEResponse, AI]
---

# Server Streaming

Qore 1.0 is not only a browser runtime. It also ships the server helper that closes the loop:

```ts
import { createSSEResponse, createOpenAI } from '@qorejs/qore'
```

## The Shape

The clean production story is:

```txt
browser prompt -> your server route -> provider stream -> createSSEResponse(...) -> browser stream(...) -> text(() => answer())
```

That keeps vendor keys on the server and keeps the client contract uniform.

## Minimal Route

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

## Structured Frames

You can also emit explicit event frames when the client needs more than plain text.

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

## Why It Matters

- one toolkit for server output and browser consumption
- no custom SSE framing glue in every project
- a direct path from provider streams to UI signals
- easier retries, resume, and provider swapping behind one route

## Pair It With

- [Provider Integration](/guide/ai-native)
- [Streaming Response](/guide/streaming)
- [Streaming API](/api/streaming)


## Security Boundary

Provider adapter should run on the server or in another trusted runtime. Do not ship OpenAI, Anthropic, or other provider API keys to browser code.

Recommended path:

```text
Browser UI -> your SSE / NDJSON endpoint -> provider adapter -> model provider
```

The browser consumes your endpoint and turns it into a Qore stream.
