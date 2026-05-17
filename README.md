# Qore Web

Official website and documentation for Qore: the streaming-response framework where `stream` becomes `signal`.

The default site language is English. Simplified Chinese docs live under `/zh/`.

## Local Development

```bash
pnpm install
pnpm dev
```

Open the local URL printed by VitePress.

## Documentation Guard

```bash
pnpm docs:core
```

This checks the high-traffic docs for removed Qore APIs and stale SSE adapter examples before the full site build runs.

## Build

```bash
pnpm build
pnpm preview
```

The static site is generated in `.vitepress/dist`.

## Repository Roles

- `qorejs/qore` is the runtime and npm package source for `@qorejs/qore`.
- `qorejs/qore-web` is the official website, docs, and product showcase.
- Live demos should import `@qorejs/qore` from npm instead of copying runtime code.

## Links

- Website: https://qorejs.dev/
- Runtime repository: https://github.com/qorejs/qore
- Website repository: https://github.com/qorejs/qore-web
- npm package: https://www.npmjs.com/package/@qorejs/qore
- Latest runtime release: https://github.com/qorejs/qore/releases/tag/v0.7.3

## License

MIT
