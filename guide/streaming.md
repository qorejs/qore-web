---
title: Streaming Response
description: Qore stream = signal design and usage.
keywords: [Qore, streaming response, stream, signal, AI, SSE]
---

# Streaming Response

Qore's soul is **streaming response**.

Traditional UI treats data as a snapshot: request, wait, receive, render. AI UI is different. Tokens arrive over time, and the UI should receive them like a river.

## Minimal Stream

```ts
import { h, mount, stream, text } from '@qorejs/qore'

const answer = stream(openAI.chat('hello'))

mount('#app', () => h('main', {},
  h('h1', {}, 'AI response'),
  h('p', {}, text(() => answer())),
  h('small', {}, text(() => answer.status()))
))
```

No manual string stitching. No scattered loading state. No whole-tree rerender.

## Paced Typing

```ts
const answer = stream.paced(openAI.chat('hello'), 24)
```

Use `stream.paced()` when you want a typewriter-like output speed.

## Multi-Turn Chat

```ts
import { h, list, signal, stream, text } from '@qorejs/qore'

const messages = signal<{ role: 'user' | 'assistant'; content: string }[]>([])

async function send(content: string) {
  messages([...messages(), { role: 'user', content }])

  const answer = stream(openAI.chat(messages()))

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

If you only need to display the current answer, bind `answer()` directly. If you need history, consume the same stream as an async iterator.
