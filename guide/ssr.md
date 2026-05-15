---
title: Server Rendering
description: Notes on progressive rendering and streaming-first server output.
keywords: [Qore, SSR, server rendering, streaming, hydration]
---

# Server Rendering

Qore's streaming model is designed to align with server rendering: data can arrive gradually, and the UI can become interactive progressively.

## Why SSR Matters

- Faster first meaningful content
- Better SEO for public pages
- Progressive enhancement for low-JavaScript environments
- A path toward streamed HTML and streamed model output

## Current Guidance

Use Qore's client runtime for streaming UI today. Keep server output simple and progressively enhance the parts that need live streams.

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

```ts
import { mount } from '@qorejs/qore'
import { App } from './App'

mount('#app', App)
```

## Streaming Roadmap

The same primitive should connect server streams, provider streams, and UI signals:

```ts
const response = stream(serverSentTokens)
```

The long-term goal is one mental model from backend stream to hydrated UI node.
