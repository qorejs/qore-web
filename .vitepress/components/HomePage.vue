<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { stream } from '@qorejs/qore'
import { examples } from '../examples/catalog'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))
const link = (path: string) => withBase(`${isZh.value ? '/zh' : ''}${path}`)
const copy = computed(() => isZh.value ? {
  title: '让流式数据，\n自然成为状态。',
  description: '面向 AI 界面的响应式流运行时。把文本、事件和工具调用变成界面可直接订阅的状态。',
  start: '开始使用', github: '在 GitHub 查看', install: '复制安装命令',
  tabs: ['文本流', '事件流'], code: '复制代码', copied: '已复制', failed: '请选中文本复制',
  replay: '重新播放', stop: '停止', output: '实时输出', waiting: '等待数据…',
  demoNote: '本地演示 · 由真正的 Qore stream 驱动',
  features: [
    { icon: 'stream', title: 'Stream 就是 Signal', description: '同一条流，既是可读取的状态，也是可遍历的异步数据源。无需逐个搬运 token。', route: '/guide/core-concepts' },
    { icon: 'events', title: '不止于文本', description: '文本、JSON、工具调用和 Agent 事件，用同一套接口接入你的应用。', route: '/examples/agent-event-stream' },
    { icon: 'lifecycle', title: '完整的流生命周期', description: '内置状态、取消、错误处理和背压，让长时间运行的流始终可控。', route: '/guide/streaming' },
    { icon: 'code', title: '融入现有技术栈', description: '保留你熟悉的界面框架。使用 React 适配器、可选 DOM 渲染器，或直接订阅。', route: '/guide/react-adapter' },
  ],
  sources: '你选择数据源，Qore 负责流式状态。',
  nextLabel: '从这里开始', nextTitle: '从第一个 token，到完整的界面。',
  nextDescription: '几行代码接入一条流，再按需探索事件、生命周期与框架集成。',
  quick: '快速上手', quickDescription: '构建你的第一个流式界面',
  api: '探索 Stream API', apiDescription: '了解状态、事件与生命周期',
  status: { idle: '就绪', pending: '等待中', streaming: '流式传输中', completed: '已完成', aborted: '已停止', error: '出错' },
} : {
  title: 'Streams,\nnaturally reactive.',
  description: 'A reactive stream runtime for AI-native interfaces. Turn tokens, events, and tool calls into state your UI can subscribe to.',
  start: 'Get Started', github: 'View on GitHub', install: 'Copy install command',
  tabs: ['Stream', 'Events'], code: 'Copy code', copied: 'Copied!', failed: 'Select the text to copy',
  replay: 'Replay', stop: 'Stop', output: 'Live output', waiting: 'Waiting for data…',
  demoNote: 'Local demo · powered by a real Qore stream',
  features: [
    { icon: 'stream', title: 'Stream = Signal', description: 'One primitive. Read it as state, subscribe to updates, or iterate over every chunk. No token-by-token state glue.', route: '/guide/core-concepts' },
    { icon: 'events', title: 'Beyond text', description: 'Text, structured JSON, tool calls, and agent events. Bring them into your interface through the same API.', route: '/examples/agent-event-stream' },
    { icon: 'lifecycle', title: 'Lifecycle included', description: 'Status, cancellation, errors, and backpressure. Everything you need to keep a long-running stream in control.', route: '/guide/streaming' },
    { icon: 'code', title: 'Your UI. Your way.', description: 'Keep the framework you know. Use the React adapter, the optional DOM renderer, or subscribe directly.', route: '/guide/react-adapter' },
  ],
  sources: 'Bring your source. Keep your stream.',
  nextLabel: 'A SMALL API. A SIMPLE START.', nextTitle: 'Your first stream is a few lines away.',
  nextDescription: 'Start with a single stream. Explore events, lifecycle controls, and framework integrations as you go.',
  quick: 'Quick start', quickDescription: 'Build your first streaming interface',
  api: 'Explore the Stream API', apiDescription: 'State, events, and lifecycle essentials',
  status: { idle: 'Ready', pending: 'Waiting', streaming: 'Streaming', completed: 'Completed', aborted: 'Stopped', error: 'Error' },
})

const featuredExamples = examples.filter(item => ['text-stream', 'tool-selector', 'json-output', 'merge', 'retry', 'cancellation'].includes(item.id))
const activeTab = ref(0)
const status = ref('idle')
const output = ref('')
const eventLines = ref<string[]>([])
const copied = ref('')
const copyFailed = ref(false)
const tabButtons = ref<HTMLButtonElement[]>([])
const running = computed(() => status.value === 'pending' || status.value === 'streaming')
const statusLabel = computed(() => copy.value.status[status.value as keyof typeof copy.value.status] ?? status.value)
const samples = [
  `import { stream } from '@qorejs/qore'

const answer = stream.paced(
  ['Hello, ', 'streaming ', 'world.'], 180
)
answer.subscribe(value => console.log(value))
await answer.ready
answer() // 'Hello, streaming world.'`,
  `import { stream } from '@qorejs/qore'

const events = stream.events(agent.run(task))
const tools = events.select('tool_call')

tools.subscribe(calls => console.log(calls))

// One source. Only the events you need.
await events.ready`,
]
const code = computed(() => samples[activeTab.value])
// Only render tokens as text nodes; sample content is never inserted as HTML.
const highlighted = computed(() => code.value.split(/('[^'\n]*'|\/\/[^\n]*|\b(?:import|from|const|await)\b|\b\d+\b)/g).map(text => ({
  text,
  kind: text.startsWith('//') ? 'comment' : text.startsWith("'") ? 'string' : /^(import|from|const|await)$/.test(text) ? 'keyword' : /^\d+$/.test(text) ? 'number' : '',
})))

let dispose: (() => void) | undefined
let copyTimeout: ReturnType<typeof setTimeout> | undefined
let generation = 0
let copyGeneration = 0
let mounted = false

function play() {
  dispose?.()
  const run = ++generation
  output.value = ''
  eventLines.value = []
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pace = reducedMotion ? 0 : 180
  if (activeTab.value === 0) {
    const answer = stream.paced(['Hello, ', 'streaming ', 'world.'], pace)
    const unsubscribe = answer.subscribe(value => { output.value = value })
    const unsubscribeStatus = answer.status.subscribe(value => { status.value = value })
    status.value = answer.status()
    dispose = () => { unsubscribe(); unsubscribeStatus(); answer.abort() }
    void answer.ready.catch(() => { if (run === generation) status.value = answer.status() })
  } else {
    type AgentEvent =
      | { type: 'status'; text: string }
      | { type: 'tool_call'; name: string }
      | { type: 'text'; text: string }
    // Illustrative local agent events; no provider or network request is made.
    async function* agentEvents(): AsyncGenerator<AgentEvent> {
      const source: AgentEvent[] = [
        { type: 'status', text: 'thinking' },
        { type: 'tool_call', name: 'search_docs' },
        { type: 'text', text: 'Found the answer.' },
        { type: 'tool_call', name: 'read_page' },
      ]
      for (const event of source) {
        if (pace) await new Promise(resolve => setTimeout(resolve, pace))
        yield event
      }
    }
    const events = stream.events(agentEvents())
    const tools = events.select('tool_call')
    const unsubscribe = tools.subscribe(calls => {
      eventLines.value = calls.map(call => `tool_call → ${call.name}`)
    })
    const unsubscribeStatus = events.status.subscribe(value => { status.value = value })
    status.value = events.status()
    dispose = () => { unsubscribe(); unsubscribeStatus(); tools.abort(); events.abort() }
    void events.ready.catch(() => { if (run === generation) status.value = events.status() })
    void tools.ready.catch(() => {})
  }
}

function stop() {
  ++generation
  dispose?.()
  dispose = undefined
  status.value = 'aborted'
}

function selectTab(index: number) {
  ++copyGeneration
  clearTimeout(copyTimeout)
  activeTab.value = index
  copied.value = ''
  if (mounted) play()
}

function moveTab(event: KeyboardEvent) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()
  const focused = tabButtons.value.indexOf(event.target as HTMLButtonElement)
  const current = focused < 0 ? activeTab.value : focused
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (current + 1) % 2
  selectTab(next)
  tabButtons.value[next]?.focus()
}

async function copyText(target: 'install' | 'code') {
  const request = ++copyGeneration
  clearTimeout(copyTimeout)
  copied.value = ''
  let failed = false
  try {
    await navigator.clipboard.writeText(target === 'install' ? 'npm i @qorejs/qore' : code.value)
  } catch {
    failed = true
  }
  if (!mounted || request !== copyGeneration) return
  copyFailed.value = failed
  copied.value = target
  copyTimeout = setTimeout(() => { copied.value = '' }, 2200)
}

onMounted(() => { mounted = true; play() })
onBeforeUnmount(() => { mounted = false; ++generation; ++copyGeneration; dispose?.(); clearTimeout(copyTimeout) })
</script>

<template>
  <div class="home-page">
    <section class="home-hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <a class="hero-kicker" :href="link('/guide/core-concepts')"><span class="kicker-dot" /> stream = signal <span aria-hidden="true">↗</span></a>
        <h1 id="hero-title"><span class="brand-name">Qore</span><span class="hero-title">{{ copy.title }}</span></h1>
        <p class="hero-description">{{ copy.description }}</p>
        <div class="hero-actions">
          <a class="action-primary" :href="link('/guide/quick-start')">{{ copy.start }} <span aria-hidden="true">→</span></a>
          <a class="action-secondary" href="https://github.com/qorejs/qore">{{ copy.github }}</a>
        </div>
        <div class="install-command">
          <span class="terminal-prompt" aria-hidden="true">$</span><code>npm i @qorejs/qore</code>
          <button type="button" :aria-label="copy.install" :title="copy.install" @click="copyText('install')">
            <svg v-if="copied !== 'install'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></svg>
            <span v-else aria-hidden="true">{{ copyFailed ? '!' : '✓' }}</span>
          </button>
          <span v-if="copied === 'install'" class="copy-feedback" role="status">{{ copyFailed ? copy.failed : copy.copied }}</span>
        </div>
      </div>

      <div id="live-demo" class="hero-example">
        <div class="code-window">
          <div class="code-toolbar">
            <div class="window-dots" aria-hidden="true"><i /><i /><i /></div>
            <div class="code-tabs" role="tablist" :aria-label="isZh ? '代码示例' : 'Code examples'" @keydown="moveTab">
              <button v-for="(tab, index) in copy.tabs" :id="`sample-tab-${index}`" :key="index" ref="tabButtons" type="button" role="tab" :aria-selected="activeTab === index" :tabindex="activeTab === index ? 0 : -1" aria-controls="sample-panel" @click="selectTab(index)">{{ tab }}</button>
            </div>
            <button class="code-copy" type="button" :aria-label="copy.code" :title="copy.code" @click="copyText('code')">
              <svg v-if="copied !== 'code'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></svg>
              <span v-else aria-hidden="true">{{ copyFailed ? '!' : '✓' }}</span>
            </button>
          </div>
          <div id="sample-panel" role="tabpanel" :aria-labelledby="`sample-tab-${activeTab}`" tabindex="0">
            <pre><code><span v-for="(token, index) in highlighted" :key="index" :class="token.kind">{{ token.text }}</span></code></pre>
          </div>
          <span v-if="copied === 'code'" class="code-feedback" role="status">{{ copyFailed ? copy.failed : copy.copied }}</span>
          <div class="demo-output">
            <div class="output-toolbar">
              <span class="output-label">{{ copy.output }}</span>
              <span class="demo-status" role="status" :data-demo-status="status"><i :class="{ running }" />{{ statusLabel }}</span>
              <button type="button" class="replay-button" @click="running ? stop() : play()"><span aria-hidden="true">{{ running ? '■' : '↻' }}</span> {{ running ? copy.stop : copy.replay }}</button>
            </div>
            <div class="output-value" :class="{ 'events-output': activeTab === 1 }">
              <template v-if="activeTab === 0"><span class="output-chevron" aria-hidden="true">›</span><span>{{ output || copy.waiting }}</span><span v-if="running" class="stream-cursor" aria-hidden="true" /></template>
              <template v-else><span v-if="!eventLines.length">{{ copy.waiting }}</span><span v-for="line in eventLines" :key="line">{{ line }}</span></template>
            </div>
          </div>
        </div>
        <p class="demo-note"><span aria-hidden="true">⤷</span> {{ copy.demoNote }}</p>
      </div>
    </section>

    <section class="feature-grid" :aria-label="isZh ? '核心特性' : 'Core features'">
      <a v-for="feature in copy.features" :key="feature.icon" class="feature-card" :href="link(feature.route)">
        <span class="feature-icon" aria-hidden="true">
          <svg v-if="feature.icon === 'stream'" viewBox="0 0 24 24"><path d="M3 7h5l4 10h9M3 17h5L12 7h9"/><path d="m18 4 3 3-3 3m0 4 3 3-3 3"/></svg>
          <svg v-else-if="feature.icon === 'events'" viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><path d="M18 14v8m-4-4h8"/></svg>
          <svg v-else-if="feature.icon === 'lifecycle'" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/><path d="M12 7v5l3 2"/></svg>
          <svg v-else viewBox="0 0 24 24"><path d="m7 6-5 6 5 6M17 6l5 6-5 6M14 4l-4 16"/></svg>
        </span>
        <h2>{{ feature.title }}</h2><p>{{ feature.description }}</p><span class="feature-arrow" aria-hidden="true">↗</span>
      </a>
    </section>

    <section class="source-section" :aria-label="isZh ? '数据源' : 'Sources'">
      <p>{{ copy.sources }}</p>
      <div class="source-list"><span>OpenAI</span><span>Anthropic</span><span>DeepSeek</span><span>Ollama</span><span class="source-divider" aria-hidden="true"/><a :href="link('/guide/server-streaming')">SSE <span aria-hidden="true">↗</span></a><a :href="link('/api/streaming')">NDJSON <span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="home-examples" aria-labelledby="home-examples-title">
      <div class="home-examples-heading"><div><span class="section-label">LEARN BY RUNNING</span><h2 id="home-examples-title">{{ isZh ? '更多场景，直接运行。' : 'More patterns. Ready to run.' }}</h2><p>{{ isZh ? '22 个可运行示例，覆盖数据接入、Agent 事件、流组合与生命周期。' : '22 runnable examples covering sources, agent events, composition, and lifecycle.' }}</p></div><a :href="link('/examples/')">{{ isZh ? '浏览全部 22 个示例' : 'Explore all 22 examples' }} →</a></div>
      <div class="home-example-grid"><a v-for="item in featuredExamples" :key="item.id" :href="link(`/examples/#${item.id}`)"><span>{{ item.category }}</span><h3>{{ item.title[isZh ? 'zh' : 'en'] }} <span aria-hidden="true">↗</span></h3><p>{{ item.description[isZh ? 'zh' : 'en'] }}</p></a></div>
    </section>

    <section class="next-section" aria-labelledby="next-title">
      <div><span class="section-label">{{ copy.nextLabel }}</span><h2 id="next-title">{{ copy.nextTitle }}</h2><p>{{ copy.nextDescription }}</p></div>
      <div class="next-links">
        <a :href="link('/guide/quick-start')"><span><strong>{{ copy.quick }}</strong><small>{{ copy.quickDescription }}</small></span><span aria-hidden="true">→</span></a>
        <a :href="link('/api/streaming')"><span><strong>{{ copy.api }}</strong><small>{{ copy.apiDescription }}</small></span><span aria-hidden="true">→</span></a>
      </div>
    </section>
  </div>
</template>
