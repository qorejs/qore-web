---
title: 5-Minute Quick Start
description: Build a runnable streaming Qore UI in five minutes.
keywords: [Qore, quick start, streaming response, signal, frontend]
---

# 5-Minute Quick Start

This guide builds a tiny streaming UI from an empty Vite app. The result is one stream bound directly to one text node.

## 1. Create an App

```bash
pnpm create vite qore-stream-demo -- --template vanilla-ts
cd qore-stream-demo
pnpm add @qorejs/qore
```

Prefer npm?

```bash
npm create vite@latest qore-stream-demo -- --template vanilla-ts
cd qore-stream-demo
npm i @qorejs/qore
```

## 2. Add the Root Element

Replace `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Qore Stream Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

## 3. Stream Into the UI

Replace `src/main.ts` with:

```ts
import { h, mount, stream, text } from '@qorejs/qore'
import './style.css'

const answer = stream.paced([
  'Qore ',
  'turns ',
  'a stream ',
  'into ',
  'a signal.'
], 140)

mount('#app', () => h('main', { className: 'shell' },
  h('p', { className: 'eyebrow' }, 'stream = signal'),
  h('h1', {}, 'Streaming text without state glue'),
  h('p', { className: 'answer' }, text(() => answer())),
  h('p', { className: 'meta' }, text(() => `${answer.status()} · ${answer.chunkCount()} chunks`))
))
```

Add `src/style.css`:

```css
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: #f8fffc;
  background: radial-gradient(circle at 20% 0%, #1fd8ff44, transparent 34%), #06110f;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.shell {
  width: min(640px, calc(100vw - 32px));
  padding: 32px;
  border: 1px solid #66f7df55;
  border-radius: 28px;
  background: #f6fffc12;
}

.eyebrow,
.meta {
  color: #66f7df;
  font: 700 13px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
}

h1 {
  margin: 12px 0 24px;
  font-size: clamp(34px, 6vw, 62px);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.answer {
  min-height: 72px;
  font-size: 24px;
  line-height: 1.5;
}
```

## 4. Run It

```bash
pnpm dev
```

Open the local URL printed by Vite. You should see the sentence arrive chunk by chunk, while the status and chunk count update automatically.

## What Just Happened

```ts
const answer = stream.paced(['hello'], 140)
```

`answer` is both:

- a readonly signal: `answer()` returns the current accumulated value
- an async stream: `for await (const chunk of answer)` observes every chunk
- a lifecycle object: `answer.status()`, `answer.error()`, and `answer.chunkCount()` stay reactive

The UI binding is the important part:

```ts
text(() => answer())
```

Qore tracks that dependency and updates only that text node. No component state glue. No transcript rewrite.

## Connect a Real Provider

Keep provider API keys on your server. In the browser, consume your own SSE or NDJSON endpoint:

```ts
import { createSSEAdapter, h, mount, stream, text } from '@qorejs/qore'

const chat = createSSEAdapter<{ prompt: string }, string, { text?: string }>({
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

mount('#app', () => h('article', {},
  text(() => answer())
))
```

## Next

- [Why Qore?](/guide/why-qore)
- [Provider Integration](/guide/ai-native)
- [Streaming API](/api/streaming)
- [Examples](/examples/ai-integration)
