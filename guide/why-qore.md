---
title: 为什么选择 Qore
description: Qore 是围绕流式响应设计的前端 runtime
keywords: [Qore, 流式响应, Signal, Streaming, TypeScript]
---

# 为什么选择 Qore

Qore 不是“又一个前端框架”。它围绕一个问题设计：**AI 与实时应用的数据不是快照，而是一条持续变化的流。**

## 一个核心 primitive

```ts
const answer = stream(openAI.chat('hello'))
```

`answer` 是一个 `QoreStream`，同时也是只读 signal。

```ts
answer()        // 当前累积内容
answer.status() // runtime 状态
```

UI 只需要声明依赖：

```ts
return h('div', {}, text(() => answer()))
```

当 token 到达，Qore 更新 signal；当 signal 更新，Qore 只刷新依赖它的 text node。

## 为什么这很重要

React、Vue、Solid 都能处理 stream，但 stream 通常是“额外接进来的东西”。Qore 的选择是把 stream 放进 runtime 中心：

| 问题 | 常见做法 | Qore |
| --- | --- | --- |
| token 累积 | 手动拼字符串 | `stream()` 自动 reduce |
| UI 更新 | 组件级状态更新 | text node 级响应 |
| provider 差异 | 每个 provider 单独适配 | async iterable + `stream()` |
| 高频 token | 应用自己节流 | backpressure primitive |

## 适合场景

- AI 聊天、Copilot、Agent 工作台
- 实时日志、任务进度、SSE 数据流
- Markdown / code streaming preview
- 需要细粒度更新的轻量 UI

## 设计边界

Qore 核心包不追求自带 Button、Dialog、Tabs。它应该保持小而硬：signal、stream、DOM binding、provider adapters。

官网、示例和组件实验可以在单独仓库或 experimental 区域演进；核心 runtime 只服务流式响应。

## 下一步

- [5 分钟快速入门](/guide/quick-start)
- [流式响应指南](/guide/streaming)
- [Streaming API](/api/streaming)
