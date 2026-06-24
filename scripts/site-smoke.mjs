import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createNetServer } from 'node:net'
import { extname, join, normalize, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const rootPath = fileURLToPath(new URL('../', import.meta.url))
const distPath = resolve(rootPath, '.vitepress/dist')
const host = '127.0.0.1'

const zh = (...codes) => String.fromCharCode(...codes)
const zhHome = zh(0x9996, 0x9875)
const enPromptLabel = 'Prompt'
const zhPromptLabel = zh(0x63d0, 0x793a, 0x8bcd)
const zhPromptValue = zh(0x4e2d, 0x6587, 0x0020, 0x0073, 0x006d, 0x006f, 0x006b, 0x0065, 0x0020, 0x0070, 0x0072, 0x006f, 0x006d, 0x0070, 0x0074)
const zhPromptPrefix = zh(0x63d0, 0x793a, 0x8bcd)
const zhStreamingTitle = zh(0x6d41, 0x5f0f, 0x54cd, 0x5e94)

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2']
])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function resolveStaticPath(urlPathname) {
  const safePath = normalize(decodeURIComponent(urlPathname)).replace(/^(\.\.[/\\])+/, '')
  const relativePath = safePath === '/' ? '/index.html' : safePath
  const filePath = resolve(distPath, `.${relativePath}`)

  if (!filePath.startsWith(distPath)) {
    return null
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath
  }

  const htmlPath = resolve(distPath, `.${relativePath}.html`)
  if (existsSync(htmlPath) && statSync(htmlPath).isFile()) {
    return htmlPath
  }

  const indexPath = resolve(distPath, join(`.${relativePath}`, 'index.html'))
  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    return indexPath
  }

  return null
}

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'cache-control': 'no-store',
    ...headers
  })
  response.end(body)
}

async function isPortAvailable(port) {
  return new Promise((resolveAvailability) => {
    const probe = createNetServer()

    probe.once('error', () => resolveAvailability(false))
    probe.once('listening', () => {
      probe.close(() => resolveAvailability(true))
    })

    probe.listen(port, host)
  })
}

async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port += 1) {
    if (await isPortAvailable(port)) {
      return port
    }
  }

  throw new Error(`No available site smoke port found between ${startPort} and ${endPort}.`)
}

async function listen(server, port) {
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(port, host, resolveListen)
  })
}

async function close(server) {
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => error ? rejectClose(error) : resolveClose())
  })
}

async function waitForText(page, text, timeout = 5000) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout })
}

async function assertNoConsoleErrors(errors, label) {
  assert(errors.length === 0, `${label} produced browser errors:\n${errors.join('\n')}`)
}

async function main() {
  assert(existsSync(distPath), 'Missing .vitepress/dist. Run pnpm build before pnpm test:site.')

  const port = await findAvailablePort(4210, 4230)
  const baseUrl = `http://${host}:${port}`
  const server = createHttpServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', baseUrl)
    const filePath = resolveStaticPath(requestUrl.pathname)

    if (!filePath) {
      send(response, 404, 'Not found', { 'content-type': 'text/plain; charset=utf-8' })
      return
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream'
    })
    createReadStream(filePath).pipe(response)
  })

  await listen(server, port)

  const browserChannel = process.env.QORE_WEB_BROWSER_CHANNEL ?? (process.env.CI ? undefined : 'chrome')
  const launchOptions = {
    headless: true,
    ...(browserChannel ? { channel: browserChannel } : {})
  }
  let browser

  try {
    browser = await chromium.launch(launchOptions)
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    const page = await context.newPage()
    const errors = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
    await waitForText(page, 'stream = signal')
    assert(await page.evaluate(() => document.documentElement.lang) === 'en-US', 'English home should keep en-US html lang.')
    await waitForText(page, 'Reactive Stream Runtime')
    await waitForText(page, 'for AI-native interfaces')
    await waitForText(page, 'Build streaming AI chat, agent, and realtime UIs')
    await waitForText(page, 'Qore turns provider events into readonly signals')
    await waitForText(page, 'pnpm add @qorejs/qore')
    await waitForText(page, 'agent workspaces')
    await waitForText(page, "const answer = stream(openai.chat('hello'))")
    await waitForText(page, 'No transcript rewrites')
    await waitForText(page, 'No state glue')
    await waitForText(page, 'No framework lock-in')
    await waitForText(page, 'One Stream Three Surfaces')
    await waitForText(page, 'A QoreStream is deliberately more than a string.')
    await waitForText(page, 'One primitive. Three ways to consume it.')
    await waitForText(page, 'One event stream. Four UI surfaces.')
    await waitForText(page, 'timeline')
    await waitForText(page, 'tools')
    await waitForText(page, 'diff')
    await waitForText(page, 'QoreEventStream')
    await waitForText(page, 'View example')
    await waitForText(page, 'React with Qore')
    await waitForText(page, 'Use Qore inside React')
    await waitForText(page, 'Release-ready adapter')
    await waitForText(page, 'useSyncExternalStore')
    await waitForText(page, 'React can stay your view layer.')
    await waitForText(page, 'The point is not replacing React.')
    await waitForText(page, 'Every token re-enters component state.')
    await waitForText(page, 'React subscribes to snapshots.')
    await waitForText(page, 'Architecture')
    await waitForText(page, 'Providers are inputs. The runtime is the product.')
    await waitForText(page, 'Providers can change. Runtime semantics stay stable.')
    await waitForText(page, 'Stable layer')
    await waitForText(page, 'The runtime owns streaming semantics.')
    await waitForText(page, 'Benchmark')
    await waitForText(page, 'Fine-grained stream updates')
    await waitForText(page, 'snapshot transcript rewrites')
    await waitForText(page, 'Measure rewritten work, not brand names.')
    await waitForText(page, 'selected text node')
    await waitForText(page, 'full transcript region')
    await waitForText(page, 'Providers')
    await waitForText(page, 'The provider story can grow without changing the interface primitive.')
    await waitForText(page, 'Server boundary')
    await waitForText(page, 'Adapters normalize source events.')
    await waitForText(page, 'Make streams first-class state for AI-native interfaces.')
    await waitForText(page, 'OPENAI_API_KEY')
    await waitForText(page, 'Server-side OpenAI stream, one browser-side QoreStream signal.')
    await waitForText(page, 'Provider keys belong in your server or trusted runtime.')
    await page.getByRole('tab', { name: 'Anthropic', exact: true }).click()
    await waitForText(page, 'ANTHROPIC_API_KEY')
    await page.getByRole('tab', { name: 'Generic SSE', exact: true }).click()
    await waitForText(page, 'CUSTOM_AI_API_KEY')
    await page.getByLabel(enPromptLabel).fill('Browser smoke prompt')
    await page.getByRole('button', { name: 'Stream', exact: true }).click()
    await waitForText(page, 'prompt: Browser smoke prompt')
    await page.waitForFunction(() => {
      const text = document.body.textContent ?? ''
      return text.includes('status: same binding, different source') && text.includes('chunks: 5')
    })
    await assertNoConsoleErrors(errors, 'English home')

    await page.goto(`${baseUrl}/examples/agent-event-stream.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'Agent Event Stream')
    await waitForText(page, 'agent events -> QoreEventStream -> selectors -> UI surfaces')
    await waitForText(page, "const events = stream.events<AgentEvent>(agent.run(task))")

    await page.goto(`${baseUrl}/guide/react-adapter.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'React Adapter')
    await waitForText(page, 'Qore is a stream runtime first')

    await page.goto(`${baseUrl}/guide/quick-start.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'This guide builds a tiny streaming UI from an empty Vite app')
    await waitForText(page, 'pnpm create vite qore-stream-demo')
    await waitForText(page, 'Streaming text without state glue')

    await page.goto(`${baseUrl}/guide/streaming.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'Streaming Response')
    await assertNoConsoleErrors(errors, 'English streaming guide')

    await page.goto(`${baseUrl}/zh/`, { waitUntil: 'networkidle' })
    await waitForText(page, zhHome)
    assert(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'Chinese home should keep zh-CN html lang.')
    await waitForText(page, 'Reactive Stream Runtime')
    await waitForText(page, 'for AI-native interfaces')
    await waitForText(page, '用 Qore 构建 streaming AI chat')
    await waitForText(page, 'Qore 把 provider event 转成 readonly signal')
    await waitForText(page, 'pnpm add @qorejs/qore')
    await waitForText(page, 'agent workspace')
    await waitForText(page, "const answer = stream(openai.chat('hello'))")
    await waitForText(page, '不重写 transcript')
    await waitForText(page, '不搬运状态')
    await waitForText(page, '不锁定 framework')
    await waitForText(page, 'One Stream Three Surfaces')
    await waitForText(page, 'QoreStream 不只是字符串。')
    await waitForText(page, '一个 primitive，三种消费方式')
    await waitForText(page, '一条 event stream，驱动四个 UI surface。')
    await waitForText(page, 'timeline')
    await waitForText(page, 'tools')
    await waitForText(page, 'diff')
    await waitForText(page, 'QoreEventStream')
    await waitForText(page, '查看示例')
    await waitForText(page, 'React with Qore')
    await waitForText(page, '在 React 中使用 Qore')
    await waitForText(page, 'Release-ready adapter')
    await waitForText(page, 'useSyncExternalStore')
    await waitForText(page, 'React 可以继续做 view layer。')
    await waitForText(page, '重点不是替代 React')
    await waitForText(page, '每个 token 都重新进入 component state。')
    await waitForText(page, 'React 只订阅 snapshot。')
    await waitForText(page, 'Architecture')
    await waitForText(page, 'Provider 是入口。Runtime 才是产品。')
    await waitForText(page, 'Provider 可以换，runtime 语义保持稳定。')
    await waitForText(page, 'Runtime 负责 streaming 语义。')
    await waitForText(page, 'Benchmark')
    await waitForText(page, 'Fine-grained stream updates')
    await waitForText(page, 'snapshot transcript rewrites')
    await waitForText(page, '衡量被重写的工作量，而不是比较品牌名。')
    await waitForText(page, 'selected text node')
    await waitForText(page, 'full transcript region')
    await waitForText(page, 'Providers')
    await waitForText(page, 'Provider story 可以继续扩展')
    await waitForText(page, '服务端边界')
    await waitForText(page, 'Adapter 只负责规范化 source event')
    await waitForText(page, 'Make streams first-class state for AI-native interfaces.')
    await waitForText(page, 'OPENAI_API_KEY')
    await waitForText(page, 'OpenAI 留在服务端，浏览器拿到一条 QoreStream signal。')
    await waitForText(page, 'Provider key 应放在服务端或可信运行时。')
    await page.getByRole('tab', { name: 'Anthropic', exact: true }).click()
    await waitForText(page, 'ANTHROPIC_API_KEY')
    await page.getByRole('tab', { name: 'Generic SSE', exact: true }).click()
    await waitForText(page, 'CUSTOM_AI_API_KEY')
    await page.getByLabel(zhPromptLabel).fill(zhPromptValue)
    await page.getByRole('button', { name: 'Stream', exact: true }).click()
    await waitForText(page, `${zhPromptPrefix}: ${zhPromptValue}`)
    await page.waitForFunction(() => {
      const text = document.body.textContent ?? ''
      return text.includes('状态: same binding, different source') && text.includes('chunks: 5')
    })
    await assertNoConsoleErrors(errors, 'Chinese home')

    await page.goto(`${baseUrl}/zh/examples/agent-event-stream.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'Agent Event Stream')
    await waitForText(page, 'agent events -> QoreEventStream -> selectors -> UI surfaces')
    await waitForText(page, "const events = stream.events<AgentEvent>(agent.run(task))")

    await page.goto(`${baseUrl}/zh/guide/react-adapter.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'React Adapter')
    await waitForText(page, 'Qore 首先是 stream runtime')

    await page.goto(`${baseUrl}/zh/guide/quick-start.html`, { waitUntil: 'networkidle' })
    await waitForText(page, '构建一个真正可运行的 streaming UI')
    await waitForText(page, 'pnpm create vite qore-stream-demo')
    await waitForText(page, '不搬运状态的流式文本')

    await page.goto(`${baseUrl}/zh/guide/streaming.html`, { waitUntil: 'networkidle' })
    await waitForText(page, zhStreamingTitle)
    await assertNoConsoleErrors(errors, 'Chinese streaming guide')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
    await page.waitForSelector('.home-page.visible')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    assert(overflow <= 1, `Mobile homepage overflows horizontally by ${overflow}px.`)
    await assertNoConsoleErrors(errors, 'Mobile home')

    await context.close()
  } finally {
    if (browser) {
      await browser.close()
    }

    await close(server)
    await delay(25)
  }

  console.log('site-smoke-ok')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
