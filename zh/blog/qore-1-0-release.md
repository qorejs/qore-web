---
title: Qore 1.0 发布
description: Qore 1.0 作为流式 UI 运行时的首个稳定版本正式发布。
---

# Qore 1.0 发布

Qore 1.0 是这个流式 UI 运行时的第一个稳定版本。

核心表达仍然没变：

```ts
const answer = stream(provider.chat(prompt))
```

但从 1.0 开始，这不再只是一个有潜力的想法，而是一套可以稳定依赖的产品表面。

## 1.0 包含什么

- `stream = signal` 作为核心运行时模型
- 只读的 stream 生命周期状态
- 流组合原语：
  - `merge`
  - `concat`
  - `pipe`
  - `race`
  - `retryable`
  - `switchMap`
- 内建 provider：
  - OpenAI
  - Anthropic
  - OpenRouter
  - DeepSeek
  - Ollama
  - generic SSE
  - line-stream transport
- 服务端 `createSSEResponse(...)`
- 浏览器回归、tarball smoke、public API freeze 与发布门禁

## 产品边界

Qore 1.0 **不是** 想成为另一个大而全的 UI 框架。

它非常明确地围绕一件事展开：

> 让流式数据像响应式 UI 状态一样自然抵达

所以运行时聚焦在 signal、stream、DOM binding 以及 provider / server integration，而不是内建一大层组件体系。

## 为什么 1.0 有意义

大多数前端栈仍然默认“数据是快照”。

但 AI 产品每天都在打破这个前提：

- token 是逐步到来的
- 状态在完成前一直是局部的
- abort、retry、resume 是常态
- UI 需要在 chunk 频率下响应，而不是整片重渲染

Qore 存在的意义，就是让这条路径变得原生。

## 从这里开始

- [为什么是 Qore](/zh/guide/why-qore)
- [流式响应](/zh/guide/streaming)
- [Provider 集成](/zh/guide/ai-native)
- [服务端流式输出](/zh/guide/server-streaming)
