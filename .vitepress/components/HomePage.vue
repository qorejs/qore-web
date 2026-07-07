<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { h, list, mount, stream, text } from '@qorejs/qore'

const { lang } = useData()
const qoreRoot = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const isZh = computed(() => lang.value.startsWith('zh'))

type ProviderId = 'openai' | 'anthropic' | 'sse'

type DemoEvent =
  | { type: 'status'; label: string }
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; input: string }
  | { type: 'tool_result'; name: string; output: string }
  | { type: 'diff'; patch: string }

type ProviderCopy = {
  id: ProviderId
  name: string
  env: string
  description: string
  events: readonly DemoEvent[]
}

const copy = {
  en: {
    headlineTop: 'Reactive Stream Runtime',
    headlineBottom: 'for AI-native interfaces',
    tagline: 'stream = signal',
    summary: 'Make streams first-class state for AI-native interfaces. No transcript rewrites, no state glue, no framework lock-in.',
    categoryLine: 'Provider events become readonly signals. UI surfaces subscribe to the stream instead of copying chunks into local state.',
    installLabel: 'Core package',
    installCommand: 'pnpm add @qorejs/qore',
    useCases: ['AI chat', 'agent workspaces', 'realtime logs', 'copilot UI'],
    primaryAction: 'Start in 5 minutes',
    secondaryAction: 'Try the demo',
    tertiaryAction: 'GitHub',
    whyTitle: 'Why Qore exists',
    whyLead: 'Every token changes the interface. Qore gives that change one runtime path.',
    whyCode: `const answer = stream(openai.chat('hello'))

return h('p', {}, text(() => answer()))`,
    whyPoints: [
      ['No transcript rewrites', 'The bound text node updates as chunks arrive.'],
      ['No state glue', 'The stream already is the signal your UI reads.'],
      ['No framework lock-in', 'Qore DOM is one surface. The React adapter is the bridge for existing apps.']
    ],
    surfacesTitle: 'One Stream Three Surfaces',
    surfacesLead: 'A QoreStream is deliberately more than a string. It exposes the three surfaces an AI interface actually needs.',
    surfacesTakeaway: 'One stream. Three surfaces. One runtime contract.',
    streamPath: ['provider event', 'QoreStream', 'readonly signal', 'text node'],
    demoPipeline: ['event', 'QoreStream', 'selector', 'UI surface'],
    surfaces: [
      ['Signal', 'Bind current accumulated value directly into UI.', `answer()`],
      ['AsyncIterable', 'Observe every token, tool call, or event in control flow.', `for await (const event of events) {}`],
      ['Lifecycle', 'Read status, errors, chunks, timing, and cancellation state.', `answer.status()\nanswer.error()\nanswer.chunkCount()`]
    ],
    demoEyebrow: 'Live primitive',
    demoTitle: 'One event stream. Four UI surfaces.',
    providerLabel: 'Provider',
    demoPromptLabel: 'Prompt',
    demoButton: 'Stream',
    promptPrefix: 'prompt',
    statusPrefix: 'status',
    chunksPrefix: 'chunks',
    waiting: 'waiting for the first token...',
    guideAction: 'View example',
    safetyNote: 'Provider keys belong in your server or trusted runtime. Browsers should consume your own SSE or NDJSON endpoint.',
    presetLabel: 'Presets',
    presets: [
      'Explain stream = signal',
      'Show an agent event stream',
      'Why avoid transcript rewrites?'
    ],
    comparisonTitle: 'React vs Qore',
    comparisonLead: 'React can stay your view layer. Qore changes the path tokens take before they touch UI.',
    comparisonTakeaway: 'The point is not replacing React. The point is removing token-by-token state glue.',
    reactTitle: 'React / AI SDK path',
    qoreTitle: 'React + Qore path',
    reactSteps: ['token', 'hook state', 'component render', 'reconcile', 'DOM'],
    qoreSteps: ['token', 'QoreStream', 'external store', 'React view'],
    reactWork: ['state glue', 'render pass', 'reconcile pass', 'transcript rewrite'],
    qoreWork: ['readonly stream', 'external store', 'view update'],
    reactCaption: 'Every token re-enters component state.',
    qoreCaption: 'The stream remains the source of truth; React subscribes to snapshots.',
    adapterTitle: 'Use Qore inside React',
    adapterLead: 'Use the release-ready React adapter and React external store contract instead of copying chunks into component state.',
    adapterCode: `const answer = useQoreStream(
  () => stream(fetch('/api/chat').then((r) => r.body)),
  [prompt],
  { initialValue: '' }
)`,
    adapterStatus: 'Release-ready adapter',
    adapterPills: ['useSyncExternalStore', 'selector hooks', 'abort on unmount'],
    architectureTitle: 'Architecture',
    architectureLead: 'Providers are inputs. The runtime is the product.',
    architectureTakeaway: 'Providers can change. Runtime semantics stay stable.',
    runtimeCoreLabel: 'Stable layer',
    runtimeCoreTitle: 'The runtime owns streaming semantics.',
    runtimeCapabilities: ['backpressure', 'retry', 'lifecycle', 'reducers', 'event selection'],
    architectureSteps: [
      ['Provider', 'OpenAI, Anthropic, Ollama, custom SSE, or NDJSON.'],
      ['Stream Runtime', 'Backpressure, lifecycle, retry, event selection, and reducers.'],
      ['Signal', 'Readonly state with fine-grained dependency tracking.'],
      ['UI', 'DOM binding, framework adapters, or your own renderer.']
    ],
    benchmarkTitle: 'Benchmark',
    benchmarkLead: 'The honest comparison is not Qore versus React as brands. It is streaming state model versus snapshot rewrite model.',
    benchmarkTakeaway: 'Measure rewritten work, not brand names.',
    benchmarkLines: ['Fine-grained stream updates', 'vs', 'snapshot transcript rewrites'],
    benchmarkDetails: [
      ['Mutation target', 'Text node / selected region'],
      ['Transcript strategy', 'Append-only stream state'],
      ['Measured signals', 'mutations, added nodes, rewritten bytes']
    ],
    benchmarkScopes: [
      ['Qore', 'selected text node', 'scope-low'],
      ['Snapshot baseline', 'full transcript region', 'scope-high']
    ],
    providersTitle: 'Providers',
    providersLead: 'Adapters are entry points into the runtime, not the headline. Bring any streaming source and keep the same UI primitive.',
    providersTakeaway: 'The provider story can grow without changing the interface primitive.',
    providerNames: ['OpenAI', 'Anthropic', 'OpenRouter', 'DeepSeek', 'Ollama', 'Generic SSE', 'NDJSON'],
    providerCloudNote: 'Adapters normalize source events. Qore keeps the UI primitive stable.',
    providerBoundaryLabel: 'Server boundary',
    providerBoundary: ['Browser UI', 'Your SSE / NDJSON endpoint', 'Provider adapter', 'QoreStream signal'],
    finalTitle: 'Make streams first-class state for AI-native interfaces.',
    finalLead: 'Use Qore as the stream runtime. Keep your UI surface. Let stream = signal.',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'Server-side OpenAI stream, one browser-side QoreStream signal.',
        events: [
          { type: 'status', label: 'routing request' },
          { type: 'tool_call', name: 'search_docs', input: 'stream runtime notes' },
          { type: 'tool_result', name: 'search_docs', output: 'provider event -> signal -> UI' },
          { type: 'text', text: 'stream = signal\n' },
          { type: 'diff', patch: '+ bind only the text surface\n' },
          { type: 'status', label: 'done without transcript rewrite' }
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: 'Swap Anthropic into the same reactive stream runtime.',
        events: [
          { type: 'status', label: 'connecting to Claude' },
          { type: 'tool_call', name: 'plan_answer', input: 'compare provider paths' },
          { type: 'text', text: 'provider changed, UI model did not\n' },
          { type: 'diff', patch: '+ keep selectors stable\n' },
          { type: 'status', label: 'QoreStream completed' }
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: 'Wrap any SSE endpoint once and keep the UI primitive unchanged.',
        events: [
          { type: 'status', label: 'consuming custom SSE' },
          { type: 'tool_call', name: 'normalize_event', input: 'vendor payload' },
          { type: 'tool_result', name: 'normalize_event', output: 'typed DemoEvent' },
          { type: 'text', text: 'your endpoint becomes a signal\n' },
          { type: 'status', label: 'same binding, different source' }
        ]
      }
    ] satisfies readonly ProviderCopy[]
  },
  zh: {
    headlineTop: 'Reactive Stream Runtime',
    headlineBottom: 'for AI-native interfaces',
    tagline: 'stream = signal',
    summary: '让 stream 成为 AI-native interface 的一等状态。不重写 transcript，不搬运状态，不锁定 framework。',
    categoryLine: 'Provider event 变成 readonly signal。UI surface 订阅 stream，而不是把 chunk 复制进本地状态。',
    installLabel: '核心包',
    installCommand: 'pnpm add @qorejs/qore',
    useCases: ['AI chat', 'agent workspace', 'realtime logs', 'copilot UI'],
    primaryAction: '5 分钟上手',
    secondaryAction: '体验 Demo',
    tertiaryAction: 'GitHub',
    whyTitle: 'Qore 为什么存在',
    whyLead: '每个 token 都在改变界面。Qore 给这种变化一条稳定的 runtime path。',
    whyCode: `const answer = stream(openai.chat('hello'))

return h('p', {}, text(() => answer()))`,
    whyPoints: [
      ['不重写 transcript', 'chunk 到达时，只更新绑定的 text node。'],
      ['不搬运状态', 'stream 本身就是 UI 读取的 signal。'],
      ['不锁定 framework', 'Qore DOM 是一种 surface，React adapter 让已有应用也能接入。']
    ],
    surfacesTitle: 'One Stream Three Surfaces',
    surfacesLead: 'QoreStream 不只是字符串。它暴露 AI interface 真正需要的三种表面。',
    surfacesTakeaway: '一条 stream，三种 surface，一个稳定 runtime contract。',
    streamPath: ['provider event', 'QoreStream', 'readonly signal', 'text node'],
    demoPipeline: ['event', 'QoreStream', 'selector', 'UI surface'],
    surfaces: [
      ['Signal', '把当前累积值直接绑定到 UI。', `answer()`],
      ['AsyncIterable', '在控制流里观察每个 token、tool call 或事件。', `for await (const event of events) {}`],
      ['Lifecycle', '读取 status、error、chunks、timing 和取消状态。', `answer.status()\nanswer.error()\nanswer.chunkCount()`]
    ],
    demoEyebrow: 'Live primitive',
    demoTitle: '一条 event stream，驱动四个 UI surface。',
    providerLabel: 'Provider',
    demoPromptLabel: '提示词',
    demoButton: 'Stream',
    promptPrefix: '提示词',
    statusPrefix: '状态',
    chunksPrefix: 'chunks',
    waiting: '等待第一个 token...',
    guideAction: '查看示例',
    safetyNote: 'Provider key 应放在服务端或可信运行时。浏览器应消费你自己的 SSE 或 NDJSON endpoint。',
    presetLabel: '预设',
    presets: [
      '解释 stream = signal',
      '展示 agent event stream',
      '为什么避免 transcript rewrite？'
    ],
    comparisonTitle: 'React vs Qore',
    comparisonLead: 'React 可以继续做 view layer。Qore 改变 token 进入 UI 之前的路径。',
    comparisonTakeaway: '重点不是替代 React，而是移除 token-by-token state glue。',
    reactTitle: 'React / AI SDK path',
    qoreTitle: 'React + Qore path',
    reactSteps: ['token', 'hook state', 'component render', 'reconcile', 'DOM'],
    qoreSteps: ['token', 'QoreStream', 'external store', 'React view'],
    reactWork: ['state glue', 'render pass', 'reconcile pass', 'transcript rewrite'],
    qoreWork: ['readonly stream', 'external store', 'view update'],
    reactCaption: '每个 token 都重新进入 component state。',
    qoreCaption: 'stream 仍然是 truth source，React 只订阅 snapshot。',
    adapterTitle: '在 React 中使用 Qore',
    adapterLead: '使用 release-ready React adapter 和 React external store contract，不再把 chunk 手动复制进组件状态。',
    adapterCode: `const answer = useQoreStream(
  () => stream(fetch('/api/chat').then((r) => r.body)),
  [prompt],
  { initialValue: '' }
)`,
    adapterStatus: 'Release-ready adapter',
    adapterPills: ['useSyncExternalStore', 'selector hooks', 'abort on unmount'],
    architectureTitle: 'Architecture',
    architectureLead: 'Provider 是入口。Runtime 才是产品。',
    architectureTakeaway: 'Provider 可以换，runtime 语义保持稳定。',
    runtimeCoreLabel: 'Stable layer',
    runtimeCoreTitle: 'Runtime 负责 streaming 语义。',
    runtimeCapabilities: ['backpressure', 'retry', 'lifecycle', 'reducers', 'event selection'],
    architectureSteps: [
      ['Provider', 'OpenAI、Anthropic、Ollama、自定义 SSE 或 NDJSON。'],
      ['Stream Runtime', 'Backpressure、lifecycle、retry、event selection 和 reducer。'],
      ['Signal', '带细粒度依赖追踪的只读状态。'],
      ['UI', 'DOM binding、framework adapter 或你自己的 renderer。']
    ],
    benchmarkTitle: 'Benchmark',
    benchmarkLead: '诚实的比较不是 Qore 和 React 两个品牌，而是 streaming state model 和 snapshot rewrite model。',
    benchmarkTakeaway: '衡量被重写的工作量，而不是比较品牌名。',
    benchmarkLines: ['Fine-grained stream updates', 'vs', 'snapshot transcript rewrites'],
    benchmarkDetails: [
      ['Mutation target', 'Text node / selected region'],
      ['Transcript strategy', 'Append-only stream state'],
      ['Measured signals', 'mutations, added nodes, rewritten bytes']
    ],
    benchmarkScopes: [
      ['Qore', 'selected text node', 'scope-low'],
      ['Snapshot baseline', 'full transcript region', 'scope-high']
    ],
    providersTitle: 'Providers',
    providersLead: 'Adapter 是 runtime 的入口，不是首页主角。带来任意 streaming source，UI primitive 保持一致。',
    providersTakeaway: 'Provider story 可以继续扩展，但 interface primitive 不变。',
    providerNames: ['OpenAI', 'Anthropic', 'OpenRouter', 'DeepSeek', 'Ollama', 'Generic SSE', 'NDJSON'],
    providerCloudNote: 'Adapter 只负责规范化 source event，Qore 保持 UI primitive 稳定。',
    providerBoundaryLabel: '服务端边界',
    providerBoundary: ['Browser UI', 'Your SSE / NDJSON endpoint', 'Provider adapter', 'QoreStream signal'],
    finalTitle: 'Make streams first-class state for AI-native interfaces.',
    finalLead: '把 Qore 作为 stream runtime。保留你的 UI surface。让 stream = signal。',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        env: 'OPENAI_API_KEY',
        description: 'OpenAI 留在服务端，浏览器拿到一条 QoreStream signal。',
        events: [
          { type: 'status', label: 'routing request' },
          { type: 'tool_call', name: 'search_docs', input: 'stream runtime notes' },
          { type: 'tool_result', name: 'search_docs', output: 'provider event -> signal -> UI' },
          { type: 'text', text: 'stream = signal\n' },
          { type: 'diff', patch: '+ bind only the text surface\n' },
          { type: 'status', label: 'done without transcript rewrite' }
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        env: 'ANTHROPIC_API_KEY',
        description: '切到 Anthropic，也不改变 UI 更新模型。',
        events: [
          { type: 'status', label: 'connecting to Claude' },
          { type: 'tool_call', name: 'plan_answer', input: 'compare provider paths' },
          { type: 'text', text: 'provider changed, UI model did not\n' },
          { type: 'diff', patch: '+ keep selectors stable\n' },
          { type: 'status', label: 'QoreStream completed' }
        ]
      },
      {
        id: 'sse',
        name: 'Generic SSE',
        env: 'CUSTOM_AI_API_KEY',
        description: '把任意 SSE endpoint 包装一次，UI 原语保持不变。',
        events: [
          { type: 'status', label: 'consuming custom SSE' },
          { type: 'tool_call', name: 'normalize_event', input: 'vendor payload' },
          { type: 'tool_result', name: 'normalize_event', output: 'typed DemoEvent' },
          { type: 'text', text: 'your endpoint becomes a signal\n' },
          { type: 'status', label: 'same binding, different source' }
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
const demoLink = computed(() => isZh.value ? '/zh/#surfaces' : '/#surfaces')
const providerGuideLink = computed(() => isZh.value ? '/zh/examples/agent-event-stream.html' : '/examples/agent-event-stream.html')
let disposeQore: (() => Element) | null = null
let activeAnswer: { abort(reason?: unknown): unknown } | null = null

function makeDemoEvents() {
  return [...activeProvider.value.events]
}

function renderDemo(value = activePrompt.value) {
  if (!qoreRoot.value) {
    return
  }

  activeAnswer?.abort()
  disposeQore?.()

  const events = stream.events<DemoEvent>(stream.paced<DemoEvent>(makeDemoEvents(), 42))
  const markdown = events.select('text', {
    seed: '',
    reduce: (currentValue, event) => currentValue + event.text
  })
  const statuses = events.select('status')
  const toolCalls = events.select('tool_call')
  const toolResults = events.select('tool_result')
  const diff = events.select('diff', {
    seed: '',
    reduce: (currentValue, event) => currentValue + event.patch
  })
  activeAnswer = events

  disposeQore = mount(qoreRoot.value, () => h('section', { class: 'runtime-shell runtime-agent-shell' },
    h('div', { class: 'runtime-topline' },
      h('div', { class: 'runtime-provider' }, activeProvider.value.name),
      h('div', { class: 'runtime-meta runtime-meta-inline' }, text(() => `${t.value.statusPrefix}: ${statuses().at(-1)?.label ?? events.status()}`))
    ),
    h('div', { class: 'runtime-thread' },
      h('article', { class: 'runtime-bubble runtime-bubble-user' },
        h('span', { class: 'runtime-bubble-label' }, 'You'),
        h('p', { class: 'runtime-prompt' }, `${t.value.promptPrefix}: ${value}`)
      ),
      h('article', { class: 'runtime-bubble runtime-bubble-assistant' },
        h('span', { class: 'runtime-bubble-label' }, 'markdown surface'),
        h('pre', { class: 'runtime-output' }, text(() => markdown() || t.value.waiting))
      )
    ),
    h('div', { class: 'runtime-surfaces' },
      h('article', null,
        h('span', null, 'timeline'),
        h('ol', null, list(() => events(), (event) => h('li', { class: `event-${event.type}` }, event.type)))
      ),
      h('article', null,
        h('span', null, 'tools'),
        h('ol', null, list(() => [...toolCalls(), ...toolResults()], (event) => h('li', null, event.type === 'tool_call' ? `${event.name}: ${event.input}` : `${event.name}: ${event.output}`)))
      ),
      h('article', null,
        h('span', null, 'diff'),
        h('pre', null, text(() => diff() || '+ waiting for patch'))
      )
    ),
    h('div', { class: 'runtime-footer' },
      h('div', { class: 'runtime-meta' }, text(() => `${t.value.chunksPrefix}: ${events.chunkCount()}`)),
      h('div', { class: 'runtime-meta' }, 'QoreEventStream')
    ),
    h('div', { class: 'runtime-lens' },
      ...t.value.demoPipeline.map((step, index) => h('span', { class: index === 1 || index === 2 ? 'active' : '' }, step))
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

        <div class="hero-actions">
          <a class="primary-action" :href="quickStartLink">{{ t.primaryAction }}</a>
          <a class="secondary-action" :href="demoLink">{{ t.secondaryAction }}</a>
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
          <div class="work-meter" aria-label="React streaming work">
            <span v-for="item in t.reactWork" :key="item">{{ item }}</span>
          </div>
          <p class="path-caption">{{ t.reactCaption }}</p>
        </article>
        <article class="path-panel strong-path">
          <h3>{{ t.qoreTitle }}</h3>
          <ol>
            <li v-for="step in t.qoreSteps" :key="step">{{ step }}</li>
          </ol>
          <div class="work-meter compact-meter" aria-label="Qore streaming work">
            <span v-for="item in t.qoreWork" :key="item">{{ item }}</span>
          </div>
          <p class="path-caption">{{ t.qoreCaption }}</p>
        </article>
      </div>

      <article class="react-adapter-card" aria-label="Qore React adapter preview">
        <div>
          <span>{{ t.adapterStatus }}</span>
          <h3>{{ t.adapterTitle }}</h3>
          <p>{{ t.adapterLead }}</p>
          <div class="adapter-pills">
            <em v-for="pill in t.adapterPills" :key="pill">{{ pill }}</em>
          </div>
        </div>
        <pre><code>{{ t.adapterCode }}</code></pre>
      </article>

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

      <div class="runtime-core-card">
        <span>{{ t.runtimeCoreLabel }}</span>
        <strong>{{ t.runtimeCoreTitle }}</strong>
        <div>
          <em v-for="capability in t.runtimeCapabilities" :key="capability">{{ capability }}</em>
        </div>
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
        <div class="scope-board" aria-label="Streaming update scope comparison">
          <article v-for="scope in t.benchmarkScopes" :key="scope[0]" :class="scope[2]">
            <span>{{ scope[0] }}</span>
            <strong>{{ scope[1] }}</strong>
            <i></i>
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

      <div class="provider-boundary" aria-label="Provider server boundary">
        <strong>{{ t.providerBoundaryLabel }}</strong>
        <span v-for="step in t.providerBoundary" :key="step">{{ step }}</span>
      </div>

      <div class="providers-board">
        <div class="provider-cloud" aria-label="Supported provider adapters">
          <span v-for="name in t.providerNames" :key="name">{{ name }}</span>
          <p>{{ t.providerCloudNote }}</p>
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
  background: #06110f;
}

:global(body:has(.VPContent.is-home)) {
  background: #06110f;
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
  --font-display: 'Space Grotesk', 'Avenir Next', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  --text: #ffffff;
  --muted: rgba(252, 255, 254, 0.94);
  --soft: rgba(248, 255, 252, 0.78);
  --line: rgba(102, 247, 223, 0.3);
  --panel: rgba(246, 255, 252, 0.11);
  --panel-strong: rgba(246, 255, 252, 0.17);
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
    radial-gradient(circle at 20% 0%, rgba(49, 217, 255, 0.26), transparent 30%),
    radial-gradient(circle at 83% 13%, rgba(102, 247, 223, 0.24), transparent 28%),
    linear-gradient(180deg, #081c18 0%, #0b2a24 42%, #06110f 100%);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 360ms ease, transform 360ms ease;
  overflow: hidden;
  font-family: var(--font-display);
}

.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(102, 247, 223, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 247, 223, 0.06) 1px, transparent 1px);
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
  min-height: min(860px, calc(100svh - 64px));
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
  gap: 20px;
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
  font-family: var(--font-display);
}

h1 {
  display: grid;
  gap: 10px;
  max-width: 920px;
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(54px, 6.15vw, 92px);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.076em;
  background: linear-gradient(112deg, #ffffff 0%, #ffffff 36%, #dffff8 58%, var(--accent) 82%, var(--accent-strong) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-wrap: balance;
  filter: drop-shadow(0 0 18px rgba(102, 247, 223, 0.16));
  text-shadow: 0 0 38px rgba(102, 247, 223, 0.24);
}

.hero-copy h1 span {
  display: block;
  font: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
}

.tagline code,
pre,
.install-card,
.install-card code,
.use-case-row span,
.provider-tabs button,
.prompt-row input,
.prompt-row button,
.preset-row button,
.section-index,
.benchmark-statement,
.provider-cloud span {
  font-family: var(--font-mono);
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
  max-width: 720px;
  color: rgba(255, 255, 255, 0.97);
  font-size: clamp(21px, 2vw, 27px);
  font-weight: 700;
  line-height: 1.32;
  letter-spacing: -0.05em;
}

.category-line {
  max-width: 710px;
  padding-left: 18px;
  border-left: 2px solid rgba(49, 217, 255, 0.72);
  color: rgba(238, 255, 252, 0.96);
  font-size: clamp(15px, 1.45vw, 18px);
  font-weight: 760;
  line-height: 1.55;
  letter-spacing: -0.03em;
}

.install-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  width: min(100%, 560px);
  padding: 12px;
  border: 1px solid rgba(102, 247, 223, 0.22);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(49, 217, 255, 0.12), transparent 46%),
    rgba(0, 0, 0, 0.22);
  box-shadow: 0 22px 80px rgba(0, 0, 0, 0.24);
}

.install-card span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 12px;
  color: #031311;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.install-card code {
  min-width: 0;
  overflow: hidden;
  color: var(--text);
  font-size: clamp(13px, 1.3vw, 16px);
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.use-case-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.use-case-row span {
  padding: 8px 10px;
  border: 1px solid rgba(102, 247, 223, 0.18);
  border-radius: 999px;
  color: rgba(248, 255, 252, 0.82);
  background: rgba(246, 255, 252, 0.058);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.01em;
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
  gap: 18px;
  padding: clamp(20px, 2.7vw, 32px);
  border-radius: 32px;
  border-color: rgba(102, 247, 223, 0.42);
  background:
    radial-gradient(circle at 78% 0%, rgba(49, 217, 255, 0.24), transparent 34%),
    linear-gradient(180deg, rgba(246, 255, 252, 0.17), rgba(246, 255, 252, 0.09));
  box-shadow:
    0 34px 120px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.why-card h2,
.section-copy h2,
.final-section h2 {
  color: #ffffff;
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
  padding: 13px 16px;
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
  font: 850 12px/1 var(--font-mono);
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
  font: 850 11px/1.2 var(--font-mono);
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
  color: rgba(244, 251, 247, 0.78);
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
  font: 850 11px/1 var(--font-mono);
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
  font: 850 12px/1.5 var(--font-mono);
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
  font: 850 clamp(15px, 1.35vw, 19px)/1.55 var(--font-mono);
  letter-spacing: -0.012em;
}

:deep(.runtime-surfaces) {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr 1fr;
  gap: 10px;
}

:deep(.runtime-surfaces article) {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(102, 247, 223, 0.14);
  border-radius: 16px;
  background: rgba(246, 255, 252, 0.058);
}

:deep(.runtime-surfaces span) {
  display: block;
  margin-bottom: 9px;
  color: var(--accent);
  font: 900 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

:deep(.runtime-surfaces ol) {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

:deep(.runtime-surfaces li),
:deep(.runtime-surfaces pre) {
  margin: 0;
  color: rgba(248, 255, 252, 0.72);
  font: 800 11px/1.45 var(--font-mono);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

:deep(.runtime-surfaces li) {
  position: relative;
  padding-left: 12px;
}

:deep(.runtime-surfaces li::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0.58em;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: rgba(49, 217, 255, 0.7);
  box-shadow: 0 0 12px rgba(49, 217, 255, 0.38);
}

:deep(.runtime-surfaces .event-text::before),
:deep(.runtime-surfaces .event-diff::before) {
  background: var(--accent);
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
  font-family: var(--font-mono);
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

.work-meter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.work-meter span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(102, 247, 223, 0.14);
  border-radius: 999px;
  color: rgba(248, 255, 252, 0.72);
  background: rgba(0, 0, 0, 0.18);
  font: 850 11px/1 var(--font-mono);
  letter-spacing: 0.01em;
}

.compact-meter span {
  color: #031311;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.path-caption {
  margin-top: 16px;
  color: rgba(248, 255, 252, 0.6);
  font-size: 14px;
  font-weight: 780;
  line-height: 1.55;
  letter-spacing: -0.02em;
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

.react-adapter-card {
  display: grid;
  grid-template-columns: minmax(0, 0.84fr) minmax(360px, 0.7fr);
  gap: clamp(18px, 3vw, 36px);
  align-items: stretch;
  margin-top: 18px;
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid rgba(102, 247, 223, 0.34);
  border-radius: 30px;
  background:
    radial-gradient(circle at 12% 0%, rgba(102, 247, 223, 0.16), transparent 36%),
    linear-gradient(135deg, rgba(246, 255, 252, 0.12), rgba(49, 217, 255, 0.052));
  box-shadow: 0 30px 110px rgba(0, 0, 0, 0.3);
}

.react-adapter-card > div {
  display: grid;
  gap: 12px;
  align-content: center;
}

.react-adapter-card span {
  width: fit-content;
  padding: 8px 10px;
  border: 1px solid rgba(102, 247, 223, 0.28);
  border-radius: 999px;
  color: var(--accent);
  background: rgba(0, 0, 0, 0.2);
  font: 900 11px/1 var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.react-adapter-card h3 {
  color: var(--text);
  font-size: clamp(26px, 3vw, 42px);
  line-height: 1;
  letter-spacing: -0.055em;
}

.react-adapter-card p {
  color: var(--muted);
  font-size: 16px;
  font-weight: 760;
  line-height: 1.68;
  letter-spacing: -0.025em;
}

.react-adapter-card pre {
  margin: 0;
  overflow: auto;
  padding: 20px;
  border: 1px solid rgba(102, 247, 223, 0.2);
  border-radius: 22px;
  color: var(--text);
  background:
    linear-gradient(90deg, rgba(49, 217, 255, 0.12), transparent 44%),
    rgba(0, 0, 0, 0.32);
  font: 850 12px/1.72 var(--font-mono);
  box-shadow: inset 3px 0 0 rgba(102, 247, 223, 0.5);
}

.adapter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.adapter-pills em {
  padding: 8px 10px;
  border: 1px solid rgba(102, 247, 223, 0.16);
  border-radius: 999px;
  color: rgba(248, 255, 252, 0.78);
  background: rgba(0, 0, 0, 0.18);
  font: normal 850 11px/1 var(--font-mono);
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

.runtime-core-card {
  display: grid;
  gap: 16px;
  margin-top: 18px;
  padding: clamp(22px, 3vw, 32px);
  border: 1px solid rgba(102, 247, 223, 0.24);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(49, 217, 255, 0.12), transparent 42%),
    rgba(0, 0, 0, 0.18);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
}

.runtime-core-card > span {
  color: var(--accent-strong);
  font: 900 12px/1 var(--font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.runtime-core-card strong {
  max-width: 720px;
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.058em;
}

.runtime-core-card div {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.runtime-core-card em {
  padding: 10px 12px;
  border: 1px solid rgba(102, 247, 223, 0.2);
  border-radius: 999px;
  color: rgba(248, 255, 252, 0.78);
  background: rgba(246, 255, 252, 0.045);
  font: normal 850 12px/1 var(--font-mono);
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

.scope-board {
  display: grid;
  gap: 12px;
}

.scope-board article {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.scope-board span,
.scope-board strong {
  font: 850 12px/1.2 var(--font-mono);
}

.scope-board span {
  color: var(--accent);
}

.scope-board strong {
  color: rgba(248, 255, 252, 0.74);
}

.scope-board i {
  grid-column: 1 / -1;
  display: block;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.scope-board i::after {
  content: '';
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
}

.scope-low i::after {
  width: 28%;
}

.scope-high i::after {
  width: 100%;
  background: linear-gradient(90deg, rgba(245, 211, 139, 0.78), rgba(255, 255, 255, 0.24));
}

.provider-boundary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  margin: -6px 0 22px;
  padding: 10px;
  border: 1px solid rgba(102, 247, 223, 0.2);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
}

.provider-boundary strong,
.provider-boundary span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: 850 12px/1 var(--font-mono);
}

.provider-boundary strong {
  padding: 9px 12px;
  border-radius: 999px;
  color: #031311;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.provider-boundary span {
  color: rgba(248, 255, 252, 0.76);
}

.provider-boundary span:not(:last-child)::after {
  content: '→';
  color: var(--accent-strong);
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

.provider-cloud p {
  flex-basis: 100%;
  max-width: 620px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(102, 247, 223, 0.13);
  color: rgba(248, 255, 252, 0.66);
  font-size: clamp(18px, 2.2vw, 28px);
  font-weight: 850;
  line-height: 1.22;
  letter-spacing: -0.045em;
}

.provider-card {
  display: grid;
  gap: 10px;
  padding: clamp(22px, 3vw, 28px);
  border-radius: 30px;
}

.provider-card strong {
  color: var(--accent);
  font: 900 18px/1.35 var(--font-mono);
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
  .react-adapter-card,
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
    font-size: clamp(54px, 6.2vw, 76px);
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

@media (max-height: 760px) and (min-width: 981px) {
  .home-page {
    padding-top: 116px;
  }

  .hero-section {
    align-items: start;
    min-height: auto;
  }

  h1 {
    font-size: clamp(50px, 5.45vw, 78px);
    line-height: 0.92;
  }

  .summary {
    max-width: 650px;
    font-size: clamp(18px, 1.72vw, 22px);
  }

  .category-line {
    max-width: 640px;
    font-size: 15px;
  }

  .why-card {
    gap: 13px;
    padding: 22px;
    border-radius: 26px;
  }

  .why-card h2 {
    font-size: clamp(28px, 3.1vw, 42px);
  }

  .why-card p,
  .why-points p {
    font-size: 14px;
    line-height: 1.55;
  }

  .why-card pre {
    padding: 14px;
    font-size: 11px;
    line-height: 1.55;
  }

  .why-points article {
    padding: 10px 12px;
    border-radius: 15px;
  }

  .why-points h3 {
    font-size: 18px;
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
  .scope-board article,
  :deep(.runtime-lens),
  :deep(.runtime-surfaces) {
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

  .category-line,
  .use-case-row,
  .ghost-action {
    display: none;
  }

  .hero-actions {
    display: grid;
  }

  .install-card {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .install-card span,
  .install-card code {
    width: 100%;
  }

  .install-card span {
    justify-content: center;
    text-align: center;
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
  .react-adapter-card,
  .benchmark-board,
  .provider-card,
  .final-section {
    border-radius: 24px;
  }

  .react-adapter-card {
    grid-template-columns: 1fr;
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

  .provider-boundary {
    width: 100%;
    border-radius: 22px;
  }

  .provider-boundary strong,
  .provider-boundary span {
    width: 100%;
    justify-content: space-between;
  }

  .provider-boundary span:not(:last-child)::after {
    content: '↓';
  }

  .runtime-core-card strong {
    letter-spacing: -0.045em;
  }

  .scope-board i {
    grid-column: auto;
  }

  .takeaway {
    width: 100%;
    border-radius: 22px;
  }
}
</style>
