---
title: Server Rendering
description: 渐进渲染与 streaming-first 服务端输出说明
keywords: [Qore, SSR, server rendering, streaming, hydration]
---

# Server Rendering

Qore 的 streaming 模型天然适合服务端渲染：数据可以逐步到达，UI 也可以逐步激活。

## 为什么 SSR 重要

- 更快的首屏有意义内容
- 更好的公开页面 SEO
- 更适合低 JavaScript 环境的渐进增强
- 未来可以把 streamed HTML 和 streamed model output 接到同一个模型里

## 当前建议

今天优先使用 Qore 客户端 runtime 构建 streaming UI。服务端输出保持简单，再渐进增强需要 live stream 的区域。

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

同一个 primitive 应该连接服务端流、provider 流和 UI signal。

```ts
const response = stream(serverSentTokens)
```

长期目标是：从 backend stream 到 hydrated UI node，都使用同一种心智模型。
