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
  description: string
  tokens: readonly string[]
}

const copy = {
  en: {
    eyebrow: 'Qore 1.0',
    headline: 'Turn streamed data into reactive UI.',
    summary: 'Qore is a runtime for AI and realtime interfaces. Its core claim is simple: stream = signal.',
    codeLabel: 'The whole idea',
    codeSample: `const answer = stream(chat.chat(prompt))\nreturn h('main', {}, text(() => answer()))`,
    installLabel: 'Install',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: 'Stable',
    releaseValue: 'v1.0.0',
    signalLabel: 'Core primitive',
    signalValue: 'stream = signal',
    proofTitle: 'Why it feels different',
    proofCards: [
      ['One source of truth', 'The stream is already your state.'],
      ['No token plumbing', 'You do not shuttle chunks through extra state layers.'],
      ['Narrow DOM work', 'Only the node reading the signal needs to update.']
    ],
    flowTitle: 'How it works',
    flowSteps: [
      ['01', 'The server streams tokens from the model.'],
      ['02', 'Qore exposes one readonly signal in the browser.'],
      ['03', 'Your bound text node updates as data arrives.']
    ],
    demoTitle: 'See it run',
    demoSummary: 'Choose a provider and stream one response.',
    demoPromptLabel: 'Prompt',
    demoButton: 'Stream',
    presetLabel: 'Presets',
    providerLabel: 'Provider',
    waiting: 'waiting for the first token...',
    promptPrefix: 'prompt',
    statusPrefix: 'status',
    chunksPrefix: 'chunks',
    guideAction: 'Provider guide',
    quickStartAction: 'Quick start',
    githubAction: 'GitHub',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'Server-side OpenAI stream, one browser-side signal.',
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
        env: 'ANTHROPIC_API_KEY',
        description: 'Swap providers without changing the UI model.',
        tokens: [
          'Anthropic selected. ',
          'Claude streams from the server. ',
          'The browser receives safe chunks. ',
          'The same UI binding keeps working.'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: 'Wrap your current SSE route once and reuse the same primitive.',
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
      'Show a tiny AI reply',
      'Why does token-level UI matter?'
    ]
  },
  zh: {
    eyebrow: 'Qore 1.0',
    headline: '把流式数据直接变成响应式 UI。',
    summary: 'Qore 是一个面向 AI 与实时界面的运行时。它的核心主张很简单：stream = signal。',
    codeLabel: '核心就是这两行',
    codeSample: `const answer = stream(chat.chat(prompt))\nreturn h('main', {}, text(() => answer()))`,
    installLabel: '安装',
    installCommand: 'npm i @qorejs/qore',
    releaseLabel: '稳定版',
    releaseValue: 'v1.0.0',
    signalLabel: '核心原语',
    signalValue: 'stream = signal',
    proofTitle: '为什么它不一样',
    proofCards: [
      ['一条状态源', '这条流本身就是你的状态。'],
      ['不再手搬 token', '不需要再把 chunk 搬进额外的状态层。'],
      ['DOM 精准更新', '只有读取 signal 的节点需要变化。']
    ],
    flowTitle: '它如何工作',
    flowSteps: [
      ['01', '服务端从模型持续输出 token。'],
      ['02', 'Qore 在浏览器里暴露一条只读 signal。'],
      ['03', '绑定的 text node 会随着数据抵达持续更新。']
    ],
    demoTitle: '直接看效果',
    demoSummary: '选择一个 provider，流式输出一段响应。',
    demoPromptLabel: '提示词',
    demoButton: 'Stream',
    presetLabel: '预设',
    providerLabel: 'Provider',
    waiting: '等待第一个 token...',
    promptPrefix: '提示词',
    statusPrefix: '状态',
    chunksPrefix: 'chunks',
    guideAction: 'Provider 指南',
    quickStartAction: '快速开始',
    githubAction: 'GitHub',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'OpenAI 留在服务端，浏览器只依赖一条 signal。',
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
        env: 'ANTHROPIC_API_KEY',
        description: '切换 provider，不需要改变 UI 更新模型。',
        tokens: [
          '已选择 Anthropic。',
          'Claude 在服务端流式输出。',
          '浏览器只接收安全 chunk。',
          '同一个 UI 绑定持续工作。'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: '把你现有的 SSE 路由接进来一次即可。',
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
const quickStartLink = computed(() => isZh.value ? '/zh/guide/quick-start.html' : '/guide/quick-start.html')
const providerGuideLink = computed(() => isZh.value ? '/zh/guide/ai-native.html' : '/guide/ai-native.html')
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
    h('div', { class: 'runtime-provider' }, activeProvider.value.name),
    h('p', { class: 'runtime-prompt' }, `${t.value.promptPrefix}: ${value}`),
    h('pre', { class: 'runtime-output' }, text(() => answer() || t.value.waiting)),
    h('div', { class: 'runtime-meta' }, text(() => `${t.value.statusPrefix}: ${answer.status()}  /  ${t.value.chunksPrefix}: ${answer.chunkCount()}`))
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
    <section class="hero-shell">
      <div class="hero-copy">
        <p class="eyebrow">{{ t.eyebrow }}</p>
        <h1>{{ t.headline }}</h1>
        <p class="summary">{{ t.summary }}</p>

        <div class="hero-meta">
          <div class="hero-pill">
            <span>{{ t.signalLabel }}</span>
            <strong>{{ t.signalValue }}</strong>
          </div>
          <div class="hero-pill">
            <span>{{ t.installLabel }}</span>
            <code>{{ t.installCommand }}</code>
          </div>
          <div class="hero-pill">
            <span>{{ t.releaseLabel }}</span>
            <strong>{{ t.releaseValue }}</strong>
          </div>
        </div>

        <div class="code-block">
          <span>{{ t.codeLabel }}</span>
          <pre><code>{{ t.codeSample }}</code></pre>
        </div>

        <div class="hero-actions">
          <a class="primary-action" href="#live-demo">{{ t.demoTitle }}</a>
          <a class="secondary-action" :href="quickStartLink">{{ t.quickStartAction }}</a>
          <a class="ghost-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">{{ t.githubAction }}</a>
        </div>
      </div>

      <section id="live-demo" class="demo-panel">
        <div class="demo-panel-head">
          <div>
            <p class="demo-kicker">{{ t.demoTitle }}</p>
            <h2>{{ t.demoSummary }}</h2>
          </div>
          <a class="inline-link" :href="providerGuideLink">{{ t.guideAction }}</a>
        </div>

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

        <div class="provider-card">
          <span>env</span>
          <strong>{{ activeProvider.env }}</strong>
          <p>{{ activeProvider.description }}</p>
        </div>

        <form class="prompt-row" @submit.prevent="runDemo">
          <input v-model="prompt" :aria-label="t.demoPromptLabel" autocomplete="off" />
          <button type="submit">{{ t.demoButton }}</button>
        </form>

        <div class="preset-row" :aria-label="t.presetLabel">
          <button v-for="item in t.presets" :key="item" type="button" @click="usePreset(item)">
            {{ item }}
          </button>
        </div>

        <div ref="qoreRoot" class="runtime-root"></div>
      </section>
    </section>

    <section class="proof-section">
      <div class="section-head">
        <p class="section-label">Qore</p>
        <h2>{{ t.proofTitle }}</h2>
      </div>
      <div class="proof-grid">
        <article v-for="card in t.proofCards" :key="card[0]" class="proof-card">
          <h3>{{ card[0] }}</h3>
          <p>{{ card[1] }}</p>
        </article>
      </div>
    </section>

    <section class="flow-section">
      <div class="section-head">
        <p class="section-label">Flow</p>
        <h2>{{ t.flowTitle }}</h2>
      </div>
      <div class="flow-grid">
        <article v-for="step in t.flowSteps" :key="step[0]" class="flow-card">
          <span>{{ step[0] }}</span>
          <p>{{ step[1] }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.VPContent.is-home) {
  padding-top: 0;
  background: #09110f;
}

:global(.VPContent.is-home .VPHome),
:global(.VPFooter) {
  background: #09110f;
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
  background: rgba(9, 17, 15, 0.84) !important;
  backdrop-filter: blur(16px);
}

:global(body:has(.VPContent.is-home) .VPNavBar .divider-line) {
  background: rgba(173, 255, 225, 0.08) !important;
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
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(173, 255, 225, 0.12);
}

:global(body:has(.VPContent.is-home) .DocSearch-Button-Placeholder),
:global(body:has(.VPContent.is-home) .DocSearch-Search-Icon),
:global(body:has(.VPContent.is-home) .DocSearch-Button-Key) {
  color: rgba(246, 252, 248, 0.72) !important;
}

.home-page {
  --text: #f4fbf7;
  --muted: rgba(244, 251, 247, 0.7);
  --line: rgba(173, 255, 225, 0.12);
  --panel: rgba(255, 255, 255, 0.045);
  --accent: #9df7d0;
  --accent-strong: #6ae9ff;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: -64px;
  padding: 112px clamp(20px, 4vw, 72px) 96px;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(106, 233, 255, 0.1), transparent 26%),
    radial-gradient(circle at 82% 0%, rgba(157, 247, 208, 0.14), transparent 30%),
    linear-gradient(180deg, #09110f 0%, #0d1613 48%, #09110f 100%);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 360ms ease, transform 360ms ease;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(173, 255, 225, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(173, 255, 225, 0.025) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.home-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-shell,
.proof-section,
.flow-section {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 460px);
  gap: clamp(28px, 4vw, 64px);
  align-items: start;
}

.hero-copy {
  display: grid;
  gap: 22px;
  max-width: 720px;
}

.eyebrow,
.section-label,
.demo-kicker,
.provider-card span,
.flow-card span,
.hero-pill span {
  margin: 0;
  color: rgba(244, 251, 247, 0.54);
  font: 800 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 9ch;
  font-family: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  font-size: clamp(58px, 8vw, 108px);
  line-height: 0.92;
  letter-spacing: -0.08em;
  color: transparent;
  background: linear-gradient(115deg, #ffffff 0%, #e1fff2 56%, #9ff4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

h2 {
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

h3 {
  font-size: 22px;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.summary,
.proof-card p,
.flow-card p,
.provider-card p {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.8;
}

.hero-meta,
.hero-actions,
.proof-grid,
.flow-grid {
  display: grid;
  gap: 14px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-pill,
.code-block,
.demo-panel,
.provider-card,
.proof-card,
.flow-card {
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(16px);
}

.hero-pill {
  display: inline-grid;
  gap: 8px;
  min-width: 170px;
  padding: 14px 16px;
  border-radius: 18px;
}

.hero-pill strong,
.hero-pill code,
.provider-card strong {
  color: var(--text);
  font: 800 15px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.code-block {
  display: grid;
  gap: 12px;
  max-width: 720px;
  padding: 18px;
  border-radius: 24px;
}

.code-block pre {
  margin: 0;
  overflow: auto;
  padding: 18px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.22);
  color: var(--text);
  font: 800 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hero-actions {
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
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.primary-action {
  color: #09110f;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.secondary-action,
.ghost-action,
.inline-link {
  color: var(--text);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
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

.demo-panel {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 88px;
  padding: 22px;
  border-radius: 28px;
}

.demo-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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
  border: 1px solid rgba(157, 247, 208, 0.15);
  font: 800 13px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provider-tabs button {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 14px;
  color: rgba(244, 251, 247, 0.72);
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
}

.provider-tabs button.active,
.prompt-row button {
  color: #09110f;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.provider-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
}

.prompt-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.prompt-row input {
  min-width: 0;
  height: 48px;
  padding: 0 14px;
  border-radius: 14px;
  color: var(--text);
  background: rgba(0, 0, 0, 0.2);
  outline: none;
}

.prompt-row button {
  height: 48px;
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
  color: rgba(244, 251, 247, 0.72);
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
}

.runtime-root {
  min-height: 220px;
}

:deep(.runtime-shell) {
  display: grid;
  gap: 12px;
  min-height: 220px;
  padding: 18px;
  border: 1px solid rgba(157, 247, 208, 0.12);
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.26);
}

:deep(.runtime-provider),
:deep(.runtime-prompt),
:deep(.runtime-meta) {
  color: rgba(244, 251, 247, 0.66);
  font: 800 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.runtime-provider) {
  color: var(--accent);
}

:deep(.runtime-output) {
  min-height: 112px;
  margin: 0;
  white-space: pre-wrap;
  color: var(--text);
  font: 700 clamp(20px, 2vw, 28px)/1.18 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: -0.03em;
}

.proof-section,
.flow-section {
  display: grid;
  gap: 18px;
  margin-top: 46px;
}

.section-head {
  display: grid;
  gap: 8px;
  max-width: 560px;
  padding-top: 6px;
  border-top: 1px solid rgba(173, 255, 225, 0.12);
}

.proof-grid,
.flow-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.proof-card,
.flow-card {
  display: grid;
  gap: 12px;
  min-height: 156px;
  padding: 22px;
  border-radius: 22px;
}

.flow-card span {
  color: var(--accent);
}

@media (max-width: 1100px) {
  .hero-shell,
  .proof-grid,
  .flow-grid {
    grid-template-columns: 1fr;
  }

  .demo-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .home-page {
    margin-top: -56px;
    padding: 106px 18px 72px;
  }

  .provider-tabs,
  .prompt-row {
    grid-template-columns: 1fr;
  }

  .demo-panel-head {
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
    font-size: clamp(50px, 18vw, 72px);
  }
}
</style>
