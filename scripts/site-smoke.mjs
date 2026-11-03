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
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
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

    for (const locale of ['', '/zh']) {
      const chinese = locale === '/zh'
      await page.goto(`${baseUrl}${locale}/`, { waitUntil: 'networkidle' })
      await page.getByRole('heading', { level: 1 }).waitFor()
      assert(await page.evaluate(() => document.documentElement.lang) === (chinese ? 'zh-CN' : 'en-US'), 'Homepage lang must match locale.')
      await waitForText(page, 'stream = signal')
      await page.locator('[data-demo-status="completed"]').waitFor()
      await waitForText(page, 'Hello, streaming world.')
      await page.getByRole('button', { name: chinese ? '重新播放' : 'Replay', exact: true }).click()
      await page.getByRole('button', { name: chinese ? '停止' : 'Stop', exact: true }).click()
      await page.locator('[data-demo-status="aborted"]').waitFor()
      await page.getByRole('button', { name: chinese ? '重新播放' : 'Replay', exact: true }).click()
      await page.locator('[data-demo-status="completed"]').waitFor()
      await page.getByRole('tab', { name: chinese ? '事件流' : 'Events', exact: true }).click()
      await page.locator('[data-demo-status="completed"]').waitFor()
      await waitForText(page, 'search_docs')
      await page.getByRole('tab', { name: chinese ? '文本流' : 'Stream', exact: true }).focus()
      await page.keyboard.press('ArrowRight')
      assert(await page.getByRole('tab', { name: chinese ? '事件流' : 'Events', exact: true }).getAttribute('aria-selected') === 'true', 'Tabs should support arrow keys.')
      await page.getByRole('tab', { name: chinese ? '文本流' : 'Stream', exact: true }).click()
      await page.locator('[data-demo-status="completed"]').waitFor()
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await page.getByRole('button', { name: chinese ? '复制安装命令' : 'Copy install command', exact: true }).click()
      assert(await page.evaluate(() => navigator.clipboard.readText()) === 'npm i @qorejs/qore', 'Install button should copy a usable command.')
      await page.getByRole('button', { name: chinese ? '复制代码' : 'Copy code', exact: true }).click()
      assert((await page.evaluate(() => navigator.clipboard.readText())).includes("import { stream } from '@qorejs/qore'"), 'Copy code should copy the active sample.')
      await page.locator('.hero-actions a').first().click()
      await page.waitForURL('**/guide/quick-start*')
      await page.locator('.vp-doc h1').waitFor()
      await assertNoConsoleErrors(errors, `${locale || 'English'} homepage and quick start`)
    }

    for (const locale of ['', '/zh']) {
      for (const route of ['/guide/streaming', '/guide/react-adapter', '/examples/agent-event-stream']) {
        await page.goto(`${baseUrl}${locale}${route}.html`, { waitUntil: 'networkidle' })
        await page.locator('.vp-doc h1').waitFor()
        await assertNoConsoleErrors(errors, `${locale}${route}`)
      }
    }

    for (const locale of ['', '/zh']) {
      const chinese = locale === '/zh'
      await page.goto(`${baseUrl}${locale}/examples/`, { waitUntil: 'networkidle' })
      assert(await page.locator('[data-example]').count() === 22, 'All 22 examples should be discoverable.')
      const ids = await page.locator('[data-example]').evaluateAll(elements => elements.map(el => el.getAttribute('data-example')))
      for (const id of ids) {
        await page.locator(`[data-example="${id}"]`).click()
        const terminal = id === 'error-handling' ? 'error' : id === 'cancellation' ? 'aborted' : 'completed'
        await page.locator(`[data-example-status="${terminal}"]`).waitFor()
        assert((await page.locator('[data-example-output]').textContent()).trim().length > 0, `${id}: output should be visible.`)
      }
      await page.getByRole('button', { name: chinese ? '流的组合 5' : 'Composition 5', exact: true }).click()
      assert(await page.locator('[data-example]').count() === 5, 'Category should filter the example list.')
      await page.getByRole('button', { name: chinese ? '全部 22' : 'All 22', exact: true }).click()
      await page.getByRole('searchbox', { name: chinese ? '搜索示例' : 'Search examples' }).fill('not-a-real-example')
      assert(await page.locator('[data-example]').count() === 0, 'Unmatched search should show empty state.')
      await page.getByRole('button', { name: chinese ? '清除筛选' : 'Clear filters', exact: true }).click()
      await page.locator('[data-example="text-stream"]').click()
      await page.getByRole('button', { name: chinese ? '停止' : 'Stop', exact: true }).click()
      await page.locator('[data-example-status="aborted"]').waitFor()
      await page.getByRole('button', { name: chinese ? '重新运行' : 'Run again', exact: true }).click()
      await page.locator('[data-example-status="completed"]').waitFor()
      await page.getByRole('button', { name: chinese ? '复制代码' : 'Copy code', exact: true }).click()
      const clipboard = await page.evaluate(() => navigator.clipboard.readText())
      assert(clipboard.includes('export function createExample') && clipboard.includes('await example.stream.ready'), 'Copied sample must include the runnable setup and usage.')
      await page.goto(`${baseUrl}${locale}/examples/#tool-selector`, { waitUntil: 'networkidle' })
      await page.locator('[data-example-status="completed"]').waitFor()
      assert(await page.locator('[data-example="tool-selector"]').getAttribute('aria-pressed') === 'true', 'Deep links must select their example.')
      await page.locator('[data-example="retry"]').click()
      await page.goBack()
      await page.locator('[data-example-status="completed"]').waitFor()
      assert(await page.locator('[data-example="tool-selector"]').getAttribute('aria-pressed') === 'true', 'Back navigation must restore the previous example.')
      await assertNoConsoleErrors(errors, 'Examples gallery')
    }

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Search docs', exact: true }).click()
    await page.locator('#localsearch-input').fill('streaming')
    await page.locator('.VPLocalSearchBox .result').first().waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('switch').click()
    assert(await page.locator('html').evaluate(el => el.classList.contains('dark')), 'Theme switch should enable dark mode.')
    await page.getByRole('switch').click()

    await page.setViewportSize({ width: 390, height: 844 })
    for (const locale of ['', '/zh']) {
      await page.goto(`${baseUrl}${locale}/`, { waitUntil: 'networkidle' })
      await page.locator('.home-page').waitFor()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert(overflow <= 1, `Mobile homepage overflows horizontally by ${overflow}px.`)
      await page.locator('.VPNavBarHamburger').click()
      await page.locator('.VPNavScreen').waitFor({ state: 'visible' })
      await page.locator('.VPNavScreen a').first().click()
      await page.locator('.vp-doc h1').waitFor()
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(`${baseUrl}/zh/examples/#running-total`, { waitUntil: 'networkidle' })
      await page.locator('[data-example-status="completed"]').waitFor()
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Example gallery overflows at ${width}px.`)
      await page.getByRole('searchbox', { name: '搜索示例' }).fill('retry')
      await page.locator('[data-example="retry"]').click()
      await page.locator('[data-example-status="completed"]').waitFor()
    }
    await assertNoConsoleErrors(errors, 'Theme, search and mobile navigation')

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
