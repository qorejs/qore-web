---
title: 构建流式响应 AI 界面
date: 2026-04-05
author: Qore Team
---

# 构建流式响应 AI 界面

AI UI 不是快照 UI。它是部分输出、工具调用、进度事件和最终内容组成的一条流。

Qore 把这条流变成一等 UI primitive。

```ts
const answer = stream(openAI.chat(messages))

return h('article', {}, text(() => answer()))
```

## 设计原则

不要手动把 token 从 stream 搬进状态。让 stream 自己成为 signal。

## 这带来了什么

- token 级渲染
- provider adapter 共享同一个 UI 模型
- backpressure 和 pacing 成为 runtime 能力
- 更干净、更真实的 AI 应用 demo
