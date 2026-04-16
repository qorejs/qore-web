---
title: 5 分钟快速入门
description: 5 分钟快速上手 Qore 框架，创建你的第一个响应式应用
keywords: [Qore, 快速入门，教程，Signal, Component, 前端框架，新手指南]
---

# 5 分钟快速入门

本教程将带你用 **5 分钟** 时间快速上手 Qore，构建你的第一个应用。

## 前置要求

- Node.js 18+ 
- pnpm（推荐）或 npm
- 代码编辑器（VS Code 推荐）

## 第一步：创建项目 (1 分钟)

使用官方脚手架快速创建项目：

```bash
# 创建新项目
pnpm create @qorejs/qore my-app

# 进入项目目录
cd my-app

# 安装依赖
pnpm install
```

<details>
<summary>使用 npm 或 yarn？</summary>

```bash
# npm
npm create @qorejs/qore@latest my-app
cd my-app
npm install

# yarn
yarn create @qorejs/qore my-app
cd my-app
yarn install
```
</details>

## 第二步：启动开发服务器 (30 秒)

```bash
pnpm dev
```

浏览器访问 `http://localhost:5173`，你将看到欢迎页面。

## 第三步：理解项目结构 (1 分钟)

```
my-app/
├── src/
│   ├── App.tsx        # 主应用组件
│   ├── index.ts       # 入口文件
│   └── components/    # 组件目录
├── index.html         # HTML 模板
├── package.json       # 项目配置
└── vite.config.ts     # Vite 配置
```

## 第四步：创建第一个组件 (2 分钟)

打开 `src/App.tsx`，替换为以下代码：

```ts
import { signal, component } from '@qorejs/qore'

// 创建一个简单的计数器组件
const Counter = component(() => {
  // 创建一个响应式信号
  const count = signal(0)
  
  // 返回渲染函数
  return () => `
    <div style="text-align: center; padding: 50px;">
      <h1>Qore 快速入门</h1>
      <p style="font-size: 48px; margin: 20px 0;">
        ${count}
      </p>
      <button 
        onclick="${() => count.set(count() + 1)}"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer;"
      >
        点击 +1
      </button>
      <button 
        onclick="${() => count.set(count() - 1)}"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;"
      >
        点击 -1
      </button>
    </div>
  `
})

// 导出组件
export default Counter
```

保存文件，浏览器将自动热更新，显示你的计数器应用！🎉

## 第五步：理解核心概念 (30 秒)

### Signal（信号）

```ts
const count = signal(0)  // 创建响应式值
count()                  // 读取值
count.set(5)            // 更新值
```

### Component（组件）

```ts
const MyComponent = component(() => {
  return () => `<div>Hello</div>`
})
```

组件是一个函数，返回渲染函数。当依赖的信号变化时，自动重新渲染。

## 下一步学习

恭喜！你已经完成了 Qore 的第一个应用。接下来：

### 📚 深入学习

- [为什么选择 Qore](/guide/why-qore) - 了解 Qore 的优势
- [核心概念](/guide/core-concepts) - 深入理解设计理念
- [响应式系统](/guide/reactivity) - 学习 Signal 的奥秘

### 💻 实战示例

- [计数器示例](/examples/counter) - 完整代码
- [Todo 列表](/examples/todo) - 经典入门项目
- [AI 集成](/examples/ai-integration) - 体验 AI Native 特性

### 🎯 推荐学习路径

```
1. 5 分钟快速入门 ✓ (你已完成)
2. 核心概念 (15 分钟)
3. 响应式系统 (20 分钟)
4. 组件系统 (30 分钟)
5. 实战项目 (2 小时)
```

## 常见问题

### Q: 为什么选择 Qore 而不是 React/Vue？

A: Qore 专为 AI 时代设计，提供更优的性能（5KB vs 45KB）、更简洁的 API、和原生的 AI 集成能力。详见 [为什么选择 Qore](/guide/why-qore)。

### Q: Qore 支持 SSR 吗？

A: 支持！Qore 原生支持流式 SSR，详见 [服务端渲染指南](/guide/ssr)。

### Q: 如何部署应用？

A: 运行 `pnpm build` 构建生产版本，然后部署 `dist` 目录到任何静态托管服务。

## 需要帮助？

- 📖 [完整文档](/guide/getting-started)
- 💬 [Discord 社区](https://discord.gg/qore)
- 🐛 [GitHub Issues](https://github.com/qore-framework/qore/issues)

---

**继续探索 Qore 的强大功能吧！** 🚀
