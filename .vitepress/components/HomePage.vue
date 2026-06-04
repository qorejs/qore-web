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
    headlineTop: 'Reactive Stream Runtime',
    headlineBottom: 'for AI-native interfaces',
    tagline: 'stream = signal',
    summary: 'Qore makes streams first-class state: tokens, tools, status, and errors flow into UI without transcript rewrites.',
    categoryLine: 'Not an AI SDK. Not another UI framework. A runtime layer for streaming interface state.',
    primaryAction: 'See the surfaces',
    secondaryAction: 'Quick start',
    tertiaryAction: 'GitHub',
    whyTitle: 'Why Qore exists',
    whyLead: 'AI interfaces are not snapshots. They are live streams of tokens, tools, status, retries, and artifacts.',
    whyCode: `const answer = stream(openai.chat('hello'))

return h('p', {}, text(() => answer()))`,
    whyPoints: [
      ['No transcript rewrites', 'The bound text node updates as chunks arrive.'],
      ['No state glue', 'The stream already is the signal your UI reads.'],
      ['No framework lock-in', 'Use the runtime from Qore DOM today, or from framework adapters tomorrow.']
    ],
    surfacesTitle: 'One Stream Three Surfaces',
    surfacesLead: 'A QoreStream is deliberately more than a string. It exposes the three surfaces an AI interface actually needs.',
    surfacesTakeaway: 'One primitive. Three ways to consume it. No adapter changes in your UI.',
    streamPath: ['provider event', 'QoreStream', 'readonly signal', 'text node'],
    demoPipeline: ['token', 'QoreStream', 'signal', 'text node'],
    surfaces: [
      ['Signal', 'Bind current accumulated value directly into UI.', `answer()`],
      ['AsyncIterable', 'Observe every token, tool call, or event in control flow.', `for await (const event of events) {}`],
      ['Lifecycle', 'Read status, errors, chunks, timing, and cancellation state.', `answer.status()\nanswer.error()\nanswer.chunkCount()`]
    ],
    demoEyebrow: 'Live primitive',
    demoTitle: 'One stream driving one text node.',
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
    comparisonTitle: 'React vs Qore',
    comparisonLead: 'React treats streaming as state synchronization. Qore treats streaming as the state source.',
    comparisonTakeaway: 'Token -> signal -> DOM is the shorter path.',
    reactTitle: 'React / AI SDK path',
    qoreTitle: 'Qore path',
    reactSteps: ['token', 'hook state', 'component render', 'reconcile', 'DOM'],
    qoreSteps: ['token', 'stream signal', 'DOM'],
    architectureTitle: 'Architecture',
    architectureLead: 'Providers are inputs. The runtime is the product.',
    architectureTakeaway: 'Providers can change. Runtime semantics stay stable.',
    architectureSteps: [
      ['Provider', 'OpenAI, Anthropic, Ollama, custom SSE, or NDJSON.'],
      ['Stream Runtime', 'Backpressure, lifecycle, retry, event selection, and reducers.'],
      ['Signal', 'Readonly state with fine-grained dependency tracking.'],
      ['UI', 'DOM binding, framework adapters, or your own renderer.']
    ],
    benchmarkTitle: 'Benchmark',
    benchmarkLead: 'The honest comparison is not Qore versus React as brands. It is update model versus update model.',
    benchmarkTakeaway: 'Measure rewritten work, not brand names.',
    benchmarkLines: ['Fine-grained stream updates', 'vs', 'snapshot transcript rewrites'],
    benchmarkDetails: [
      ['Mutation target', 'Text node / selected region'],
      ['Transcript strategy', 'Append-only stream state'],
      ['Measured signals', 'mutations, added nodes, rewritten bytes']
    ],
    providersTitle: 'Providers',
    providersLead: 'Adapters are entry points into the runtime, not the headline. Bring any streaming source and keep the same UI primitive.',
    providersTakeaway: 'The provider story can grow without changing the interface primitive.',
    providerNames: ['OpenAI', 'Anthropic', 'OpenRouter', 'DeepSeek', 'Ollama', 'Generic SSE', 'NDJSON'],
    finalTitle: 'Make streams first-class state for AI-native interfaces.',
    finalLead: 'Reactive Stream Runtime for AI-native interfaces. stream = signal.',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'Server-side OpenAI stream, one browser-side QoreStream signal.',
        tokens: [
          'status: routing request\n',
          'tool.search: reading provider notes\n',
          'token: stream = signal\n',
          'done: text node updated without transcript rewrite'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: 'Swap Anthropic into the same reactive stream runtime.',
        tokens: [
          'status: connecting to Claude\n',
          'tool.plan: composing answer shape\n',
          'token: provider changed, UI model did not\n',
          'done: QoreStream completed'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: 'Wrap any SSE endpoint once and keep the UI primitive unchanged.',
        tokens: [
          'status: consuming custom SSE\n',
          'tool.call: vendor event normalized\n',
          'token: your endpoint becomes a signal\n',
          'done: same binding, different source'
        ]
      }
    ] satisfies readonly ProviderCopy[]
  },
  zh: {
    headlineTop: 'Reactive Stream Runtime',
    headlineBottom: 'for AI-native interfaces',
    tagline: 'stream = signal',
    summary: 'Qore 让 stream 成为一等状态：token、tool、status、error 自然流入 UI，不再重写 transcript。',
    categoryLine: '不是 AI SDK，也不是又一个 UI framework，而是 streaming interface state 的 runtime layer。',
    primaryAction: '看三种表面',
    secondaryAction: '快速开始',
    tertiaryAction: 'GitHub',
    whyTitle: 'Qore 为什么存在',
    whyLead: 'AI interface 不是快照，而是 token、tool、status、retry、artifact 持续抵达的 live stream。',
    whyCode: `const answer = stream(openai.chat('hello'))

return h('p', {}, text(() => answer()))`,
    whyPoints: [
      ['不重写 transcript', 'chunk 到达时，只更新绑定的 text node。'],
      ['不搬运状态', 'stream 本身就是 UI 读取的 signal。'],
      ['不锁定 framework', '今天用 Qore DOM，明天也可以接 framework adapter。']
    ],
    surfacesTitle: 'One Stream Three Surfaces',
    surfacesLead: 'QoreStream 不只是字符串。它暴露 AI interface 真正需要的三种表面。',
    surfacesTakeaway: '一个 primitive，三种消费方式，UI 不需要随着 adapter 改。',
    streamPath: ['provider event', 'QoreStream', 'readonly signal', 'text node'],
    demoPipeline: ['token', 'QoreStream', 'signal', 'text node'],
    surfaces: [
      ['Signal', '把当前累积值直接绑定到 UI。', `answer()`],
      ['AsyncIterable', '在控制流里观察每个 token、tool call 或事件。', `for await (const event of events) {}`],
      ['Lifecycle', '读取 status、error、chunks、timing 和取消状态。', `answer.status()\nanswer.error()\nanswer.chunkCount()`]
    ],
    demoEyebrow: 'Live primitive',
    demoTitle: '一条 stream 驱动一个 text node。',
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
    comparisonTitle: 'React vs Qore',
    comparisonLead: 'React 把 streaming 变成状态同步问题。Qore 把 streaming 作为状态源。',
    comparisonTakeaway: 'Token -> signal -> DOM 是更短的路径。',
    reactTitle: 'React / AI SDK path',
    qoreTitle: 'Qore path',
    reactSteps: ['token', 'hook state', 'component render', 'reconcile', 'DOM'],
    qoreSteps: ['token', 'stream signal', 'DOM'],
    architectureTitle: 'Architecture',
    architectureLead: 'Provider 是入口。Runtime 才是产品。',
    architectureTakeaway: 'Provider 可以换，runtime 语义保持稳定。',
    architectureSteps: [
      ['Provider', 'OpenAI、Anthropic、Ollama、自定义 SSE 或 NDJSON。'],
      ['Stream Runtime', 'Backpressure、lifecycle、retry、event selection 和 reducer。'],
      ['Signal', '带细粒度依赖追踪的只读状态。'],
      ['UI', 'DOM binding、framework adapter 或你自己的 renderer。']
    ],
    benchmarkTitle: 'Benchmark',
    benchmarkLead: '诚实的比较不是 Qore 和 React 两个品牌，而是两种更新模型。',
    benchmarkTakeaway: '衡量被重写的工作量，而不是比较品牌名。',
    benchmarkLines: ['Fine-grained stream updates', 'vs', 'snapshot transcript rewrites'],
    benchmarkDetails: [
      ['Mutation target', 'Text node / selected region'],
      ['Transcript strategy', 'Append-only stream state'],
      ['Measured signals', 'mutations, added nodes, rewritten bytes']
    ],
    providersTitle: 'Providers',
    providersLead: 'Adapter 是 runtime 的入口，不是首页主角。带来任意 streaming source，UI primitive 保持一致。',
    providersTakeaway: 'Provider story 可以继续扩展，但 interface primitive 不变。',
    providerNames: ['OpenAI', 'Anthropic', 'OpenRouter', 'DeepSeek', 'Ollama', 'Generic SSE', 'NDJSON'],
    finalTitle: 'Make streams first-class state for AI-native interfaces.',
    finalLead: 'Reactive Stream Runtime for AI-native interfaces. stream = signal.',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'OpenAI 留在服务端，浏览器拿到一条 QoreStream signal。',
        tokens: [
          'status: routing request\n',
          'tool.search: reading provider notes\n',
          'token: stream = signal\n',
          'done: text node updated without transcript rewrite'
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: '切到 Anthropic，也不改变 UI 更新模型。',
        tokens: [
          'status: connecting to Claude\n',
          'tool.plan: composing answer shape\n',
          'token: provider changed, UI model did not\n',
          'done: QoreStream completed'
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: '把任意 SSE endpoint 包装一次，UI 原语保持不变。',
        tokens: [
          'status: consuming custom SSE\n',
          'tool.call: vendor event normalized\n',
          'token: your endpoint becomes a signal\n',
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
    ),
    h('div', { class: 'runtime-lens' },
      ...t.value.demoPipeline.map((step, index) => h('span', { class: index === 1 ? 'active' : '' }, step))
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
    <section id="why" class="home-section hero-section">
      <div class="hero-copy">
        <h1>
          <span>{{ t.headlineTop }}</span>
          <span>{{ t.headlineBottom }}</span>
        </h1>
        <p class="tagline"><code>{{ t.tagline }}</code></p>
        <p class="summary">{{ t.summary }}</p>
        <p class="category-line">{{ t.categoryLine }}</p>

        <div class="hero-actions">
          <a class="primary-action" href="#surfaces">{{ t.primaryAction }}</a>
          <a class="secondary-action" :href="quickStartLink">{{ t.secondaryAction }}</a>
          <a class="ghost-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">{{ t.tertiaryAction }}</a>
        </div>
      </div>

      <aside class="why-card" aria-labelledby="why-title">
        <h2 id="why-title">{{ t.whyTitle }}</h2>
        <p>{{ t.whyLead }}</p>
        <pre><code>{{ t.whyCode }}</code></pre>
        <div class="why-points">
          <article v-for="point in t.whyPoints" :key="point[0]">
            <h3>{{ point[0] }}</h3>
            <p>{{ point[1] }}</p>
          </article>
        </div>
      </aside>
    </section>

    <section id="surfaces" class="home-section surfaces-section">
      <div class="section-copy">
        <p class="section-index">01</p>
        <h2>{{ t.surfacesTitle }}</h2>
        <p>{{ t.surfacesLead }}</p>
      </div>

      <div class="stream-strip" aria-label="Qore stream path">
        <span v-for="step in t.streamPath" :key="step">{{ step }}</span>
      </div>

      <div class="surfaces-layout">
        <div class="surface-grid">
          <article v-for="surface in t.surfaces" :key="surface[0]" class="surface-card">
            <h3>{{ surface[0] }}</h3>
            <p>{{ surface[1] }}</p>
            <pre><code>{{ surface[2] }}</code></pre>
          </article>
        </div>

        <section id="live-demo" class="demo-panel" aria-label="Qore live stream demo">
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
      </div>

      <p class="takeaway">{{ t.surfacesTakeaway }}</p>
    </section>

    <section id="comparison" class="home-section comparison-section">
      <div class="section-copy compact">
        <p class="section-index">02</p>
        <h2>{{ t.comparisonTitle }}</h2>
        <p>{{ t.comparisonLead }}</p>
      </div>

      <div class="comparison-grid">
        <article class="path-panel muted-path">
          <h3>{{ t.reactTitle }}</h3>
          <ol>
            <li v-for="step in t.reactSteps" :key="step">{{ step }}</li>
          </ol>
        </article>
        <article class="path-panel strong-path">
          <h3>{{ t.qoreTitle }}</h3>
          <ol>
            <li v-for="step in t.qoreSteps" :key="step">{{ step }}</li>
          </ol>
        </article>
      </div>

      <p class="takeaway">{{ t.comparisonTakeaway }}</p>
    </section>

    <section id="architecture" class="home-section architecture-section">
      <div class="section-copy compact">
        <p class="section-index">03</p>
        <h2>{{ t.architectureTitle }}</h2>
        <p>{{ t.architectureLead }}</p>
      </div>

      <div class="architecture-rail" aria-label="Qore architecture">
        <article v-for="step in t.architectureSteps" :key="step[0]" class="architecture-node">
          <span>{{ step[0] }}</span>
          <p>{{ step[1] }}</p>
        </article>
      </div>

      <p class="takeaway">{{ t.architectureTakeaway }}</p>
    </section>

    <section id="benchmark" class="home-section benchmark-section">
      <div class="section-copy compact">
        <p class="section-index">04</p>
        <h2>{{ t.benchmarkTitle }}</h2>
        <p>{{ t.benchmarkLead }}</p>
      </div>

      <div class="benchmark-board">
        <div class="benchmark-statement">
          <span v-for="line in t.benchmarkLines" :key="line">{{ line }}</span>
        </div>
        <div class="benchmark-grid">
          <article v-for="detail in t.benchmarkDetails" :key="detail[0]">
            <span>{{ detail[0] }}</span>
            <strong>{{ detail[1] }}</strong>
          </article>
        </div>
      </div>

      <p class="takeaway">{{ t.benchmarkTakeaway }}</p>
    </section>

    <section id="providers" class="home-section providers-section">
      <div class="section-copy compact">
        <p class="section-index">05</p>
        <h2>{{ t.providersTitle }}</h2>
        <p>{{ t.providersLead }}</p>
      </div>

      <div class="providers-board">
        <div class="provider-cloud" aria-label="Supported provider adapters">
          <span v-for="name in t.providerNames" :key="name">{{ name }}</span>
        </div>
        <article class="provider-card">
          <span>Environment</span>
          <strong>{{ activeProvider.env }}</strong>
          <p>{{ activeProvider.description }}</p>
          <p class="safety-note">{{ t.safetyNote }}</p>
        </article>
      </div>

      <p class="takeaway">{{ t.providersTakeaway }}</p>
    </section>

    <section class="home-section final-section">
      <h2>{{ t.finalTitle }}</h2>
      <p>{{ t.finalLead }}</p>
    </section>
  </main>
</template>

<style scoped>
:global(.VPContent.is-home) {
  padding-top: 0;
  background: #06110f;
}

:global(html:has(.VPContent.is-home)) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  :global(html:has(.VPContent.is-home)) {
    scroll-behavior: auto;
  }
}

:global(.VPContent.is-home .VPHome),
:global(.VPFooter) {
  background: #06110f;
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
  background: rgba(5, 14, 12, 0.88) !important;
  backdrop-filter: blur(20px);
}

:global(body:has(.VPContent.is-home) .VPNavBar .divider-line) {
  background: rgba(98, 241, 221, 0.16) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarTitle span),
:global(body:has(.VPContent.is-home) .VPNavBarMenuLink),
:global(body:has(.VPContent.is-home) .VPSocialLink),
:global(body:has(.VPContent.is-home) .VPNavBarExtra .button) {
  color: rgba(247, 255, 252, 0.84) !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarMenuLink) {
  font-size: 13px;
  font-weight: 820;
  letter-spacing: 0.02em;
}

:global(body:has(.VPContent.is-home) .VPNavBarMenuLink.active) {
  color: #66f7df !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarSearch) {
  display: none !important;
}

:global(body:has(.VPContent.is-home) .VPNavBarTranslations),
:global(body:has(.VPContent.is-home) .VPNavBarAppearance),
:global(body:has(.VPContent.is-home) .VPNavBarSocialLinks),
:global(body:has(.VPContent.is-home) .VPNavBarExtra) {
  display: none !important;
}

.home-page {
  --text: #f8fffc;
  --muted: rgba(248, 255, 252, 0.74);
  --soft: rgba(248, 255, 252, 0.52);
  --line: rgba(102, 247, 223, 0.22);
  --panel: rgba(246, 255, 252, 0.062);
  --panel-strong: rgba(246, 255, 252, 0.092);
  --accent: #66f7df;
  --accent-strong: #31d9ff;
  --accent-glow: rgba(49, 217, 255, 0.26);
  --amber: #f5d38b;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: -64px;
  padding: 118px clamp(18px, 4vw, 72px) 98px;
  color: var(--text);
  background:
    radial-gradient(circle at 20% 0%, rgba(49, 217, 255, 0.22), transparent 30%),
    radial-gradient(circle at 83% 13%, rgba(102, 247, 223, 0.2), transparent 28%),
    linear-gradient(180deg, #06110f 0%, #09211c 42%, #06110f 100%);
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
    linear-gradient(rgba(102, 247, 223, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 247, 223, 0.045) 1px, transparent 1px);
  background-size: 86px 86px;
  mask-image: linear-gradient(to bottom, black 0%, transparent 70%);
}

.home-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.home-section {
  position: relative;
  z-index: 1;
  width: min(100%, 1280px);
  margin: 0 auto;
  scroll-margin-top: 112px;
}

.home-section + .home-section {
  margin-top: clamp(74px, 10vw, 132px);
}

.hero-section + .surfaces-section {
  margin-top: clamp(108px, 13vw, 178px);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.72fr);
  gap: clamp(30px, 5vw, 72px);
  align-items: center;
  min-height: min(940px, calc(100vh - 72px));
}

.hero-copy,
.why-card,
.section-copy,
.surface-card,
.demo-panel,
.path-panel,
.architecture-node,
.benchmark-board,
.provider-card,
.final-section {
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: 0 30px 110px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(18px);
}

.hero-copy {
  display: grid;
  gap: 24px;
  padding: clamp(8px, 2vw, 20px) 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2,
h3,
.primary-action,
.secondary-action,
.ghost-action,
.inline-link {
  font-family: 'Space Grotesk', 'Avenir Next', 'DIN Alternate', 'Trebuchet MS', sans-serif;
}

h1 {
  display: grid;
  gap: 8px;
  max-width: 980px;
  color: transparent;
  font-family: 'Avenir Next Condensed', 'HelveticaNeue-CondensedBlack', 'DIN Condensed', 'DIN Alternate', 'Space Grotesk', 'Trebuchet MS', sans-serif;
  font-size: clamp(60px, 6.9vw, 106px);
  font-stretch: condensed;
  font-weight: 900;
  line-height: 0.88;
  letter-spacing: -0.038em;
  background: linear-gradient(110deg, #ffffff 0%, #eafff8 42%, var(--accent-strong) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-wrap: balance;
}

.hero-copy h1 span {
  display: block;
  font: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
}

.tagline code,
pre,
.provider-tabs button,
.prompt-row input,
.prompt-row button,
.preset-row button,
.section-index,
.benchmark-statement,
.provider-cloud span {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.tagline code {
  display: inline-flex;
  width: fit-content;
  padding: 9px 14px;
  border: 1px solid rgba(154, 245, 215, 0.22);
  border-radius: 999px;
  color: #031311;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  font-weight: 900;
  letter-spacing: -0.02em;
  box-shadow: 0 0 36px rgba(49, 217, 255, 0.2);
}

.summary {
  max-width: 760px;
  color: rgba(248, 255, 252, 0.82);
  font-size: clamp(20px, 2.1vw, 28px);
  line-height: 1.42;
  letter-spacing: -0.035em;
}

.category-line {
  max-width: 710px;
  padding-left: 18px;
  border-left: 2px solid rgba(49, 217, 255, 0.72);
  color: rgba(208, 255, 247, 0.82);
  font-size: clamp(16px, 1.7vw, 20px);
  font-weight: 760;
  line-height: 1.55;
  letter-spacing: -0.03em;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 10px;
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
  color: var(--text);
  text-decoration: none;
  font-weight: 850;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.primary-action {
  color: #031311;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 0 34px rgba(49, 217, 255, 0.18);
}

.secondary-action,
.ghost-action,
.inline-link {
  border: 1px solid var(--line);
  background: rgba(246, 255, 252, 0.048);
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

.why-card {
  display: grid;
  gap: 20px;
  padding: clamp(22px, 3vw, 34px);
  border-radius: 32px;
  border-color: rgba(102, 247, 223, 0.28);
  background:
    radial-gradient(circle at 78% 0%, rgba(49, 217, 255, 0.2), transparent 34%),
    linear-gradient(180deg, rgba(246, 255, 252, 0.09), rgba(246, 255, 252, 0.046));
  box-shadow:
    0 34px 120px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.why-card h2,
.section-copy h2,
.final-section h2 {
  font-size: clamp(30px, 4vw, 58px);
  line-height: 0.98;
  letter-spacing: -0.062em;
}

.why-card p,
.section-copy p,
.surface-card p,
.path-panel li,
.architecture-node p,
.benchmark-grid strong,
.provider-card p,
.final-section p {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.72;
}

.why-card pre,
.surface-card pre {
  margin: 0;
  overflow: auto;
  padding: 18px;
  border: 1px solid rgba(102, 247, 223, 0.18);
  border-radius: 20px;
  color: var(--text);
  background:
    linear-gradient(90deg, rgba(49, 217, 255, 0.1), transparent 38%),
    rgba(0, 0, 0, 0.28);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.7;
  box-shadow: inset 3px 0 0 rgba(49, 217, 255, 0.52);
}

.why-points {
  display: grid;
  gap: 10px;
}

.why-points article {
  display: grid;
  gap: 5px;
  padding: 14px 16px;
  border: 1px solid rgba(102, 247, 223, 0.16);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.18);
}

.why-points h3,
.surface-card h3,
.path-panel h3 {
  font-size: 18px;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.why-points h3 {
  color: var(--accent);
  font-size: clamp(20px, 2vw, 24px);
}

.section-copy {
  display: grid;
  gap: 14px;
  max-width: 760px;
  margin-bottom: 26px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.section-copy.compact {
  max-width: 680px;
}

.section-index {
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.surfaces-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 0.78fr);
  gap: 24px;
  align-items: start;
}

.surface-grid {
  display: grid;
  gap: 16px;
}

.stream-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  margin: -6px 0 24px;
  padding: 10px;
  border: 1px solid rgba(102, 247, 223, 0.2);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(49, 217, 255, 0.09), transparent 46%),
    rgba(0, 0, 0, 0.2);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.24);
}

.stream-strip span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(248, 255, 252, 0.78);
  font: 850 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.02em;
}

.stream-strip span:not(:last-child)::after {
  content: '→';
  color: var(--accent-strong);
}

.surface-card {
  display: grid;
  gap: 12px;
  min-height: 190px;
  padding: 24px;
  border-radius: 28px;
  border-color: rgba(102, 247, 223, 0.2);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.surface-card:hover {
  transform: translateY(-3px);
  border-color: rgba(49, 217, 255, 0.34);
  background: rgba(246, 255, 252, 0.078);
}

.demo-panel {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 88px;
  padding: 20px;
  border-radius: 30px;
  border-color: rgba(102, 247, 223, 0.24);
  background:
    radial-gradient(circle at 92% 8%, rgba(49, 217, 255, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(246, 255, 252, 0.076), rgba(246, 255, 252, 0.044));
}

.takeaway {
  width: fit-content;
  max-width: min(100%, 780px);
  margin-top: 22px;
  padding: 13px 16px;
  border: 1px solid rgba(154, 245, 215, 0.18);
  border-radius: 999px;
  color: rgba(245, 251, 248, 0.82);
  background: linear-gradient(135deg, rgba(154, 245, 215, 0.12), rgba(107, 220, 255, 0.08));
  font-size: 15px;
  font-weight: 850;
  line-height: 1.35;
  letter-spacing: -0.025em;
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

.demo-topbar p,
.provider-card span,
.benchmark-grid span {
  color: rgba(244, 251, 247, 0.54);
  font: 850 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.demo-header {
  display: grid;
  gap: 10px;
}

.demo-header h2 {
  font-size: clamp(25px, 3vw, 38px);
  line-height: 1.04;
  letter-spacing: -0.052em;
}

.demo-note {
  max-width: 42ch;
  color: rgba(244, 251, 247, 0.64);
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
  border: 1px solid rgba(102, 247, 223, 0.2);
  font-weight: 850;
}

.provider-tabs button {
  min-height: 42px;
  padding: 0 10px;
  border-radius: 14px;
  color: rgba(244, 255, 251, 0.78);
  background: rgba(246, 255, 252, 0.032);
  cursor: pointer;
}

.provider-tabs button.active,
.prompt-row button {
  color: #031311;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
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
  background: rgba(0, 0, 0, 0.26);
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
  color: rgba(244, 255, 251, 0.72);
  background: rgba(246, 255, 252, 0.032);
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
  border: 1px solid rgba(102, 247, 223, 0.18);
  border-radius: 24px;
  background:
    radial-gradient(circle at 84% 0%, rgba(49, 217, 255, 0.14), transparent 36%),
    linear-gradient(180deg, rgba(4, 11, 14, 0.95), rgba(5, 13, 15, 0.86));
}

:deep(.runtime-topline),
:deep(.runtime-footer) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.runtime-lens) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

:deep(.runtime-lens span) {
  display: inline-flex;
  justify-content: center;
  min-width: 0;
  padding: 8px 6px;
  border: 1px solid rgba(102, 247, 223, 0.14);
  border-radius: 999px;
  color: rgba(248, 255, 252, 0.66);
  background: rgba(246, 255, 252, 0.035);
  font: 850 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: nowrap;
}

:deep(.runtime-lens span.active) {
  color: #031311;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
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
  border: 1px solid rgba(102, 247, 223, 0.14);
  background: rgba(246, 255, 252, 0.052);
}

:deep(.runtime-bubble-assistant) {
  border: 1px solid rgba(49, 217, 255, 0.18);
  background: rgba(5, 12, 16, 0.94);
}

:deep(.runtime-provider),
:deep(.runtime-prompt),
:deep(.runtime-meta),
:deep(.runtime-bubble-label) {
  color: rgba(244, 251, 247, 0.68);
  font: 850 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
  font: 850 clamp(15px, 1.35vw, 19px)/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: -0.012em;
}

.comparison-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.82fr);
  gap: 18px;
}

.path-panel {
  position: relative;
  overflow: hidden;
  padding: clamp(22px, 3vw, 34px);
  border-radius: 30px;
  border-color: rgba(102, 247, 223, 0.2);
}

.path-panel::after {
  content: '';
  position: absolute;
  inset: auto 24px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(49, 217, 255, 0.55), transparent);
}

.path-panel ol {
  display: grid;
  gap: 18px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.path-panel li {
  position: relative;
  padding: 0 0 0 38px;
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 850;
}

.path-panel li::before {
  content: '↓';
  position: absolute;
  left: 8px;
  top: -1px;
  color: var(--accent-strong);
}

.path-panel li:first-child::before {
  content: '';
}

.muted-path {
  opacity: 0.72;
}

.strong-path {
  border-color: rgba(102, 247, 223, 0.38);
  background:
    radial-gradient(circle at 82% 0%, rgba(49, 217, 255, 0.16), transparent 38%),
    linear-gradient(180deg, rgba(102, 247, 223, 0.12), rgba(246, 255, 252, 0.052));
}

.strong-path h3,
.strong-path li:last-child {
  color: var(--accent);
}

.architecture-rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.architecture-node {
  position: relative;
  min-height: 210px;
  padding: 24px;
  border-radius: 28px;
  border-color: rgba(102, 247, 223, 0.18);
}

.architecture-node:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -18px;
  top: 50%;
  z-index: 2;
  color: var(--accent);
  font-size: 28px;
  font-weight: 900;
  transform: translateY(-50%);
}

.architecture-node span {
  display: block;
  margin-bottom: 42px;
  color: var(--accent);
  font-size: clamp(22px, 2.6vw, 34px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
}

.benchmark-board {
  display: grid;
  gap: 24px;
  padding: clamp(22px, 4vw, 42px);
  border-radius: 34px;
  border-color: rgba(102, 247, 223, 0.22);
  background:
    radial-gradient(circle at 82% 10%, rgba(49, 217, 255, 0.16), transparent 34%),
    rgba(246, 255, 252, 0.062);
}

.benchmark-statement {
  display: grid;
  gap: 8px;
  color: var(--text);
  font-size: clamp(26px, 5vw, 72px);
  font-weight: 950;
  line-height: 0.98;
  letter-spacing: -0.075em;
}

.benchmark-statement span:nth-child(2) {
  color: var(--accent-strong);
  font-size: clamp(18px, 2.4vw, 28px);
  letter-spacing: -0.02em;
}

.benchmark-grid,
.providers-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.benchmark-grid article {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(102, 247, 223, 0.18);
  border-radius: 20px;
  background: rgba(246, 255, 252, 0.046);
}

.provider-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  grid-column: span 2;
  align-content: start;
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid var(--line);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(49, 217, 255, 0.075), transparent 44%),
    rgba(246, 255, 252, 0.052);
}

.provider-cloud span {
  padding: 10px 12px;
  border: 1px solid rgba(102, 247, 223, 0.24);
  border-radius: 999px;
  color: rgba(245, 251, 248, 0.82);
  background: rgba(0, 0, 0, 0.16);
  font-size: 13px;
  font-weight: 850;
}

.provider-card {
  display: grid;
  gap: 10px;
  padding: clamp(22px, 3vw, 28px);
  border-radius: 30px;
}

.provider-card strong {
  color: var(--accent);
  font: 900 18px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provider-card .safety-note {
  padding-top: 12px;
  border-top: 1px solid rgba(143, 247, 209, 0.09);
  color: rgba(244, 251, 247, 0.58);
  font-size: 13px;
  line-height: 1.6;
}

.final-section {
  display: grid;
  gap: 18px;
  padding: clamp(28px, 6vw, 64px);
  border-radius: 36px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(49, 217, 255, 0.22), transparent 42%),
    rgba(246, 255, 252, 0.062);
}

.final-section h2 {
  max-width: 850px;
  margin: 0 auto;
}

.final-section p {
  margin: 0 auto;
  color: rgba(245, 251, 248, 0.74);
  font-size: clamp(18px, 2vw, 24px);
  letter-spacing: -0.03em;
}

@media (max-width: 1180px) {
  .surfaces-layout,
  .comparison-grid,
  .architecture-rail,
  .providers-board {
    grid-template-columns: 1fr;
  }

  .demo-panel {
    position: static;
  }

  .architecture-node:not(:last-child)::after {
    content: '↓';
    right: 50%;
    top: auto;
    bottom: -28px;
    transform: translateX(50%);
  }

  .provider-cloud {
    grid-column: auto;
  }
}

@media (max-width: 1180px) and (min-width: 981px) {
  .hero-section {
    grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
    gap: 28px;
  }

  .surfaces-layout {
    grid-template-columns: minmax(0, 0.92fr) minmax(390px, 0.78fr);
    gap: 18px;
  }

  .hero-section h1 {
    font-size: clamp(60px, 6.7vw, 78px);
  }

  .summary {
    max-width: 620px;
    font-size: clamp(18px, 1.85vw, 22px);
  }

  .why-card {
    padding: 24px;
  }

  .why-card h2 {
    font-size: clamp(30px, 3.5vw, 42px);
  }

  .why-card p {
    font-size: 15px;
  }

  .why-card pre {
    padding: 16px;
    font-size: 12px;
  }

  .surface-card {
    min-height: 160px;
    padding: 20px;
  }

  .demo-panel {
    padding: 18px;
  }
}

@media (max-width: 980px) {
  .hero-section {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

@media (max-width: 900px) {
  .home-page {
    margin-top: -56px;
    padding: 108px 18px 72px;
  }

  .hero-section {
    min-height: auto;
  }

  .category-line {
    padding-left: 14px;
    font-size: 15px;
  }

  .provider-tabs,
  .prompt-row,
  .benchmark-grid,
  :deep(.runtime-lens) {
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
    font-size: clamp(42px, 13.5vw, 62px);
  }

  .home-page {
    padding-top: 92px;
  }

  .hero-copy {
    gap: 18px;
  }

  .summary {
    font-size: 18px;
    line-height: 1.45;
  }

  .hero-actions {
    display: grid;
  }

  .primary-action,
  .secondary-action,
  .ghost-action {
    width: 100%;
  }

  .why-card,
  .surface-card,
  .demo-panel,
  .path-panel,
  .benchmark-board,
  .provider-card,
  .final-section {
    border-radius: 24px;
  }

  .stream-strip {
    width: 100%;
    border-radius: 22px;
  }

  .stream-strip span {
    width: 100%;
    justify-content: space-between;
  }

  .stream-strip span:not(:last-child)::after {
    content: '↓';
  }

  .takeaway {
    width: 100%;
    border-radius: 22px;
  }
}
</style>
