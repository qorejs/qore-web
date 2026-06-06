---
title: 5 分钟快速入门
description: 用 5 分钟构建一个可运行的 Qore 流式 UI
keywords: [Qore, 快速入门, 流式响应, signal, frontend]
---

# 5 分钟快速入门

这个教程会从一个空的 Vite 应用开始，构建一个真正可运行的 streaming UI。最终效果是一条 stream 直接绑定到一个 text node。

## 1. 创建应用

```bash
pnpm create vite qore-stream-demo -- --template vanilla-ts
cd qore-stream-demo
pnpm add @qorejs/qore
```

如果你使用 npm：

```bash
npm create vite@latest qore-stream-demo -- --template vanilla-ts
cd qore-stream-demo
npm i @qorejs/qore
```

## 2. 添加根节点

把 `index.html` 替换为：

```html
<!doctype html>
<html lang="zh-CN">
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

## 3. 让 stream 流进 UI

把 `src/main.ts` 替换为：

```ts
import { h, mount, stream, text } from '@qorejs/qore'
import './style.css'

const answer = stream.paced([
  'Qore ',
  '把 ',
  'stream ',
  '变成 ',
  'signal。'
], 140)

mount('#app', () => h('main', { className: 'shell' },
  h('p', { className: 'eyebrow' }, 'stream = signal'),
  h('h1', {}, '不搬运状态的流式文本'),
  h('p', { className: 'answer' }, text(() => answer())),
  h('p', { className: 'meta' }, text(() => `${answer.status()} · ${answer.chunkCount()} chunks`))
))
```

添加 `src/style.css`：

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

## 4. 运行

```bash
pnpm dev
```

打开 Vite 输出的本地地址。你会看到句子逐段出现，status 和 chunk count 自动更新。

## 刚才发生了什么

```ts
const answer = stream.paced(['hello'], 140)
```

`answer` 同时是：

- readonly signal：`answer()` 返回当前累积值
- async stream：`for await (const chunk of answer)` 可以观察每个 chunk
- lifecycle object：`answer.status()`、`answer.error()`、`answer.chunkCount()` 都是响应式的

关键绑定是：

```ts
text(() => answer())
```

Qore 会追踪这个依赖，只更新读取 `answer()` 的 text node。不需要组件状态胶水，也不需要重写整段 transcript。

## 接真实 Provider

Provider API key 应放在服务端。浏览器侧消费你自己的 SSE 或 NDJSON endpoint：

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

## 下一步

- [为什么选择 Qore](/zh/guide/why-qore)
- [Provider 集成](/zh/guide/ai-native)
- [Streaming API](/zh/api/streaming)
- [示例](/zh/examples/ai-integration)
