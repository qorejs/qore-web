# Qore Web

Qore 官方网站与文档仓库。Qore 的核心定位是：**面向 AI-native interface 的 reactive stream runtime**。

默认语言是英文，简体中文内容位于 `/zh/`。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 VitePress 输出的本地地址即可预览。

## 文档守门

```bash
pnpm docs:core
```

这个脚本会检查所有源码 Markdown 页面，避免已经移除的 Qore API 或旧版 SSE 示例重新混进官网。

## 构建

```bash
pnpm build
pnpm preview
```

静态站点会生成到 `.vitepress/dist`。

## 仓库分工

- `qorejs/qore`：运行时与 npm 包 `@qorejs/qore` 的源码仓库。
- `qorejs/qore-web`：官网、文档与产品展示仓库。
- 官网 demo 应从 npm 安装并使用 `@qorejs/qore`，不要复制运行时代码。

## 链接

- 官网：https://qorejs.dev/
- 运行时仓库：https://github.com/qorejs/qore
- 官网仓库：https://github.com/qorejs/qore-web
- npm 包：https://www.npmjs.com/package/@qorejs/qore
- 最新运行时发布：https://github.com/qorejs/qore/releases/tag/v1.0.0

## 许可证

MIT
