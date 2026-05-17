# AI Integration Example

This example uses the production-safe shape: provider keys stay on the server, while the browser consumes your `/api/chat` SSE proxy.

## Server Route

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

## Browser App

```ts
import { createSSEAdapter, h, mount, signal, stream, text } from '@qorejs/qore'

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

const prompt = signal('Explain Qore in one sentence')
let activeAnswer = stream(['Ask something and the answer will stream here.'])
const answer = signal(activeAnswer)

function ask() {
  activeAnswer.abort()
  activeAnswer = stream(chat.chat(prompt()))
  answer(activeAnswer)
}

mount('#app', () => h('main', {},
  h('textarea', {
    value: prompt(),
    oninput: (event: Event) => prompt((event.currentTarget as HTMLTextAreaElement).value)
  }),
  h('button', { onclick: ask }, 'Ask'),
  h('article', {}, text(() => answer()())),
  h('small', {}, text(() => answer().status()))
))
```

The holder signal swaps between conversations. The active `QoreStream` still drives the article token by token.
