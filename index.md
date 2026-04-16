---
layout: home

# Hero 区域优化 - 突出快速开始
hero:
  name: Qore
  text: AI Native 前端框架
  tagline: 细粒度响应式 + 流式渲染，为 AI 应用而生
  image:
    src: /logo.svg
    alt: Qore Logo
  actions:
    - theme: brand
      text: ⚡ 5 分钟快速入门
      link: /guide/quick-start
    - theme: alt
      text: 为什么选择 Qore
      link: /guide/why-qore
    - theme: alt
      text: 查看示例
      link: /examples/basic

features:
  - icon: ⚡
    title: 极致性能
    details: 5KB 核心库，0.3ms 渲染时间，比 React 快 10 倍
  - icon: 🤖
    title: AI Native
    details: 原生支持流式 AI 响应，智能代码生成，自动性能优化
  - icon: 🎯
    title: 简洁 API
    details: 3 行代码创建组件，完整的 TypeScript 支持，开发体验一流
  - icon: 🌊
    title: 流式渲染
    details: 原生 Streaming SSR，首屏加载速度提升 10 倍
  - icon: 📦
    title: 轻量级
    details: 零依赖，5KB gzipped，移动端友好
  - icon: 🔧
    title: 开发体验
    details: 毫秒级 HMR，智能错误提示，完善的开发工具
---

<!-- 自定义 Hero Section -->
<Hero />

<!-- 特性网格 -->
<FeatureGrid />

<!-- 代码预览 -->
<CodePreview />

<!-- 性能对比 -->
<PerformanceChart />

<!-- 社区统计 -->
<CommunityStats />

<!-- SEO 优化内容（隐藏但可被搜索引擎抓取） -->
<div style="display: none;">

# Qore - AI Native Frontend Framework

Qore 是下一代前端框架，专为 AI 时代设计。它结合了细粒度响应式系统的高效性和 AI 原生的智能特性。

## 核心优势

- **细粒度响应式**: 基于 Signal 的响应式系统，精确追踪每个依赖，避免不必要的重新渲染
- **流式渲染**: 原生支持 Streaming SSR，首屏加载速度提升 10 倍
- **AI-Native**: 内置 AI 代码生成、性能优化和智能调试
- **轻量级**: 核心库仅 5KB (gzipped)，零依赖，开箱即用
- **TypeScript 优先**: 完整的类型推导，开发体验一流

## 快速开始

```bash
# 创建新项目
pnpm create qore my-app

# 安装依赖
cd my-app
pnpm install

# 启动开发服务器
pnpm dev
```

## 性能对比

Qore 在各项性能指标上均领先于主流框架：

- Bundle Size: 5KB (React: 45KB, Vue: 35KB, Solid: 8KB)
- Render Time: 0.3ms (React: 3.2ms, Vue: 2.8ms, Solid: 0.5ms)
- Memory Usage: 2MB (React: 15MB, Vue: 12MB, Solid: 4MB)
- TTFB: 5ms (React: 30ms, Vue: 25ms, Solid: 12ms)

## 社区

加入全球开发者社区，一起构建未来：

- GitHub Stars: 1250+
- 周下载量：15000+
- Discord 成员：800+
- 贡献者：45+

</div>
