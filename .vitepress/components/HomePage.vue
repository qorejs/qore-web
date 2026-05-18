<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { h, mount, stream, text } from '@qorejs/qore'

const { lang } = useData()
const qoreRoot = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const isZh = computed(() => lang.value.startsWith('zh'))

type ProviderId = 'openai' | 'anthropic' | 'sse'

type ProviderCopy = {
  id: ProviderId
  name: string
  env: string
  proxy: string
  ui: string
  factory: string
  description: string
  tokens: readonly string[]
}

const copy = {
  en: {
    eyebrow: 'Qore / Streaming Response Runtime',
    headlineTop: 'Streams',
    headlineBottom: 'become UI.',
    taglinePrefix: 'Qore makes',
    tagline: 'stream = signal',
    summary: 'AI tokens should not be copied into state. In Qore, every chunk becomes reactive UI the moment it arrives.',
    primaryAction: 'Run the live stream',
    quickStart: 'Quick Start',
    github: 'GitHub',
    installLabel: 'Install',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: 'Release channels',
    releaseLinks: [
      ['v0.7.3', 'https://github.com/qorejs/qore/releases/tag/v0.7.3'],
      ['npm latest', 'https://www.npmjs.com/package/@qorejs/qore'],
      ['GitHub Packages', 'https://github.com/qorejs/qore/packages']
    ],
    cardLabel: 'Provider setup, live',
    demoSubtitle: 'Choose a provider. Stream through your server. Bind one signal to the UI.',
    providerLabel: 'Choose provider',
    docsAction: 'Setup guide',
    serverKeyLabel: 'Server key',
    proxyLabel: 'Backend proxy',
    uiLabel: 'UI primitive',
    flowLabel: 'Flow',
    flowSteps: [
      ['1', 'Browser sends prompt'],
      ['2', 'Server calls model'],
      ['3', 'Qore streams UI']
    ],
    secretNote: 'Keys stay server-side. The browser only receives safe SSE chunks.',
    streamButton: 'Stream',
    promptLabel: 'Demo prompt',
    presetLabel: 'Demo presets',
    runtimeTitle: 'Qore runtime demo',
    waiting: 'waiting for the first token...',
    runtimePromptPrefix: 'prompt',
    tokenRailFallback: 'token rail armed',
    signalSteps: [
      ['Provider', 'SSE chunks'],
      ['QoreStream', 'readonly signal'],
      ['Text node', 'fine-grained UI']
    ],
    heroStats: [
      ['1 primitive', 'stream + signal'],
      ['3 adapters', 'OpenAI / Anthropic / SSE'],
      ['0 secrets', 'browser-safe'],
      ['1 node', 'targeted updates']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: 'createOpenAI({ apiKey: process.env.OPENAI_API_KEY })',
        description: 'OpenAI on the server; QoreStream in the browser.',
        tokens: [
          'OpenAI selected. ',
          'The API key stays server-side. ',
          'Tokens cross /api/chat as SSE. ',
          'Qore updates one signal.'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: 'createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })',
        description: 'Swap providers without changing the UI binding.',
        tokens: [
          'Anthropic selected. ',
          'Claude streams from the server. ',
          'The browser receives safe SSE. ',
          'The text node keeps flowing.'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: "createSSEAdapter({ url: '/api/chat' })",
        description: 'Map your existing SSE once, then reuse Qore everywhere.',
        tokens: [
          'Generic SSE selected. ',
          'Your backend owns the vendor call. ',
          'eventToText maps each chunk. ',
          'stream() drives the UI.'
        ]
      }
    ] satisfies readonly ProviderCopy[],
    presets: [
      'Explain stream = signal',
      'Draft a tiny AI chat reply',
      'Show why token-level UI matters'
    ],
    pillars: [
      ['Native stream signal', 'The answer is a callable signal, an async iterable, and lifecycle state.'],
      ['Server-safe providers', 'OpenAI, Anthropic, or generic SSE behind your own backend route.'],
      ['Append-fast core', 'The hot path tracks chunks without cloning the full history per token.']
    ],
    pointEyebrow: 'The difference',
    pointTitle: 'Stop moving tokens around. Let them flow.',
    pointSummary: 'Qore turns the streaming path itself into reactive state, so the UI subscribes instead of polling or rebuilding.',
    proofPoints: [
      ['Provider', 'server env key', 'no browser secrets'],
      ['Primitive', 'stream()', 'reader loop + state'],
      ['Hot path', 'append-only history', 'full-array clone/token']
    ],
    qoreTitle: 'Qore',
    manualTitle: 'Manual stream state'
  },
  zh: {
    eyebrow: 'Qore / Streaming Response Runtime',
    headlineTop: '让数据流',
    headlineBottom: '长成 UI。',
    taglinePrefix: 'Qore 让',
    tagline: 'stream = signal',
    summary: 'AI token 不应该被手动搬进状态。Qore 让每个 chunk 抵达的瞬间就变成响应式 UI。',
    primaryAction: '运行实时流',
    quickStart: '快速开始',
    github: 'GitHub',
    installLabel: '安装',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: '发布通道',
    releaseLinks: [
      ['v0.7.3', 'https://github.com/qorejs/qore/releases/tag/v0.7.3'],
      ['npm 最新', 'https://www.npmjs.com/package/@qorejs/qore'],
      ['GitHub Packages', 'https://github.com/qorejs/qore/packages']
    ],
    cardLabel: 'Provider 设置演示',
    demoSubtitle: '选厂商，经由服务端流出，再把一个 signal 绑定到 UI。',
    providerLabel: '选择模型厂商',
    docsAction: '配置指南',
    serverKeyLabel: '服务端 key',
    proxyLabel: '后端代理',
    uiLabel: 'UI primitive',
    flowLabel: '流程',
    flowSteps: [
      ['1', '浏览器发送 prompt'],
      ['2', '服务端调用模型'],
      ['3', 'Qore 流式更新 UI']
    ],
    secretNote: 'Key 留在服务端，浏览器只接收安全的 SSE chunk。',
    streamButton: 'Stream',
    promptLabel: '演示提示词',
    presetLabel: '演示预设',
    runtimeTitle: 'Qore 运行时演示',
    waiting: '等待第一个 token...',
    runtimePromptPrefix: '提示词',
    tokenRailFallback: 'token 轨道已就绪',
    signalSteps: [
      ['Provider', 'SSE chunk'],
      ['QoreStream', '只读 signal'],
      ['Text node', '细粒度 UI']
    ],
    heroStats: [
      ['1 primitive', 'stream + signal'],
      ['3 adapters', 'OpenAI / Anthropic / SSE'],
      ['0 secrets', '浏览器安全'],
      ['1 node', '精准更新']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: 'createOpenAI({ apiKey: process.env.OPENAI_API_KEY })',
        description: 'OpenAI 留在服务端，浏览器只拿 QoreStream。',
        tokens: [
          '已选择 OpenAI。',
          'API key 留在服务端。',
          'Token 通过 /api/chat 流向前端。',
          'Qore 只更新一个 signal。'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: 'createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })',
        description: '切换厂商，不改 UI 绑定。',
        tokens: [
          '已选择 Anthropic。',
          'Claude 在服务端流式输出。',
          '浏览器只接收安全 SSE。',
          'text node 持续精准刷新。'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        proxy: 'POST /api/chat',
        ui: 'stream(chat.chat(prompt))',
        factory: "createSSEAdapter({ url: '/api/chat' })",
        description: '已有 SSE 后端时，只映射一次事件文本。',
        tokens: [
          '已选择通用 SSE。',
          '厂商调用由你的后端负责。',
          'eventToText 映射每个 chunk。',
          'stream() 驱动 UI。'
        ]
      }
    ] satisfies readonly ProviderCopy[],
    presets: [
      '解释 stream = signal',
      '生成一段 AI 聊天回复',
      '说明 token 级 UI 的价值'
    ],
    pillars: [
      ['Native stream signal', 'answer 既是 signal，也是 async iterable 和生命周期状态。'],
      ['Server-safe providers', 'OpenAI、Anthropic 或通用 SSE 都藏在你的后端路由后面。'],
      ['Append-fast core', '热路径追踪 chunk，不在每个 token 上复制整条历史。']
    ],
    pointEyebrow: '差异',
    pointTitle: '不要搬运 token，让它自己流动。',
    pointSummary: 'Qore 把流式路径本身变成响应式状态，所以 UI 只需要订阅，不需要轮询或重建。',
    proofPoints: [
      ['Provider', 'server env key', 'no browser secrets'],
      ['Primitive', 'stream()', 'reader loop + state'],
      ['热路径', 'append-only history', 'full-array clone/token']
    ],
    qoreTitle: 'Qore',
    manualTitle: '手动 stream 状态'
  }
} as const

const t = computed(() => isZh.value ? copy.zh : copy.en)
const prompt = ref(t.value.presets[0])
const activePrompt = ref(prompt.value)
const providerId = ref<ProviderId>('openai')
const activeProvider = computed(() => t.value.providers.find((provider) => provider.id === providerId.value) ?? t.value.providers[0])
const setupGuideLink = computed(() => isZh.value ? '/zh/guide/ai-native.html' : '/guide/ai-native.html')
let disposeQore: (() => Element) | null = null
let activeAnswer: ReturnType<(typeof stream)['paced']> | null = null

const setupCode = computed(() => `// server: provider key stays here
const provider = ${activeProvider.value.factory}

// browser: call your backend proxy
const answer = ${activeProvider.value.ui}`)

const qoreCode = `import { createSSEAdapter, h, stream, text } from '@qorejs/qore'

const chat = createSSEAdapter<{ prompt: string }, string>({
  url: '/api/chat',
  buildChatRequest: prompt => ({ prompt })
})

const response = stream(chat.chat(prompt))

export function App() {
  return h('main', {}, text(() => response()))
}`

const manualCode = `const [text, setText] = useState('')
const [status, setStatus] = useState('idle')

for await (const token of aiStream) {
  setStatus('streaming')
  setText(prev => prev + token)
}

return <Markdown>{text}</Markdown>`

function makeDemoTokens() {
  return [...activeProvider.value.tokens]
}

function renderDemo(value = activePrompt.value) {
  if (!qoreRoot.value) {
    return
  }

  activeAnswer?.abort()
  disposeQore?.()

  const provider = activeProvider.value
  const answer = stream.paced(makeDemoTokens(), 38)
  activeAnswer = answer

  disposeQore = mount(qoreRoot.value, () => h('section', { class: 'runtime-shell' },
    h('div', { class: 'runtime-topline' },
      h('span', { class: 'runtime-dot' }),
      h('span', {}, t.value.runtimeTitle)
    ),
    h('div', { class: 'runtime-route' },
      h('span', {}, provider.name),
      h('span', {}, provider.proxy),
      h('span', {}, 'QoreStream')
    ),
    h('p', { class: 'runtime-prompt' }, `${t.value.runtimePromptPrefix}: ${value}`),
    h('div', { class: 'runtime-code-line' },
      h('span', {}, 'const answer = stream(chat.chat(prompt))'),
      h('strong', {}, 'text(() => answer())')
    ),
    h('pre', { class: 'runtime-output' }, text(() => answer() || t.value.waiting)),
    h('div', { class: 'runtime-token-line' }, text(() => {
      const tokens = answer.chunks().slice(-4).map((chunk) => chunk.trim() || '↵')
      return tokens.length > 0 ? tokens.join('  ·  ') : t.value.tokenRailFallback
    })),
    h('div', { class: 'runtime-meta' }, text(() => {
      const status = answer.status()
      const chunks = answer.chunkCount()
      const buffered = answer.buffered()
      return `${status} / ${chunks} chunks / ${buffered} buffered`
    }))
  ))
}

function runDemo() {
  activePrompt.value = prompt.value.trim() || t.value.presets[0]
  prompt.value = activePrompt.value
  renderDemo(activePrompt.value)
}

function usePreset(value: string) {
  prompt.value = value
  runDemo()
}

function selectProvider(value: ProviderId) {
  providerId.value = value
  renderDemo(activePrompt.value)
}

onMounted(() => {
  isVisible.value = true
  renderDemo()
})

watch(isZh, () => {
  const nextPrompt = t.value.presets[0]
  prompt.value = nextPrompt
  activePrompt.value = nextPrompt
  renderDemo(nextPrompt)
})

onBeforeUnmount(() => {
  activeAnswer?.abort()
  disposeQore?.()
  activeAnswer = null
  disposeQore = null
})
</script>

<template>
  <main class="home-page" :class="{ visible: isVisible }">
    <section class="hero-section">
      <div class="aurora aurora-one"></div>
      <div class="aurora aurora-two"></div>
      <div class="hero-copy">
        <p class="eyebrow">{{ t.eyebrow }}</p>
        <h1>
          <span>{{ t.headlineTop }}</span>
          <span>{{ t.headlineBottom }}</span>
        </h1>
        <p class="tagline">{{ t.taglinePrefix }} <code>{{ t.tagline }}</code>.</p>
        <p class="summary">{{ t.summary }}</p>
        <div class="actions">
          <a class="primary-action" href="#live-demo">{{ t.primaryAction }}</a>
          <a class="secondary-action" :href="isZh ? '/zh/guide/quick-start.html' : '/guide/quick-start.html'">{{ t.quickStart }}</a>
          <a class="secondary-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">{{ t.github }}</a>
        </div>
        <div class="install-strip" :aria-label="t.installLabel">
          <span>{{ t.installLabel }}</span>
          <code>{{ t.installCommand }}</code>
        </div>
        <nav class="release-strip" :aria-label="t.releaseLabel">
          <a v-for="link in t.releaseLinks" :key="link[0]" :href="link[1]" target="_blank" rel="noreferrer">
            {{ link[0] }}
          </a>
        </nav>
        <div class="hero-stat-grid" aria-label="Qore runtime highlights">
          <div v-for="stat in t.heroStats" :key="stat[0]">
            <strong>{{ stat[0] }}</strong>
            <span>{{ stat[1] }}</span>
          </div>
        </div>
      </div>

      <div class="demo-card">
        <div class="card-heading">
          <div>
            <div class="card-label">{{ t.cardLabel }}</div>
            <p class="demo-subtitle">{{ t.demoSubtitle }}</p>
          </div>
          <a class="setup-link" :href="setupGuideLink">{{ t.docsAction }}</a>
        </div>

        <div class="signal-map" aria-label="stream to signal pipeline">
          <div v-for="step in t.signalSteps" :key="step[0]" class="signal-node">
            <span>{{ step[0] }}</span>
            <strong>{{ step[1] }}</strong>
          </div>
        </div>

        <section class="provider-panel" :aria-label="t.providerLabel">
          <div class="provider-tabs" role="tablist" :aria-label="t.providerLabel">
            <button
              v-for="provider in t.providers"
              :key="provider.id"
              type="button"
              role="tab"
              :aria-selected="provider.id === providerId"
              :class="{ active: provider.id === providerId }"
              @click="selectProvider(provider.id)"
            >
              {{ provider.name }}
            </button>
          </div>

          <div class="setup-grid">
            <div class="setup-cell">
              <span>{{ t.serverKeyLabel }}</span>
              <strong>{{ activeProvider.env }}</strong>
            </div>
            <div class="setup-cell">
              <span>{{ t.proxyLabel }}</span>
              <strong>{{ activeProvider.proxy }}</strong>
            </div>
            <div class="setup-cell">
              <span>{{ t.uiLabel }}</span>
              <strong>{{ activeProvider.ui }}</strong>
            </div>
          </div>

          <p class="provider-description">{{ activeProvider.description }}</p>
          <p class="secret-note">{{ t.secretNote }}</p>
        </section>

        <section class="flow-rail" :aria-label="t.flowLabel">
          <div v-for="step in t.flowSteps" :key="step[0]">
            <span>{{ step[0] }}</span>
            <strong>{{ step[1] }}</strong>
          </div>
        </section>

        <pre class="setup-code"><code>{{ setupCode }}</code></pre>

        <form id="live-demo" class="demo-prompt" @submit.prevent="runDemo">
          <input v-model="prompt" :aria-label="t.promptLabel" autocomplete="off" />
          <button type="submit">{{ t.streamButton }}</button>
        </form>
        <div class="preset-row" :aria-label="t.presetLabel">
          <button v-for="item in t.presets" :key="item" type="button" @click="usePreset(item)">
            {{ item }}
          </button>
        </div>
        <div ref="qoreRoot" class="qore-root"></div>
      </div>
    </section>

    <section class="pillars-section" aria-label="Qore pillars">
      <a v-for="pillar in t.pillars" :key="pillar[0]" class="pillar-card" :href="isZh ? '/zh/guide/streaming.html' : '/guide/streaming.html'">
        <span>{{ pillar[0] }}</span>
        <p>{{ pillar[1] }}</p>
      </a>
    </section>

    <section class="compare-section">
      <div class="compare-copy">
        <p class="eyebrow">{{ t.pointEyebrow }}</p>
        <h2>{{ t.pointTitle }}</h2>
        <p>{{ t.pointSummary }}</p>
        <div class="proof-strip" aria-label="Qore comparison summary">
          <div v-for="point in t.proofPoints" :key="point[0]">
            <span>{{ point[0] }}</span>
            <strong>{{ point[1] }}</strong>
            <small>{{ point[2] }}</small>
          </div>
        </div>
      </div>
      <div class="code-grid">
        <article class="code-card featured-code">
          <div class="code-title">{{ t.qoreTitle }}</div>
          <pre><code>{{ qoreCode }}</code></pre>
        </article>
        <article class="code-card muted-code">
          <div class="code-title">{{ t.manualTitle }}</div>
          <pre><code>{{ manualCode }}</code></pre>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.VPContent.is-home) {
  padding-top: 0;
  background: #020605;
}

:global(.VPContent.is-home .VPHome) {
  background: #020605;
}

:global(.VPContent.is-home .VPHome > .vp-doc.container) {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

:global(.VPContent.is-home .VPHome > .vp-doc.container > div) {
  width: 100%;
}

:global(.VPFooter) {
  margin-top: 0 !important;
  border-top: 0 !important;
  background: #020605 !important;
}

:global(.VPFooter .message),
:global(.VPFooter .copyright) {
  color: rgba(243, 255, 247, 0.56) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBar),
:global(body:has(.VPContent.is-home) .VPNavBar .content-body) {
  background: rgba(2, 6, 5, 0.74) !important;
  backdrop-filter: blur(20px);
}

:global(body:has(.VPContent.is-home) .VPNavBar .divider-line) {
  background: rgba(143, 255, 193, 0.12) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarTitle span),
:global(body:has(.VPContent.is-home) .VPNavBarMenuLink),
:global(body:has(.VPContent.is-home) .VPSocialLink),
:global(body:has(.VPContent.is-home) .VPNavBarExtra .button) {
  color: rgba(243, 255, 247, 0.84) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarMenuLink.active) {
  color: #8fffc1 !important;
}

:global(body:has(.VPContent.is-home) .DocSearch-Button) {
  color: rgba(243, 255, 247, 0.72);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(143, 255, 193, 0.16);
}

:global(body:has(.VPContent.is-home) .DocSearch-Button-Placeholder),
:global(body:has(.VPContent.is-home) .DocSearch-Search-Icon),
:global(body:has(.VPContent.is-home) .DocSearch-Button-Key) {
  color: rgba(243, 255, 247, 0.72) !important;
}

:global(body:has(.VPContent.is-home) .DocSearch-Button-Key) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(143, 255, 193, 0.14) !important;
  box-shadow: none !important;
}

:global(.VPNavBar.has-sidebar .content) {
  border-bottom: none;
}

.home-page {
  --qore-bg: #06100d;
  --qore-panel: rgba(236, 255, 241, 0.075);
  --qore-panel-strong: rgba(236, 255, 241, 0.14);
  --qore-line: rgba(164, 255, 207, 0.22);
  --qore-text: #f3fff7;
  --qore-muted: rgba(243, 255, 247, 0.68);
  --qore-accent: #8fffc1;
  --qore-cyan: #74f7ff;
  --qore-amber: #ffd36e;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  box-sizing: border-box;
  width: 100vw;
  max-width: 100%;
  margin-top: -64px;
  padding: 118px clamp(18px, 4vw, 76px) 104px;
  color: var(--qore-text);
  background:
    radial-gradient(circle at 8% 8%, rgba(116, 247, 255, 0.24), transparent 27%),
    radial-gradient(circle at 92% 12%, rgba(143, 255, 193, 0.25), transparent 30%),
    radial-gradient(circle at 54% 112%, rgba(255, 211, 110, 0.12), transparent 34%),
    linear-gradient(135deg, #06100d 0%, #10231d 48%, #020504 100%);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 700ms ease, transform 700ms ease;
}

.home-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.home-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgba(143, 255, 193, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 255, 193, 0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, black, transparent 75%);
}

.aurora {
  position: absolute;
  width: 460px;
  height: 460px;
  filter: blur(70px);
  border-radius: 999px;
  opacity: 0.45;
  animation: drift 12s ease-in-out infinite alternate;
}

.aurora-one {
  top: 80px;
  left: -120px;
  background: #1ee6a8;
}

.aurora-two {
  right: -160px;
  bottom: 140px;
  background: #42e8ff;
  animation-delay: -4s;
}

.hero-section,
.pillars-section,
.compare-section {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1640px;
  margin: 0 auto;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(440px, 1fr);
  gap: clamp(30px, 5vw, 88px);
  align-items: center;
  min-height: clamp(760px, calc(100vh - 56px), 920px);
}

.hero-copy {
  display: grid;
  gap: 20px;
  max-width: 780px;
}

.eyebrow,
.card-label,
.code-title {
  margin: 0;
  color: var(--qore-accent);
  font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.home-page h1,
.home-page h2,
.tagline,
.summary {
  margin: 0;
}

.home-page h1 {
  display: grid;
  gap: 2px;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(64px, 9.8vw, 148px) !important;
  font-weight: 950;
  line-height: 0.82;
  letter-spacing: -0.11em;
  color: transparent;
  background: linear-gradient(110deg, #ffffff 0%, #b4ffd5 48%, #73f7ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 54px rgba(143, 255, 193, 0.28);
}

.home-page h1 span {
  font: inherit;
  font-size: inherit !important;
  line-height: inherit !important;
}

.tagline {
  max-width: 760px;
  font-size: clamp(28px, 3.2vw, 48px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.06em;
}

.tagline code {
  display: inline-flex;
  padding: 0.08em 0.24em 0.12em;
  border: 1px solid rgba(143, 255, 193, 0.2);
  border-radius: 0.28em;
  color: #06100d;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
  font: 800 0.8em/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: -0.04em;
  vertical-align: 0.04em;
}

.summary,
.compare-copy p,
.pillar-card p,
.demo-subtitle,
.provider-description,
.secret-note {
  color: var(--qore-muted);
  font-size: 17px;
  line-height: 1.8;
}

.summary {
  max-width: 620px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
}

.release-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -8px;
}

.install-strip {
  display: inline-flex;
  align-items: center;
  width: max-content;
  max-width: 100%;
  min-height: 46px;
  margin-top: -4px;
  overflow: hidden;
  border: 1px solid rgba(143, 255, 193, 0.22);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.26);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.install-strip span,
.install-strip code {
  padding: 0 15px;
}

.install-strip span {
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  color: #06100d;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
  font: 900 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.install-strip code {
  min-width: 0;
  overflow: auto;
  color: #eafff1;
  font: 850 14px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: nowrap;
}

.release-strip a,
.setup-link {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid rgba(143, 255, 193, 0.18);
  border-radius: 999px;
  color: rgba(243, 255, 247, 0.72);
  background: rgba(255, 255, 255, 0.045);
  font: 800 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-decoration: none;
  transition: color 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.release-strip a:first-child {
  color: #052019;
  border-color: transparent;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
}

.release-strip a:hover,
.setup-link:hover {
  color: var(--qore-text);
  border-color: rgba(143, 255, 193, 0.48);
  background: rgba(255, 255, 255, 0.08);
}

.release-strip a:first-child:hover {
  color: #052019;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.primary-action {
  color: #052019;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
  box-shadow: 0 18px 60px rgba(116, 247, 255, 0.24);
}

.secondary-action {
  color: var(--qore-text);
  border: 1px solid var(--qore-line);
  background: rgba(255, 255, 255, 0.04);
}

.primary-action:hover,
.secondary-action:hover,
.pillar-card:hover,
.setup-link:hover {
  transform: translateY(-2px);
}

.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.hero-stat-grid div {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgba(143, 255, 193, 0.15);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
}

.hero-stat-grid strong,
.hero-stat-grid span {
  display: block;
}

.hero-stat-grid strong {
  color: var(--qore-text);
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -0.04em;
}

.hero-stat-grid span {
  margin-top: 4px;
  color: var(--qore-muted);
  font: 800 11px/1.3 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-card,
.pillar-card,
.code-card {
  box-sizing: border-box;
  border: 1px solid var(--qore-line);
  background: linear-gradient(180deg, var(--qore-panel-strong), var(--qore-panel));
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(24px);
}

.demo-card {
  display: grid;
  gap: 12px;
  align-self: center;
  justify-self: stretch;
  max-width: 820px;
  padding: clamp(16px, 2vw, 24px);
  border-radius: 34px;
  transform: rotate(0.35deg);
  position: relative;
  overflow: hidden;
}

.demo-card::before {
  position: absolute;
  inset: -1px;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 36%),
    radial-gradient(circle at 82% 18%, rgba(116, 247, 255, 0.18), transparent 26%);
}

.demo-card > * {
  position: relative;
  z-index: 1;
}

.card-heading {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}

.demo-subtitle,
.provider-description,
.secret-note {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
}

.signal-map {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.signal-node {
  position: relative;
  min-width: 0;
  padding: 14px;
  border: 1px solid rgba(143, 255, 193, 0.16);
  border-radius: 20px;
  background: rgba(1, 10, 8, 0.42);
}

.signal-node:not(:last-child)::after {
  position: absolute;
  top: 50%;
  right: -12px;
  z-index: 2;
  width: 16px;
  height: 2px;
  border-radius: 999px;
  content: '';
  background: linear-gradient(90deg, var(--qore-accent), var(--qore-cyan));
  box-shadow: 0 0 18px rgba(116, 247, 255, 0.5);
}

.signal-node span,
.signal-node strong {
  display: block;
}

.signal-node span {
  color: rgba(243, 255, 247, 0.5);
  font: 900 10px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.signal-node strong {
  margin-top: 8px;
  overflow: hidden;
  color: var(--qore-text);
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -0.045em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(143, 255, 193, 0.17);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(143, 255, 193, 0.08), rgba(116, 247, 255, 0.03)),
    rgba(1, 10, 8, 0.34);
}

.provider-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.provider-tabs button,
.demo-prompt input,
.demo-prompt button,
.preset-row button {
  border: 1px solid rgba(143, 255, 193, 0.2);
  font: 800 13px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provider-tabs button {
  min-height: 38px;
  padding: 0 10px;
  border-radius: 15px;
  color: rgba(243, 255, 247, 0.76);
  background: rgba(255, 255, 255, 0.045);
  cursor: pointer;
}

.provider-tabs button.active {
  color: #052019;
  border-color: transparent;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
  box-shadow: 0 14px 34px rgba(116, 247, 255, 0.16);
}

.setup-grid {
  display: grid;
  grid-template-columns: 0.85fr 0.8fr 1.35fr;
  gap: 8px;
}

.setup-cell,
.flow-rail div {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(143, 255, 193, 0.14);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.18);
}

.setup-cell span,
.flow-rail span {
  display: block;
  margin-bottom: 6px;
  color: rgba(243, 255, 247, 0.48);
  font: 800 10px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-cell strong,
.flow-rail strong {
  display: block;
  overflow: hidden;
  color: var(--qore-text);
  font: 850 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secret-note {
  padding-left: 12px;
  border-left: 2px solid var(--qore-accent);
  color: rgba(180, 255, 213, 0.78);
}

.flow-rail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.flow-rail div {
  position: relative;
}

.setup-code {
  margin: 0;
  padding: 14px;
  overflow: auto;
  border: 1px solid rgba(143, 255, 193, 0.14);
  border-radius: 18px;
  color: #eafff1;
  background: rgba(1, 10, 8, 0.62);
  font: 750 12px/1.62 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-prompt {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.demo-prompt input {
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border-radius: 16px;
  color: var(--qore-text);
  background: rgba(1, 10, 8, 0.58);
  outline: none;
}

.demo-prompt input:focus {
  border-color: rgba(143, 255, 193, 0.72);
  box-shadow: 0 0 0 4px rgba(143, 255, 193, 0.12);
}

.demo-prompt button {
  height: 44px;
  padding: 0 16px;
  border-radius: 16px;
  color: #052019;
  background: linear-gradient(135deg, var(--qore-accent), var(--qore-cyan));
  cursor: pointer;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-row button {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  color: rgba(243, 255, 247, 0.72);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.preset-row button:hover {
  color: var(--qore-text);
  border-color: rgba(143, 255, 193, 0.5);
}

.qore-root {
  min-height: 274px;
}

:deep(.runtime-shell) {
  display: grid;
  gap: 14px;
  height: 100%;
  min-height: 274px;
  padding: clamp(18px, 2.2vw, 24px);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(5, 24, 19, 0.94), rgba(3, 8, 8, 0.98)),
    radial-gradient(circle at 20% 20%, rgba(143, 255, 193, 0.22), transparent 36%);
  border: 1px solid rgba(143, 255, 193, 0.2);
}

:deep(.runtime-topline),
:deep(.runtime-route) {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--qore-muted);
  font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

:deep(.runtime-route) {
  flex-wrap: wrap;
  gap: 7px;
  letter-spacing: 0;
  text-transform: none;
}

:deep(.runtime-route span) {
  padding: 6px 9px;
  border: 1px solid rgba(143, 255, 193, 0.14);
  border-radius: 999px;
  color: rgba(243, 255, 247, 0.72);
  background: rgba(255, 255, 255, 0.045);
}

:deep(.runtime-prompt) {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: rgba(234, 255, 241, 0.6);
  font: 800 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.runtime-code-line),
:deep(.runtime-token-line) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(143, 255, 193, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
  color: rgba(234, 255, 241, 0.68);
  font: 800 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.runtime-code-line strong) {
  color: var(--qore-accent);
}

:deep(.runtime-token-line) {
  color: var(--qore-amber);
  min-height: 40px;
}

:deep(.runtime-dot) {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--qore-accent);
  box-shadow: 0 0 24px var(--qore-accent);
}

:deep(.runtime-output) {
  min-height: 112px;
  margin: 0;
  white-space: pre-wrap;
  color: #eafff1;
  font: 700 clamp(19px, 2vw, 30px)/1.24 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: -0.035em;
}

:deep(.runtime-meta) {
  align-self: end;
  color: rgba(234, 255, 241, 0.64);
  font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.pillars-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.pillar-card {
  display: grid;
  gap: 10px;
  min-height: 160px;
  padding: 22px;
  border-radius: 24px;
  color: inherit;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease;
}

.pillar-card:hover {
  border-color: rgba(143, 255, 193, 0.58);
}

.pillar-card span {
  color: var(--qore-text);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.pillar-card p {
  margin: 0;
}

.compare-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 26px;
  align-items: start;
  margin-top: 80px;
}

.compare-copy h2 {
  margin-top: 14px;
  font-size: clamp(34px, 4vw, 58px);
  line-height: 1.06;
  letter-spacing: -0.07em;
}

.proof-strip {
  display: grid;
  gap: 10px;
  margin-top: 28px;
}

.proof-strip div {
  display: grid;
  grid-template-columns: 94px 1fr;
  gap: 4px 14px;
  align-items: baseline;
  padding: 14px 16px;
  border: 1px solid rgba(143, 255, 193, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.proof-strip span,
.proof-strip small {
  color: var(--qore-muted);
  font: 800 12px/1.3 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
}

.proof-strip strong {
  color: var(--qore-text);
  font-size: 18px;
}

.proof-strip small {
  grid-column: 2;
  text-transform: none;
  opacity: 0.72;
}

.code-grid {
  display: grid;
  gap: 16px;
}

.code-card {
  overflow: hidden;
  border-radius: 24px;
}

.code-title {
  padding: 16px 18px 0;
}

.code-card pre {
  margin: 0;
  padding: 18px;
  overflow: auto;
  color: #eafff1;
  font: 700 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.featured-code {
  border-color: rgba(143, 255, 193, 0.45);
}

.muted-code {
  opacity: 0.7;
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(42px, -28px, 0) scale(1.12);
  }
}

@media (max-width: 1100px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .demo-card {
    max-width: none;
  }
}

@media (max-width: 920px) {
  .home-page {
    margin-top: -56px;
    padding: 112px 18px 64px;
  }

  .compare-section,
  .pillars-section {
    grid-template-columns: 1fr;
  }

  .hero-section {
    min-height: auto;
  }

  .demo-card {
    transform: none;
  }

  .card-heading,
  .demo-prompt {
    grid-template-columns: 1fr;
  }

  .card-heading {
    display: grid;
  }

  .setup-link,
  .demo-prompt button {
    width: 100%;
    justify-content: center;
  }

  .provider-tabs,
  .setup-grid,
  .flow-rail,
  .signal-map,
  .hero-stat-grid {
    grid-template-columns: 1fr;
  }

  .signal-node:not(:last-child)::after {
    top: auto;
    right: auto;
    bottom: -10px;
    left: 24px;
    width: 2px;
    height: 14px;
  }

  .preset-row {
    display: none;
  }

  .setup-code {
    font-size: 11px;
  }

  .qore-root {
    min-height: 292px;
  }

  :deep(.runtime-shell) {
    min-height: 292px;
  }

  :deep(.runtime-output) {
    min-height: 126px;
  }

  .proof-strip div {
    grid-template-columns: 1fr;
  }

  .proof-strip small {
    grid-column: 1;
  }
}

@media (max-width: 640px) {
  .home-page h1 {
    font-size: clamp(58px, 21vw, 86px) !important;
  }

  .tagline {
    font-size: clamp(27px, 8vw, 38px);
  }
}
</style>
