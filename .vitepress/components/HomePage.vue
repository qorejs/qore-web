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
    headline: 'Reactive streams. Native UI.',
    summary: 'Qore is a reactive stream runtime for AI-native interfaces. It turns tokens, tool calls, and status events into readonly signals your UI can bind to directly.',
    primaryAction: 'See it run',
    secondaryAction: 'Quick start',
    tertiaryAction: 'GitHub',
    codeLabel: 'The runtime path',
    codeSample: `const events = stream.events(agent.run(task))\nconst text = events.select('text', {\n  seed: '',\n  reduce: (value, event) => value + event.text\n})`,
    comparisonTitle: 'Why it is different',
    reactPath: 'React / Vercel AI SDK: Token -> Hook state -> Component render -> Reconcile',
    qorePath: 'Qore: Event -> Stream signal -> UI region',
    meta: [
      ['Positioning', 'Reactive Stream Runtime'],
      ['Primitive', 'stream = signal'],
      ['Install', 'npm i @qorejs/qore'],
    ],
    demoEyebrow: 'Agent Event Stream',
    demoTitle: 'Stream one agent run without rewriting the transcript.',
    providerLabel: 'Provider',
    demoPromptLabel: 'Prompt',
    demoButton: 'Stream',
    promptPrefix: 'prompt',
    statusPrefix: 'status',
    chunksPrefix: 'chunks',
    waiting: 'waiting for the first token...',
    guideAction: 'Provider guide',
    safetyNote: 'Provider keys belong in your server or trusted runtime. Browsers should consume your own SSE or NDJSON endpoint.',
    presetLabel: 'Presets',
    presets: [
      'Explain stream = signal',
      'Show an agent event stream',
      'Why avoid transcript rewrites?'
    ],
    whyTitle: 'Why it feels different',
    whyCards: [
      ['Streams are first-class', 'Streaming data is not a special case. It is the runtime input.'],
      ['Signals are readonly', 'The UI can observe stream state without mutating the stream runtime.'],
      ['Transcript stays stable', 'Qore avoids snapshot-style transcript rewrites while chunks arrive.']
    ],
    flowTitle: 'How it works',
    flowSteps: [
      ['1', 'Provider', 'Your server streams model, tool, or custom SSE events.'],
      ['2', 'Runtime', 'Qore reduces events into one signal plus lifecycle state.'],
      ['3', 'Binding', 'Only the bound DOM text or region updates as chunks arrive.']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'Server-side OpenAI stream, one browser-side QoreStream signal.',
        tokens: [
          'status: routing request\\n',
          'tool.search: reading provider notes\\n',
          'token: stream = signal\\n',
          'done: text node updated without transcript rewrite'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: 'Swap Anthropic into the same reactive stream runtime.',
        tokens: [
          'status: connecting to Claude\\n',
          'tool.plan: composing answer shape\\n',
          'token: provider changed, UI model did not\\n',
          'done: QoreStream completed'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: 'Wrap any SSE endpoint once and keep the UI primitive unchanged.',
        tokens: [
          'status: consuming custom SSE\\n',
          'tool.call: vendor event normalized\\n',
          'token: your endpoint becomes a signal\\n',
          'done: same binding, different source'
        ]
      }
    ] satisfies readonly ProviderCopy[]
  },
  zh: {
    headline: '响应式流。原生 UI。',
    summary: 'Qore 是面向 AI-native interface 的 reactive stream runtime。它把 token、tool call、状态事件变成只读 signal，让 UI 直接绑定。',
    primaryAction: '直接看效果',
    secondaryAction: '快速开始',
    tertiaryAction: 'GitHub',
    codeLabel: '运行路径',
    codeSample: `const events = stream.events(agent.run(task))\nconst text = events.select('text', {\n  seed: '',\n  reduce: (value, event) => value + event.text\n})`,
    comparisonTitle: '差异在哪里',
    reactPath: 'React / Vercel AI SDK: Token -> Hook state -> Component render -> Reconcile',
    qorePath: 'Qore: Event -> Stream signal -> UI region',
    meta: [
      ['定位', 'Reactive Stream Runtime'],
      ['原语', 'stream = signal'],
      ['安装', 'npm i @qorejs/qore'],
    ],
    demoEyebrow: 'Agent Event Stream',
    demoTitle: '流式跑一次 agent，不重写整段 transcript。',
    providerLabel: 'Provider',
    demoPromptLabel: '提示词',
    demoButton: 'Stream',
    promptPrefix: '提示词',
    statusPrefix: '状态',
    chunksPrefix: 'chunks',
    waiting: '等待第一个 token...',
    guideAction: 'Provider 指南',
    safetyNote: 'Provider key 应放在服务端或可信运行时。浏览器应消费你自己的 SSE 或 NDJSON endpoint。',
    presetLabel: '预设',
    presets: [
      '解释 stream = signal',
      '展示 agent event stream',
      '为什么避免 transcript rewrite？'
    ],
    whyTitle: '为什么它不一样',
    whyCards: [
      ['Stream 是一等公民', '流式数据不是特殊情况，而是运行时的输入。'],
      ['Signal 只读暴露', 'UI 可以观察 stream state，但不能破坏运行时状态机。'],
      ['Transcript 保持稳定', 'chunk 抵达时，Qore 避免 snapshot-style transcript rewrite。']
    ],
    flowTitle: '它如何工作',
    flowSteps: [
      ['1', 'Provider', '服务端流式输出模型、tool 或自定义 SSE 事件。'],
      ['2', 'Runtime', 'Qore 把事件 reduce 成一个 signal 和生命周期状态。'],
      ['3', 'Binding', 'chunk 到达时，只有绑定的 DOM 文本或区域更新。']
    ],
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'OpenAI 留在服务端，浏览器拿到一条 QoreStream signal。',
        tokens: [
          'status: routing request\\n',
          'tool.search: reading provider notes\\n',
          'token: stream = signal\\n',
          'done: text node updated without transcript rewrite'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: '切到 Anthropic，也不改变 UI 更新模型。',
        tokens: [
          'status: connecting to Claude\\n',
          'tool.plan: composing answer shape\\n',
          'token: provider changed, UI model did not\\n',
          'done: QoreStream completed'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: '把任意 SSE endpoint 包装一次，UI 原语保持不变。',
        tokens: [
          'status: consuming custom SSE\\n',
          'tool.call: vendor event normalized\\n',
          'token: your endpoint becomes a signal\\n',
          'done: same binding, different source'
        ]
      }
    ] satisfies readonly ProviderCopy[]
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
    h('div', { class: 'runtime-topline' },
      h('div', { class: 'runtime-provider' }, activeProvider.value.name),
      h('div', { class: 'runtime-meta runtime-meta-inline' }, text(() => `${t.value.statusPrefix}: ${answer.status()}`))
    ),
    h('div', { class: 'runtime-thread' },
      h('article', { class: 'runtime-bubble runtime-bubble-user' },
        h('span', { class: 'runtime-bubble-label' }, 'You'),
        h('p', { class: 'runtime-prompt' }, `${t.value.promptPrefix}: ${value}`)
      ),
      h('article', { class: 'runtime-bubble runtime-bubble-assistant' },
        h('span', { class: 'runtime-bubble-label' }, activeProvider.value.name),
        h('pre', { class: 'runtime-output' }, text(() => answer() || t.value.waiting))
      )
    ),
    h('div', { class: 'runtime-footer' },
      h('div', { class: 'runtime-meta' }, text(() => `${t.value.chunksPrefix}: ${answer.chunkCount()}`)),
      h('div', { class: 'runtime-meta' }, 'QoreStream')
    )
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
    <section class="hero-grid">
      <div class="hero-copy">
        <h1>{{ t.headline }}</h1>
        <p class="summary">{{ t.summary }}</p>

        <div class="hero-meta">
          <div v-for="item in t.meta" :key="item[0]" class="hero-pill">
            <span>{{ item[0] }}</span>
            <strong>{{ item[1] }}</strong>
          </div>
        </div>

        <div class="code-block">
          <span>{{ t.codeLabel }}</span>
          <pre><code>{{ t.codeSample }}</code></pre>
        </div>

        <div class="path-card" aria-label="Runtime comparison">
          <span>{{ t.comparisonTitle }}</span>
          <p class="path-line path-line-muted">{{ t.reactPath }}</p>
          <p class="path-line path-line-strong">{{ t.qorePath }}</p>
        </div>

        <div class="hero-actions">
          <a class="primary-action" href="#live-demo">{{ t.primaryAction }}</a>
          <a class="secondary-action" :href="quickStartLink">{{ t.secondaryAction }}</a>
          <a class="ghost-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">{{ t.tertiaryAction }}</a>
        </div>
      </div>

      <section id="live-demo" class="demo-panel">
        <div class="demo-topbar">
          <p>{{ t.demoEyebrow }}</p>
          <a class="inline-link" :href="providerGuideLink">{{ t.guideAction }}</a>
        </div>

        <div class="demo-header">
          <h2>{{ t.demoTitle }}</h2>
          <p class="demo-note">{{ activeProvider.description }}</p>
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
          <span>Environment</span>
          <strong>{{ activeProvider.env }}</strong>
          <p>{{ activeProvider.description }}</p>
          <p class="safety-note">{{ t.safetyNote }}</p>
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

    <section class="story-grid">
      <section class="story-panel">
        <div class="section-head">
          <h2>{{ t.whyTitle }}</h2>
        </div>
        <div class="proof-grid">
          <article v-for="card in t.whyCards" :key="card[0]" class="proof-card">
            <h3>{{ card[0] }}</h3>
            <p>{{ card[1] }}</p>
          </article>
        </div>
      </section>

      <section class="story-panel flow-panel">
        <div class="section-head">
          <h2>{{ t.flowTitle }}</h2>
        </div>
        <div class="flow-grid">
          <article v-for="step in t.flowSteps" :key="step[0]" class="flow-card">
            <span>{{ step[0] }}</span>
            <h3>{{ step[1] }}</h3>
            <p>{{ step[2] }}</p>
          </article>
        </div>
      </section>
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
  background: rgba(9, 17, 15, 0.86) !important;
  backdrop-filter: blur(16px);
}

:global(body:has(.VPContent.is-home) .VPNavBar .divider-line) {
  background: rgba(173, 255, 225, 0.08) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarTitle span),
:global(body:has(.VPContent.is-home) .VPNavBarMenuLink),
:global(body:has(.VPContent.is-home) .VPSocialLink),
:global(body:has(.VPContent.is-home) .VPNavBarExtra .button) {
  color: rgba(246, 252, 248, 0.78) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarMenuLink.active) {
  color: #8ef7d1 !important;
}

:global(body:has(.VPContent.is-home) .DocSearch-Button) {
  color: rgba(246, 252, 248, 0.66);
  background: rgba(255, 255, 255, 0.025);
  border-color: rgba(173, 255, 225, 0.09);
  box-shadow: none;
}

:global(body:has(.VPContent.is-home) .DocSearch-Button-Placeholder),
:global(body:has(.VPContent.is-home) .DocSearch-Search-Icon),
:global(body:has(.VPContent.is-home) .DocSearch-Button-Key) {
  color: rgba(246, 252, 248, 0.72) !important;
}

.home-page {
  --text: #f4fbf7;
  --muted: rgba(244, 251, 247, 0.72);
  --line: rgba(143, 247, 209, 0.12);
  --panel: rgba(255, 255, 255, 0.045);
  --panel-strong: rgba(255, 255, 255, 0.06);
  --accent: #8ef7d1;
  --accent-strong: #6be7ff;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: -64px;
  padding: 112px clamp(18px, 4vw, 72px) 96px;
  color: var(--text);
  background:
    radial-gradient(circle at 0% 0%, rgba(107, 231, 255, 0.1), transparent 25%),
    radial-gradient(circle at 100% 0%, rgba(142, 247, 209, 0.12), transparent 26%),
    linear-gradient(180deg, #09110f 0%, #0c1512 45%, #09110f 100%);
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
    linear-gradient(rgba(143, 247, 209, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 247, 209, 0.025) 1px, transparent 1px);
  background-size: 78px 78px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.home-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-grid,
.story-grid {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(390px, 470px);
  gap: clamp(28px, 4vw, 60px);
  align-items: start;
}

.hero-copy {
  display: grid;
  gap: 24px;
  max-width: 760px;
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
  font-size: clamp(62px, 8.6vw, 118px);
  line-height: 0.9;
  letter-spacing: -0.09em;
  color: transparent;
  background: linear-gradient(118deg, #ffffff 0%, #ebfff4 50%, #9af2ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.summary,
.proof-card p,
.flow-card p,
.provider-card p {
  color: var(--muted);
  font-size: 18px;
  line-height: 1.75;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-pill,
.code-block,
.path-card,
.demo-panel,
.provider-card,
.proof-card,
.flow-card,
.story-panel {
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(16px);
}

.hero-pill {
  display: inline-grid;
  gap: 8px;
  min-width: 170px;
  padding: 14px 16px;
  border-radius: 18px;
}

.hero-pill span,
.code-block span,
.path-card span,
.demo-topbar p,
.provider-card span,
.flow-card span {
  color: rgba(244, 251, 247, 0.54);
  font: 800 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-pill strong,
.provider-card strong,
.hero-pill code {
  color: var(--text);
  font: 800 15px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.code-block {
  display: grid;
  gap: 12px;
  max-width: 740px;
  padding: 18px;
  border-radius: 24px;
}

.code-block pre {
  margin: 0;
  overflow: auto;
  padding: 18px;
  border: 1px solid rgba(143, 247, 209, 0.1);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.2);
  color: var(--text);
  font: 800 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.path-card {
  display: grid;
  gap: 10px;
  max-width: 740px;
  padding: 16px 18px;
  border-radius: 22px;
}

.path-line {
  color: rgba(244, 251, 247, 0.68);
  font: 800 13px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.path-line-strong {
  color: var(--accent);
}

.path-line-muted {
  color: rgba(244, 251, 247, 0.48);
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
  padding: 20px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.04));
}

.demo-topbar,
.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.demo-topbar {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(143, 247, 209, 0.1);
}

.demo-header {
  display: grid;
  gap: 10px;
}

.demo-header h2 {
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.04;
  letter-spacing: -0.05em;
}

.demo-note {
  max-width: 40ch;
  color: rgba(244, 251, 247, 0.62);
  font-size: 15px;
  line-height: 1.7;
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
  border: 1px solid rgba(143, 247, 209, 0.15);
  font: 800 13px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provider-tabs button {
  min-height: 42px;
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
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
}

.provider-card .safety-note {
  padding-top: 10px;
  border-top: 1px solid rgba(143, 247, 209, 0.08);
  color: rgba(244, 251, 247, 0.58);
  font-size: 13px;
  line-height: 1.6;
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
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  color: rgba(244, 251, 247, 0.72);
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
}

.runtime-root {
  min-height: 300px;
}

:deep(.runtime-shell) {
  display: grid;
  gap: 14px;
  min-height: 300px;
  padding: 18px;
  border: 1px solid rgba(143, 247, 209, 0.1);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(8, 13, 20, 0.9), rgba(8, 13, 20, 0.78));
}

:deep(.runtime-topline),
:deep(.runtime-footer) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.runtime-thread) {
  display: grid;
  gap: 12px;
}

:deep(.runtime-bubble) {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
}

:deep(.runtime-bubble-user) {
  border: 1px solid rgba(143, 247, 209, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

:deep(.runtime-bubble-assistant) {
  border: 1px solid rgba(107, 231, 255, 0.08);
  background: rgba(11, 14, 22, 0.92);
}

:deep(.runtime-provider),
:deep(.runtime-prompt),
:deep(.runtime-meta),
:deep(.runtime-bubble-label) {
  color: rgba(244, 251, 247, 0.68);
  font: 800 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.runtime-provider),
:deep(.runtime-bubble-label) {
  color: var(--accent);
}

:deep(.runtime-meta-inline) {
  color: rgba(244, 251, 247, 0.5);
}

:deep(.runtime-output) {
  min-height: 128px;
  margin: 0;
  white-space: pre-wrap;
  color: var(--text);
  font: 700 clamp(21px, 2vw, 30px)/1.08 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: -0.03em;
}

.story-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
  gap: 22px;
  margin-top: 42px;
}

.story-panel {
  display: grid;
  gap: 20px;
  padding: 20px;
  border-radius: 28px;
}

.section-head h2 {
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.04;
  letter-spacing: -0.05em;
}

.proof-grid,
.flow-grid {
  display: grid;
  gap: 16px;
}

.proof-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.proof-card,
.flow-card {
  display: grid;
  gap: 12px;
  min-height: 170px;
  padding: 22px;
  border-radius: 22px;
  background: var(--panel-strong);
}

.flow-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.flow-card h3,
.proof-card h3 {
  font-size: 18px;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.flow-card span {
  color: var(--accent);
}

@media (max-width: 1180px) {
  .hero-grid,
  .story-grid,
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
  .prompt-row,
  .proof-grid,
  .flow-grid {
    grid-template-columns: 1fr;
  }

  .demo-topbar,
  .demo-header {
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
    font-size: clamp(50px, 18vw, 76px);
  }

  .hero-meta {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
