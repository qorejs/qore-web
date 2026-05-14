---
title: 核心概念
description: 理解 Qore 的核心设计理念 - stream、signal、细粒度 DOM 更新、类型安全
keywords: [Qore, 核心概念，stream, signal, TypeScript, 设计理念]
---

# 核心概念

Qore 的设计基于几个核心概念，理解它们将帮助你更好地使用框架。

## 响应式优先

Qore 采用细粒度响应式系统，每个值的变化都会精确地触发依赖更新。

```ts
const a = signal(1)
const b = signal(2)
const sum = computed(() => a() + b())

effect(() => {
  console.log(`Sum: ${sum()}`)
})

a.set(10) // 只重新计算 sum，不触发其他无关更新
```

## 零虚拟 DOM

Qore 不使用虚拟 DOM，直接操作真实 DOM，性能更优。

## 流式响应

Qore 把 stream 和 signal 连接成同一个 primitive：

```ts
const answer = stream(openAI.chat('hello'))
answer() // 当前累积内容
```

当 chunk 到达，signal 更新；当 signal 更新，只刷新依赖它的 DOM 节点。

## 类型安全

完全使用 TypeScript 编写，提供完整的类型推断。
