<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { examples } from '../examples/catalog'
import { usage } from '../examples/usage'
import { exampleCode, formatValue, loadExample, type ExampleSession } from '../examples/runtime'
import '../theme/examples.css'

const { lang } = useData()
const locale = computed(() => lang.value.startsWith('zh') ? 'zh' : 'en')
const zh = computed(() => locale.value === 'zh')
const link = (path: string) => withBase(`${zh.value ? '/zh' : ''}${path}`)
const selectedId = ref<string>(examples[0].id)
const category = ref('all')
const query = ref('')
const selected = computed(() => examples.find(item => item.id === selectedId.value) ?? examples[0])
const categories = computed(() => [
  ['all', zh.value ? '全部' : 'All'],
  ['basics', zh.value ? '数据接入' : 'Sources'],
  ['data', zh.value ? '状态与数据' : 'State & data'],
  ['agents', zh.value ? 'Agent 事件' : 'Agent events'],
  ['composition', zh.value ? '流的组合' : 'Composition'],
  ['control', zh.value ? '生命周期' : 'Lifecycle'],
])
const filtered = computed(() => examples.filter(item => {
  const matchCategory = category.value === 'all' || item.category === category.value
  const text = `${item.title.en} ${item.title.zh} ${item.description.en} ${item.description.zh} ${item.id}`.toLowerCase()
  return matchCategory && text.includes(query.value.trim().toLowerCase())
}))
const source = computed(() => exampleCode(selected.value.id))
const highlighted = computed(() => source.value.split(/('[^'\n]*'|\/\/[^\n]*|\b(?:import|from|export|function|async|await|yield|return|const|let|if|throw|new|type)\b|\b\d+\b)/g).map(text => ({
  text, kind: text.startsWith('//') ? 'comment' : text.startsWith("'") ? 'string' : /^(import|from|export|function|async|await|yield|return|const|let|if|throw|new|type)$/.test(text) ? 'keyword' : /^\d+$/.test(text) ? 'number' : '',
})))
const status = ref('idle')
const output = ref('')
const error = ref('')
const chunks = ref(0)
const copyState = ref('')
const busy = computed(() => ['loading', 'pending', 'streaming'].includes(status.value))
const statusLabel = computed(() => {
  const labels: Record<string, string> = zh.value
    ? { idle: '就绪', loading: '加载中', pending: '等待中', streaming: '运行中', completed: '已完成', aborted: '已停止', error: '错误' }
    : { idle: 'Ready', loading: 'Loading', pending: 'Waiting', streaming: 'Running', completed: 'Completed', aborted: 'Stopped', error: 'Error' }
  return labels[status.value] ?? status.value
})

let generation = 0
let copyGeneration = 0
let copyTimer: ReturnType<typeof setTimeout> | undefined
let dispose: (() => void) | undefined
let mounted = false

function resetRun() {
  ++generation
  dispose?.()
  dispose = undefined
}
async function run() {
  resetRun()
  const token = generation
  status.value = 'loading'
  output.value = ''
  error.value = ''
  chunks.value = 0
  try {
    const module = await loadExample(selected.value.id)
    if (!mounted || token !== generation) return
    const interval = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 160
    const session: ExampleSession = module.createExample(interval)
    const answer = session.stream
    const update = () => {
      if (token !== generation) return
      output.value = formatValue(answer())
      status.value = answer.status()
      chunks.value = answer.chunkCount()
      error.value = answer.error()?.message ?? ''
    }
    const subscriptions = [answer.subscribe(update), answer.status.subscribe(update), answer.chunkCount.subscribe(update), answer.error.subscribe(update)]
    dispose = () => { subscriptions.forEach(stop => stop()); answer.abort(); session.dispose?.() }
    update()
    void answer.ready.then(update, update)
  } catch (reason) {
    if (token !== generation) return
    status.value = 'error'
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}
function stop() { resetRun(); status.value = 'aborted' }
function readHash() {
  ++copyGeneration
  clearTimeout(copyTimer)
  copyState.value = ''
  const id = window.location.hash.slice(1)
  if (examples.some(item => item.id === id)) selectedId.value = id
  else selectedId.value = examples[0].id
  category.value = 'all'
  query.value = ''
  void run()
}
async function select(id: string) {
  selectedId.value = id
  ++copyGeneration
  copyState.value = ''
  history.pushState({}, '', `#${id}`)
  void run()
  if (window.matchMedia('(max-width: 767px)').matches) {
    await nextTick()
    document.querySelector('#example-workbench')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}
async function copyCode() {
  const token = ++copyGeneration
  clearTimeout(copyTimer)
  try {
    await navigator.clipboard.writeText(`${source.value}\n${usage}\n`)
    if (!mounted || token !== copyGeneration) return
    copyState.value = zh.value ? '已复制完整代码' : 'Full example copied'
  } catch {
    if (!mounted || token !== copyGeneration) return
    copyState.value = zh.value ? '请选中代码手动复制' : 'Select the code to copy it manually'
  }
  copyTimer = setTimeout(() => { copyState.value = '' }, 2200)
}
onMounted(() => { mounted = true; readHash(); window.addEventListener('hashchange', readHash) })
onBeforeUnmount(() => { mounted = false; resetRun(); ++copyGeneration; clearTimeout(copyTimer); window.removeEventListener('hashchange', readHash) })
</script>

<template>
  <div class="examples-page">
    <header class="examples-heading">
      <span class="section-label">QORE EXAMPLES</span>
      <h1>{{ zh ? '从一条流，开始构建。' : 'Start with a stream. Build from here.' }}</h1>
      <p>{{ zh ? '22 个可运行示例，从接收第一个 token 到管理完整的 Agent 事件流。选择示例，查看代码，直接运行。' : '22 runnable examples, from your first token to a complete agent event stream. Pick a pattern, read the code, and run it.' }}</p>
      <span class="examples-local-note">{{ zh ? '全部在本地运行 · 无需 API Key · 代码与实际执行内容一致' : 'Runs locally · No API key needed · The code you see is the code that runs' }}</span>
    </header>
    <div class="example-filters">
      <div class="category-buttons" :aria-label="zh ? '示例分类' : 'Example categories'">
        <button v-for="[id, title] in categories" :key="id" type="button" :aria-pressed="category === id" @click="category = id">{{ title }} <span>{{ id === 'all' ? examples.length : examples.filter(item => item.category === id).length }}</span></button>
      </div>
      <input v-model="query" type="search" :aria-label="zh ? '搜索示例' : 'Search examples'" :placeholder="zh ? '搜索示例…' : 'Search examples…'" />
    </div>
    <div class="examples-layout">
      <aside class="example-picker" :aria-label="zh ? '选择示例' : 'Choose an example'">
        <p class="example-count" aria-live="polite">{{ filtered.length }} {{ zh ? '个示例' : 'examples' }}</p>
        <button v-for="(item, index) in filtered" :key="item.id" type="button" :data-example="item.id" :aria-pressed="selectedId === item.id" @click="select(item.id)">
          <span class="example-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ item.title[locale] }}</strong><small>{{ item.description[locale] }}</small></span><span aria-hidden="true">↗</span>
        </button>
        <p v-if="!filtered.length" class="example-empty">{{ zh ? '没有匹配的示例，试试其他关键词。' : 'No examples match. Try a different search.' }}<button type="button" @click="category = 'all'; query = ''">{{ zh ? '清除筛选' : 'Clear filters' }}</button></p>
      </aside>
      <section id="example-workbench" class="example-workbench" :aria-label="zh ? '示例运行区' : 'Example playground'">
        <div class="example-intro"><h2>{{ selected.title[locale] }}</h2><p>{{ selected.description[locale] }}</p><a :href="link(selected.guide)">{{ zh ? '阅读相关文档' : 'Read the guide' }} ↗</a></div>
        <div class="example-editor">
          <div class="example-editor-toolbar"><span>{{ selected.id }}.ts</span><button type="button" @click="copyCode">{{ zh ? '复制代码' : 'Copy code' }}</button></div>
          <pre tabindex="0" :aria-label="zh ? '示例源代码' : 'Example source code'"><code><span v-for="(token, index) in highlighted" :key="index" :class="token.kind">{{ token.text }}</span></code></pre>
          <p v-if="copyState" class="example-copy-feedback" role="status">{{ copyState }}</p>
        </div>
        <div class="example-result">
          <div class="example-result-toolbar"><strong>{{ zh ? '运行结果' : 'Output' }}</strong><span role="status" :data-example-status="status">{{ statusLabel }} · {{ chunks }} chunks</span><button type="button" @click="busy ? stop() : run()">{{ busy ? (zh ? '停止' : 'Stop') : (zh ? '重新运行' : 'Run again') }}</button></div>
          <pre data-example-output tabindex="0">{{ output || (zh ? '等待输出…' : 'Waiting for output…') }}</pre>
          <p v-if="error" class="example-error" role="status">{{ error }}</p>
          <p v-if="['error-handling', 'cancellation'].includes(selected.id)" class="example-explanation">{{ zh ? '这个示例会主动触发错误或取消，用于展示对应的终止状态。' : 'This example deliberately triggers an error or cancellation to demonstrate its terminal state.' }}</p>
        </div>
        <details class="example-usage"><summary>{{ zh ? '在自己的项目中运行' : 'Run in your own project' }}</summary><p>{{ zh ? '安装 npm i @qorejs/qore，将示例保存为 ESM 文件 example.mts，然后在文件末尾添加以下代码。可以用 npx tsx example.mts 运行。复制按钮已包含这段运行代码。' : 'Install npm i @qorejs/qore, save the sample as an ESM file named example.mts, and append the code below. Run it with npx tsx example.mts. The copy button includes this runner.' }}</p><pre tabindex="0"><code>{{ usage }}</code></pre></details>
      </section>
    </div>
    <section class="integration-links"><h2>{{ zh ? '接入真实应用' : 'Take it into your application' }}</h2><p>{{ zh ? '这些集成指南需要你自己的应用、服务端或 Provider 配置。' : 'These integration guides use your own application, server, or provider configuration.' }}</p><div><a :href="link('/guide/react-adapter')">React ↗</a><a :href="link('/guide/server-streaming')">Server / SSE ↗</a><a :href="link('/examples/ai-integration')">AI providers ↗</a><a :href="link('/examples/basic')">DOM ↗</a><a :href="link('/examples/counter')">{{ zh ? '响应式计数器' : 'Reactive counter' }} ↗</a><a :href="link('/examples/todo')">{{ zh ? '待办列表' : 'Todo list' }} ↗</a></div></section>
  </div>
</template>
