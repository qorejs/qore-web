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
const zhSearchDocs = zh(0x641c, 0x7d22, 0x6587, 0x6863)

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
    await waitForText(page, 'Search docs')
    await waitForText(page, 'Reactive Stream Runtime')
    await waitForText(page, 'for AI-native interfaces')
    await waitForText(page, 'AI interfaces should not treat streaming as a special case.')
    await waitForText(page, 'Stream is state. Stream is UI.')
    await waitForText(page, "const answer = stream(openai.chat('hello'))")
    await waitForText(page, 'One Stream Three Surfaces')
    await waitForText(page, 'A QoreStream is deliberately more than a string.')
    await waitForText(page, 'One stream driving one text node.')
    await waitForText(page, 'React vs Qore')
    await waitForText(page, 'React treats streaming as state synchronization.')
    await waitForText(page, 'Architecture')
    await waitForText(page, 'Providers are inputs. The runtime is the product.')
    await waitForText(page, 'Benchmark')
    await waitForText(page, 'Fine-grained stream updates')
    await waitForText(page, 'snapshot transcript rewrites')
    await waitForText(page, 'Providers')
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
      return text.includes('status: completed') && text.includes('chunks: 4')
    })
    await assertNoConsoleErrors(errors, 'English home')

    await page.goto(`${baseUrl}/guide/streaming.html`, { waitUntil: 'networkidle' })
    await waitForText(page, 'Streaming Response')
    await assertNoConsoleErrors(errors, 'English streaming guide')

    await page.goto(`${baseUrl}/zh/`, { waitUntil: 'networkidle' })
    await waitForText(page, zhHome)
    assert(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'Chinese home should keep zh-CN html lang.')
    await waitForText(page, zhSearchDocs)
    await waitForText(page, 'Reactive Stream Runtime')
    await waitForText(page, 'for AI-native interfaces')
    await waitForText(page, 'AI interface 不应该把 streaming 当成特殊情况。')
    await waitForText(page, 'Stream is state. Stream is UI.')
    await waitForText(page, "const answer = stream(openai.chat('hello'))")
    await waitForText(page, 'One Stream Three Surfaces')
    await waitForText(page, 'QoreStream 不只是字符串。')
    await waitForText(page, '一条 stream 驱动一个 text node。')
    await waitForText(page, 'React vs Qore')
    await waitForText(page, 'React 把 streaming 变成状态同步问题。')
    await waitForText(page, 'Architecture')
    await waitForText(page, 'Provider 是入口。Runtime 才是产品。')
    await waitForText(page, 'Benchmark')
    await waitForText(page, 'Fine-grained stream updates')
    await waitForText(page, 'snapshot transcript rewrites')
    await waitForText(page, 'Providers')
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
      return text.includes('状态: completed') && text.includes('chunks: 4')
    })
    await assertNoConsoleErrors(errors, 'Chinese home')

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
