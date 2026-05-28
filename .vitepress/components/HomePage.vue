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
  badge: string
  env: string
  factory: string
  description: string
  tokens: readonly string[]
}

const copy = {
  en: {
    eyebrow: 'Qore 1.0',
    headline: 'Streaming UI, reduced to one primitive.',
    summary: 'Qore turns streamed data into reactive interface state. No string shuffling, no broad rerenders, no special-case streaming layer.',
    streamEqualsSignal: 'stream = signal',
    primaryAction: 'Open the live demo',
    secondaryAction: 'Read the quick start',
    tertiaryAction: 'GitHub',
    installLabel: 'Install',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: 'Stable release',
    releaseValue: 'v1.0.0',
    releaseHref: 'https://github.com/qorejs/qore/releases/tag/v1.0.0',
    demoEyebrow: 'Live demo',
    demoTitle: 'One provider in. One signal out.',
    demoSummary: 'Pick a provider, send one prompt, and watch Qore update a single text node as tokens arrive.',
    promptLabel: 'Prompt',
    promptButton: 'Stream',
    presetsLabel: 'Presets',
    runtimeLabel: 'Runtime output',
    waiting: 'waiting for the first token...',
    promptPrefix: 'prompt',
    statusPrefix: 'status',
    chunksPrefix: 'chunks',
    providersLabel: 'Providers',
    setupGuide: 'Provider guide',
    architectureLabel: 'Architecture',
    architecture: [
      ['Server', 'provider key stays here'],
      ['Runtime', 'readonly signal + async iterable'],
      ['DOM', 'only the bound text node updates']
    ],
    codeEyebrow: 'Three lines',
    codeTitle: 'The product story should fit in one glance.',
    codeSummary: 'This is the center of Qore. The rest of the runtime exists to keep this path reliable in real products.',
    codeSample: `import { h, stream, text } from '@qorejs/qore'

const answer = stream(chat.chat(prompt))

return h('main', {}, text(() => answer()))`,
    featureEyebrow: 'Why it lands',
    features: [
      ['Composable streams', 'merge, concat, pipe, race, retryable, and switchMap are built into the runtime.'],
      ['Provider-complete', 'OpenAI, Anthropic, OpenRouter, DeepSeek, Ollama, and generic SSE share the same UI surface.'],
      ['Server to browser', 'createSSEResponse keeps the backend and the browser on one streaming contract.']
    ],
    proofEyebrow: 'What ships',
    proofTitle: 'A focused 1.0 runtime, not another bulky framework.',
    proofSummary: 'Qore keeps the promise narrow: streams, signals, DOM binding, providers, and the server glue that makes streaming UI practical.',
    proofPoints: [
      ['1 primitive', 'stream = signal'],
      ['6 providers', 'OpenAI to Ollama'],
      ['retry + resume', 'SSE-ready'],
      ['browser + server', 'one toolkit']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        badge: 'cloud',
        env: 'OPENAI_API_KEY',
        factory: 'createOpenAI({ apiKey: process.env.OPENAI_API_KEY })',
        description: 'Stream from OpenAI on the server and bind the browser to one readonly signal.',
        tokens: [
          'OpenAI selected. ',
          'The API key stays server-side. ',
          'Tokens stream through your route. ',
          'Qore updates one signal.'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        badge: 'cloud',
        env: 'ANTHROPIC_API_KEY',
        factory: 'createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })',
        description: 'Change providers without changing the browser-side binding or UI rendering model.',
        tokens: [
          'Anthropic selected. ',
          'Claude streams from the server. ',
          'The browser receives safe chunks. ',
          'The same text node keeps updating.'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        badge: 'custom',
        env: 'CUSTOM_AI_API_KEY',
        factory: "createSSEAdapter({ url: '/api/chat' })",
        description: 'Wrap your current SSE backend once and reuse the same stream surface everywhere.',
        tokens: [
          'Generic SSE selected. ',
          'Your backend owns the vendor call. ',
          'Qore consumes the stream. ',
          'The UI stays declarative.'
        ]
      }
    ] satisfies readonly ProviderCopy[],
    presets: [
      'Explain stream = signal',
      'Show a tiny AI chat reply',
      'Why does token-level UI matter?'
    ]
  },
  zh: {
    eyebrow: 'Qore 1.0',
    headline: '把流式 UI 收敛成一个原语。',
    summary: 'Qore 把流式数据直接变成响应式界面状态。不再手动拼字符串，不再整片重渲染，也不需要再额外发明一层 streaming 状态系统。',
    streamEqualsSignal: 'stream = signal',
    primaryAction: '打开实时演示',
    secondaryAction: '阅读快速开始',
    tertiaryAction: 'GitHub',
    installLabel: '安装',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: '稳定版本',
    releaseValue: 'v1.0.0',
    releaseHref: 'https://github.com/qorejs/qore/releases/tag/v1.0.0',
    demoEyebrow: '实时演示',
    demoTitle: '一次 provider 调用，得到一条 signal。',
    demoSummary: '选择模型厂商，发送一个 prompt，然后看 Qore 如何在 token 抵达时只更新一个 text node。',
    promptLabel: '提示词',
    promptButton: 'Stream',
    presetsLabel: '预设',
    runtimeLabel: '运行时输出',
    waiting: '等待第一个 token...',
    promptPrefix: '提示词',
    statusPrefix: '状态',
    chunksPrefix: 'chunks',
    providersLabel: 'Providers',
    setupGuide: 'Provider 指南',
    architectureLabel: '架构',
    architecture: [
      ['Server', 'provider key 留在这里'],
      ['Runtime', '只读 signal + async iterable'],
      ['DOM', '只更新绑定的 text node']
    ],
    codeEyebrow: '三行代码',
    codeTitle: '产品表达应该一眼就能读懂。',
    codeSummary: '这就是 Qore 的核心。其余运行时能力，都是为了让这条路径在真实产品里足够可靠。',
    codeSample: `import { h, stream, text } from '@qorejs/qore'

const answer = stream(chat.chat(prompt))

return h('main', {}, text(() => answer()))`,
    featureEyebrow: '为什么成立',
    features: [
      ['可编排的流', 'merge、concat、pipe、race、retryable 与 switchMap 已内建进运行时。'],
      ['完整 provider 面', 'OpenAI、Anthropic、OpenRouter、DeepSeek、Ollama 与通用 SSE 共用同一套 UI 表达。'],
      ['从服务端到浏览器', 'createSSEResponse 让后端输出与浏览器消费使用同一条流式契约。']
    ],
    proofEyebrow: '1.0 包含什么',
    proofTitle: '一个聚焦的 1.0 运行时，而不是又一个臃肿框架。',
    proofSummary: 'Qore 把承诺压得很窄：streams、signals、DOM binding、providers，以及让 streaming UI 真正能上线的服务端胶水。',
    proofPoints: [
      ['1 primitive', 'stream = signal'],
      ['6 providers', 'OpenAI 到 Ollama'],
      ['retry + resume', 'SSE 级韧性'],
      ['browser + server', '一套工具链']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        badge: 'cloud',
        env: 'OPENAI_API_KEY',
        factory: 'createOpenAI({ apiKey: process.env.OPENAI_API_KEY })',
        description: 'OpenAI 留在服务端，浏览器只依赖一条只读 signal。',
        tokens: [
          '已选择 OpenAI。',
          'API key 留在服务端。',
          'Token 通过你的路由流向前端。',
          'Qore 只更新一个 signal。'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        badge: 'cloud',
        env: 'ANTHROPIC_API_KEY',
        factory: 'createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })',
        description: '切换 provider，不需要改浏览器侧绑定，也不需要改 UI 更新模型。',
        tokens: [
          '已选择 Anthropic。',
          'Claude 在服务端流式输出。',
          '浏览器只接收安全 chunk。',
          '同一个 text node 持续更新。'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        badge: 'custom',
        env: 'CUSTOM_AI_API_KEY',
        factory: "createSSEAdapter({ url: '/api/chat' })",
        description: '把你现有的 SSE 后端接进来一次，之后整条 UI 流式路径都复用同一套表面。',
        tokens: [
          '已选择通用 SSE。',
          '厂商调用由你的后端负责。',
          'Qore 消费这条流。',
          'UI 依旧保持声明式。'
        ]
      }
    ] satisfies readonly ProviderCopy[],
    presets: [
      '解释 stream = signal',
      '展示一段简短 AI 回复',
      '为什么 token 级 UI 很重要？'
    ]
  }
} as const

const t = computed(() => isZh.value ? copy.zh : copy.en)
const prompt = ref(t.value.presets[0])
const activePrompt = ref(prompt.value)
const providerId = ref<ProviderId>('openai')
const activeProvider = computed(() => t.value.providers.find((provider) => provider.id === providerId.value) ?? t.value.providers[0])
const setupGuideLink = computed(() => isZh.value ? '/zh/guide/ai-native.html' : '/guide/ai-native.html')
const quickStartLink = computed(() => isZh.value ? '/zh/guide/quick-start.html' : '/guide/quick-start.html')
let disposeQore: (() => Element) | null = null
let activeAnswer: ReturnType<(typeof stream)['paced']> | null = null

function makeDemoTokens() {
  return [...activeProvider.value.tokens]
}

function renderDemo(value = activePrompt.value) {
  if (!qoreRoot.value) {
    return
  }

  activeAnswer?.abort()
  disposeQore?.()

  const answer = stream.paced(makeDemoTokens(), 42)
  activeAnswer = answer

  disposeQore = mount(qoreRoot.value, () => h('section', { class: 'runtime-shell' },
    h('div', { class: 'runtime-header' },
      h('span', { class: 'runtime-dot' }),
      h('strong', {}, activeProvider.value.name),
      h('small', {}, activeProvider.value.badge)
    ),
    h('p', { class: 'runtime-prompt' }, `${t.value.promptPrefix}: ${value}`),
    h('div', { class: 'runtime-line' },
      h('span', {}, 'const answer = stream(chat.chat(prompt))')
    ),
    h('div', { class: 'runtime-output-label' }, t.value.runtimeLabel),
    h('pre', { class: 'runtime-output' }, text(() => answer() || t.value.waiting)),
    h('div', { class: 'runtime-meta' }, text(() => {
      return `${t.value.statusPrefix}: ${answer.status()}  /  ${t.value.chunksPrefix}: ${answer.chunkCount()}`
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
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">{{ t.eyebrow }}</p>
        <h1>{{ t.headline }}</h1>
        <p class="signal-chip">{{ t.streamEqualsSignal }}</p>
        <p class="summary">{{ t.summary }}</p>

        <div class="actions">
          <a class="primary-action" href="#live-demo">{{ t.primaryAction }}</a>
          <a class="secondary-action" :href="quickStartLink">{{ t.secondaryAction }}</a>
          <a class="ghost-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">{{ t.tertiaryAction }}</a>
        </div>

        <div class="meta-strip">
          <div class="meta-card install-card">
            <span>{{ t.installLabel }}</span>
            <code>{{ t.installCommand }}</code>
          </div>
          <a class="meta-card release-card" :href="t.releaseHref" target="_blank" rel="noreferrer">
            <span>{{ t.releaseLabel }}</span>
            <strong>{{ t.releaseValue }}</strong>
          </a>
        </div>
      </div>

      <section id="live-demo" class="demo-panel">
        <div class="demo-heading">
          <div>
            <p class="eyebrow">{{ t.demoEyebrow }}</p>
            <h2>{{ t.demoTitle }}</h2>
          </div>
          <a class="inline-link" :href="setupGuideLink">{{ t.setupGuide }}</a>
        </div>

        <p class="demo-summary">{{ t.demoSummary }}</p>

        <div class="provider-tabs" role="tablist" :aria-label="t.providersLabel">
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

        <div class="provider-info">
          <div>
            <span>env</span>
            <strong>{{ activeProvider.env }}</strong>
          </div>
          <div>
            <span>factory</span>
            <strong>{{ activeProvider.factory }}</strong>
          </div>
        </div>

        <p class="provider-description">{{ activeProvider.description }}</p>

        <form class="prompt-row" @submit.prevent="runDemo">
          <input v-model="prompt" :aria-label="t.promptLabel" autocomplete="off" />
          <button type="submit">{{ t.promptButton }}</button>
        </form>

        <div class="preset-row" :aria-label="t.presetsLabel">
          <button v-for="item in t.presets" :key="item" type="button" @click="usePreset(item)">
            {{ item }}
          </button>
        </div>

        <div class="runtime-root" ref="qoreRoot"></div>
      </section>
    </section>

    <section class="feature-grid" :aria-label="t.featureEyebrow">
      <article v-for="feature in t.features" :key="feature[0]" class="feature-card">
        <h3>{{ feature[0] }}</h3>
        <p>{{ feature[1] }}</p>
      </article>
    </section>

    <section class="proof-layout">
      <article class="code-card">
        <p class="eyebrow">{{ t.codeEyebrow }}</p>
        <h2>{{ t.codeTitle }}</h2>
        <p class="section-summary">{{ t.codeSummary }}</p>
        <pre><code>{{ t.codeSample }}</code></pre>
      </article>

      <article class="proof-card">
        <p class="eyebrow">{{ t.proofEyebrow }}</p>
        <h2>{{ t.proofTitle }}</h2>
        <p class="section-summary">{{ t.proofSummary }}</p>

        <div class="proof-grid">
          <div v-for="point in t.proofPoints" :key="point[0]" class="proof-item">
            <span>{{ point[0] }}</span>
            <strong>{{ point[1] }}</strong>
            <small>{{ point[2] }}</small>
          </div>
        </div>

        <div class="architecture-card">
          <span class="architecture-label">{{ t.architectureLabel }}</span>
          <div class="architecture-list">
            <div v-for="item in t.architecture" :key="item[0]">
              <strong>{{ item[0] }}</strong>
              <span>{{ item[1] }}</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
:global(.VPContent.is-home) {
  padding-top: 0;
  background: #07100d;
}

:global(.VPContent.is-home .VPHome),
:global(.VPFooter) {
  background: #07100d;
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
}

:global(.VPFooter .message),
:global(.VPFooter .copyright) {
  color: rgba(238, 248, 241, 0.56) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBar),
:global(body:has(.VPContent.is-home) .VPNavBar .content-body) {
  background: rgba(7, 16, 13, 0.82) !important;
  backdrop-filter: blur(16px);
}

:global(body:has(.VPContent.is-home) .VPNavBar .divider-line) {
  background: rgba(172, 255, 223, 0.08) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarTitle span),
:global(body:has(.VPContent.is-home) .VPNavBarMenuLink),
:global(body:has(.VPContent.is-home) .VPSocialLink),
:global(body:has(.VPContent.is-home) .VPNavBarExtra .button) {
  color: rgba(246, 252, 248, 0.82) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarMenuLink.active) {
  color: #9df7d0 !important;
}

:global(body:has(.VPContent.is-home) .DocSearch-Button) {
  color: rgba(246, 252, 248, 0.72);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(172, 255, 223, 0.14);
}

:global(body:has(.VPContent.is-home) .DocSearch-Button-Placeholder),
:global(body:has(.VPContent.is-home) .DocSearch-Search-Icon),
:global(body:has(.VPContent.is-home) .DocSearch-Button-Key) {
  color: rgba(246, 252, 248, 0.72) !important;
}

.home-page {
  --bg: #07100d;
  --panel: rgba(255, 255, 255, 0.055);
  --panel-strong: rgba(255, 255, 255, 0.08);
  --line: rgba(172, 255, 223, 0.12);
  --text: #f6fcf8;
  --muted: rgba(246, 252, 248, 0.68);
  --accent: #9df7d0;
  --accent-strong: #63f0ff;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: -64px;
  padding: 112px clamp(20px, 4vw, 72px) 96px;
  color: var(--text);
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 240, 255, 0.18), transparent 26%),
    radial-gradient(circle at 100% 0%, rgba(157, 247, 208, 0.18), transparent 28%),
    linear-gradient(180deg, #07100d 0%, #0b1411 46%, #07100d 100%);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 500ms ease, transform 500ms ease;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(172, 255, 223, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(172, 255, 223, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}

.home-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero,
.feature-grid,
.proof-layout {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 520px);
  gap: clamp(28px, 4vw, 56px);
  align-items: start;
}

.hero-copy {
  display: grid;
  gap: 20px;
  max-width: 700px;
  padding-top: 18px;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font: 800 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2,
h3,
.summary,
.demo-summary,
.provider-description,
.section-summary,
.feature-card p {
  margin: 0;
}

h1 {
  max-width: 11ch;
  font-family: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  font-size: clamp(58px, 8vw, 104px);
  line-height: 0.92;
  letter-spacing: -0.08em;
  color: transparent;
  background: linear-gradient(115deg, #ffffff 0%, #d7fff0 52%, #8cf5ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

h2 {
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

h3 {
  font-size: 22px;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.signal-chip {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(157, 247, 208, 0.18);
  border-radius: 999px;
  color: #06110d;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  font: 900 clamp(18px, 2vw, 28px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: -0.05em;
}

.summary,
.demo-summary,
.provider-description,
.section-summary,
.feature-card p {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-action,
.secondary-action,
.ghost-action,
.inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.primary-action {
  color: #06110d;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 18px 56px rgba(99, 240, 255, 0.18);
}

.secondary-action,
.ghost-action,
.inline-link {
  color: var(--text);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.035);
}

.primary-action:hover,
.secondary-action:hover,
.ghost-action:hover,
.inline-link:hover,
.provider-tabs button:hover,
.preset-row button:hover,
.prompt-row button:hover {
  transform: translateY(-2px);
}

.meta-strip {
  display: grid;
  gap: 12px;
  max-width: 560px;
}

.meta-card {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  text-decoration: none;
}

.meta-card span {
  color: rgba(246, 252, 248, 0.54);
  font: 800 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.meta-card code,
.meta-card strong {
  color: var(--text);
  font: 800 15px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-panel,
.feature-card,
.code-card,
.proof-card {
  border: 1px solid var(--line);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04));
  box-shadow: 0 26px 90px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.demo-panel {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.demo-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.demo-heading h2 {
  max-width: 10ch;
}

.provider-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.provider-tabs button,
.prompt-row input,
.prompt-row button,
.preset-row button {
  border: 1px solid rgba(157, 247, 208, 0.16);
  font: 800 13px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provider-tabs button {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 14px;
  color: rgba(246, 252, 248, 0.72);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.provider-tabs button.active,
.prompt-row button {
  color: #06110d;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.provider-info {
  display: grid;
  gap: 8px;
}

.provider-info div,
.architecture-card {
  padding: 14px 16px;
  border: 1px solid rgba(157, 247, 208, 0.12);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.16);
}

.provider-info span,
.architecture-label,
.proof-item span,
.proof-item small {
  display: block;
  color: rgba(246, 252, 248, 0.52);
  font: 800 10px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.provider-info strong,
.proof-item strong {
  display: block;
  margin-top: 8px;
  color: var(--text);
  font-size: 16px;
  line-height: 1.45;
  word-break: break-word;
}

.prompt-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.prompt-row input {
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  color: var(--text);
  background: rgba(0, 0, 0, 0.2);
  outline: none;
}

.prompt-row input:focus {
  border-color: rgba(157, 247, 208, 0.52);
  box-shadow: 0 0 0 4px rgba(157, 247, 208, 0.08);
}

.prompt-row button {
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
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
  color: rgba(246, 252, 248, 0.7);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.runtime-root {
  min-height: 252px;
}

:deep(.runtime-shell) {
  display: grid;
  gap: 12px;
  min-height: 252px;
  padding: 18px;
  border: 1px solid rgba(157, 247, 208, 0.14);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(4, 10, 8, 0.96), rgba(7, 16, 13, 0.9));
}

:deep(.runtime-header) {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font: 800 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.runtime-header strong) {
  color: var(--text);
}

:deep(.runtime-header small) {
  padding: 4px 8px;
  border: 1px solid rgba(157, 247, 208, 0.14);
  border-radius: 999px;
  color: rgba(246, 252, 248, 0.58);
}

:deep(.runtime-dot) {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 22px var(--accent);
}

:deep(.runtime-prompt),
:deep(.runtime-line),
:deep(.runtime-output-label),
:deep(.runtime-meta) {
  color: rgba(246, 252, 248, 0.64);
  font: 800 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.runtime-line) {
  padding: 10px 12px;
  border: 1px solid rgba(157, 247, 208, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

:deep(.runtime-output) {
  min-height: 112px;
  margin: 0;
  white-space: pre-wrap;
  color: #f4fff8;
  font: 700 clamp(21px, 2vw, 30px)/1.18 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: -0.03em;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.feature-card {
  display: grid;
  gap: 10px;
  padding: 22px;
}

.proof-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 18px;
  margin-top: 28px;
}

.code-card,
.proof-card {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.code-card pre {
  margin: 0;
  overflow: auto;
  padding: 18px;
  border: 1px solid rgba(157, 247, 208, 0.12);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.18);
  color: #f4fff8;
  font: 800 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.proof-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.proof-item {
  padding: 14px 16px;
  border: 1px solid rgba(157, 247, 208, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

.proof-item small {
  margin-top: 6px;
  text-transform: none;
  letter-spacing: 0;
}

.architecture-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.architecture-list div {
  display: grid;
  gap: 4px;
}

.architecture-list strong {
  font-size: 17px;
  letter-spacing: -0.03em;
}

.architecture-list span {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .hero,
  .proof-layout,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .home-page {
    margin-top: -56px;
    padding: 106px 18px 72px;
  }

  .demo-heading,
  .prompt-row,
  .provider-tabs,
  .proof-grid {
    grid-template-columns: 1fr;
  }

  .demo-heading {
    display: grid;
  }

  .inline-link,
  .prompt-row button {
    width: 100%;
  }

  .preset-row {
    display: none;
  }
}

@media (max-width: 640px) {
  h1 {
    max-width: 8ch;
    font-size: clamp(48px, 18vw, 72px);
  }

  .signal-chip {
    font-size: 18px;
  }
}
</style>
