---
title: 5 分钟快速入门
description: 用 5 分钟构建你的第一个 Qore 流式 UI
keywords: [Qore, 快速入门, 流式响应, signal, frontend]
---

# 5 分钟快速入门

Qore 是一个围绕单一核心构建的小型前端 runtime：**stream 应该天然就是 signal**。

## 安装

```bash
pnpm add @qorejs/qore
```

如果你使用 npm：

```bash
npm i @qorejs/qore
```

## 挂载第一个视图

```ts
import { h, mount, signal, text } from '@qorejs/qore'

const count = signal(0)

mount('#app', () => h('main', {},
  h('h1', {}, 'Qore'),
  h('button', { onclick: () => count(count() + 1) }, 'Increment'),
  h('p', {}, text(() => `Count: ${count()}`))
))
```

只有读取 `count()` 的 text node 会更新。

## 让 stream 流进 UI

```ts
import { h, mount, stream, text } from '@qorejs/qore'

const answer = stream(['Hello ', 'from ', 'Qore'])

mount('#app', () => h('main', {},
  h('p', {}, text(() => answer()))
))
```

`answer` 既是 async stream，也是只读 signal。

## 接 provider

模型厂商 key 放在服务端，浏览器通过你自己的 `/api/chat` SSE 代理接收 token：

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

const answer = stream(chat.chat('用一句话解释 Qore'))

mount('#app', () => h('article', {},
  text(() => answer())
))
```

你不需要手动拼字符串，也不需要把 token 先搬进组件状态。stream 到达，signal 更新，UI 自动响应。

## 下一步

- [为什么选择 Qore](/zh/guide/why-qore)
- [流式响应](/zh/guide/streaming)
- [Streaming API](/zh/api/streaming)
