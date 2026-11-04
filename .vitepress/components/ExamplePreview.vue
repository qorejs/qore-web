<script setup lang="ts">
import { computed } from 'vue'
import '../theme/example-preview.css'

const props = defineProps<{
  id: string
  value: unknown
  received: unknown[]
  status: string
  zh: boolean
}>()
const running = computed(() => ['loading', 'pending', 'streaming'].includes(props.status))
const text = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const number = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : 0
const result = computed(() => record(props.value))
const items = computed(() => Array.isArray(props.value) ? props.value : [])
const events = computed(() => items.value.map(record))
const received = computed(() => props.received.map(value => text(value).trim()))
const progress = computed(() => Math.max(0, Math.min(100, props.id === 'object-state'
  ? number(result.value.completed) / Math.max(1, number(result.value.total)) * 100
  : number(props.value))))
const title = computed(() => text(result.value.title))
const documentItems = computed(() => Array.isArray(result.value.items) ? result.value.items.map(text) : [])
const kind = computed(() => {
  if (['async-generator', 'concat', 'pipeline'].includes(props.id)) return 'steps'
  const kinds: Record<string, string> = {
    list: 'list', latest: 'progress', 'running-total': 'counter', 'object-state': 'job',
    'json-output': 'document', 'bounded-logs': 'logs', 'agent-events': 'timeline',
    'tool-selector': 'tools', merge: 'merge', race: 'race', 'switch-latest': 'search',
    retry: 'retry', backpressure: 'paced',
  }
  return kinds[props.id] ?? 'chat'
})
const stateLabel = computed(() => {
  if (props.status === 'error') return props.zh ? '连接中断 · 已保留内容' : 'Connection lost · content preserved'
  if (props.status === 'aborted') return props.zh ? '已停止 · 已保留内容' : 'Stopped · content preserved'
  if (props.status === 'completed') return props.zh ? '接收完成' : 'Received'
  return props.zh ? '正在接收…' : 'Receiving…'
})
const sourceSelected = (source: string) => text(props.value).startsWith(source)
</script>

<template>
  <div class="visual-preview" :data-preview="id" :data-preview-kind="kind" :data-state="status">
    <div class="preview-appbar"><span class="preview-app-icon" aria-hidden="true">q</span><span>{{ zh ? 'Qore 效果演示' : 'Qore live preview' }}</span><span class="preview-live"><i :class="{ active: running }" />{{ running ? (zh ? '实时更新' : 'Live') : (zh ? '当前画面' : 'Current view') }}</span></div>
    <div class="preview-stage">
      <div v-if="kind === 'chat'" class="preview-chat">
        <div class="preview-user-message">{{ zh ? '展示这条流的输出。' : 'Show me the stream output.' }}</div>
        <div class="preview-assistant"><span class="preview-avatar" aria-hidden="true">Q</span><div><span class="preview-caption">{{ zh ? '流式回答' : 'Streaming answer' }}</span><div class="preview-bubble"><span>{{ text(value) || (zh ? '等待第一个数据块…' : 'Waiting for the first chunk…') }}</span><i v-if="running" class="preview-caret" aria-hidden="true" /></div><span class="preview-footnote">{{ stateLabel }}</span></div></div>
      </div>

      <div v-else-if="kind === 'progress'" class="preview-progress">
        <span class="preview-eyebrow">{{ zh ? '实时进度' : 'LIVE PROGRESS' }}</span>
        <strong class="preview-big-number">{{ progress }}<small>%</small></strong>
        <div class="preview-progress-track" role="progressbar" :aria-label="zh ? '任务进度' : 'Task progress'" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>
        <div class="preview-ticks"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
        <p class="preview-footnote">{{ zh ? '界面始终显示最新的进度值' : 'The interface always shows the latest progress value' }}</p>
      </div>

      <div v-else-if="kind === 'counter'" class="preview-counter">
        <span class="preview-eyebrow">{{ zh ? '实时累计' : 'RUNNING TOTAL' }}</span><strong class="preview-big-number" data-preview-total>{{ number(value) }}</strong>
        <div class="preview-increments"><span v-for="(chunk, index) in received" :key="index" data-preview-item>+{{ chunk }}</span><span v-if="!received.length" class="preview-muted">{{ zh ? '等待数字…' : 'Waiting for numbers…' }}</span></div>
        <p class="preview-footnote">{{ zh ? '每个增量到达时，累计值立即更新' : 'The total updates as each increment arrives' }}</p>
      </div>

      <div v-else-if="kind === 'job'" class="preview-job">
        <div class="preview-card-heading"><span class="preview-symbol" aria-hidden="true">↗</span><div><strong>{{ zh ? '发布任务' : 'Publishing job' }}</strong><span>{{ text(result.current) || (zh ? '等待开始' : 'Waiting') }}</span></div><b>{{ number(result.completed) }}/{{ number(result.total) || 3 }}</b></div>
        <div class="preview-progress-track" role="progressbar" :aria-label="zh ? '发布进度' : 'Publishing progress'" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>
        <div class="preview-job-steps"><div v-for="(label, index) in (zh ? ['准备', '构建', '发布'] : ['Prepare', 'Build', 'Publish'])" :key="label" :class="{ done: number(result.completed) > index }"><span>{{ number(result.completed) > index ? '✓' : index + 1 }}</span>{{ label }}</div></div>
      </div>

      <div v-else-if="kind === 'document'" class="preview-document">
        <span class="preview-eyebrow">{{ zh ? '结构化内容卡片' : 'STRUCTURED CONTENT' }}</span>
        <template v-if="title"><span class="preview-document-icon" aria-hidden="true">▤</span><h3 data-preview-title>{{ title }}</h3><div class="preview-tags"><span v-for="(item, index) in documentItems" :key="index" data-preview-item>{{ item }}</span></div><p class="preview-footnote">{{ zh ? '完整 JSON 已解析为标题和标签' : 'The complete JSON becomes a title and tags' }}</p></template>
        <div v-else class="preview-placeholder"><div /><div /><p>{{ zh ? '等待完整 JSON 文档…' : 'Waiting for the complete JSON document…' }}</p></div>
      </div>

      <div v-else-if="kind === 'list'" class="preview-task-list"><div class="preview-list-heading"><strong>{{ zh ? '任务收件箱' : 'Task inbox' }}</strong><span>{{ items.length }} {{ zh ? '项已接收' : 'received' }}</span></div><div v-for="(item, index) in items" :key="index" class="preview-task-row" data-preview-item><span class="preview-received-dot" aria-hidden="true" /><strong>{{ text(item) }}</strong><small>{{ zh ? '已接收' : 'Received' }}</small></div><p v-if="!items.length" class="preview-empty">{{ zh ? '任务将逐项出现在这里' : 'Tasks appear here as they arrive' }}</p></div>

      <div v-else-if="kind === 'logs'" class="preview-log-window"><div><span class="preview-terminal-dots" aria-hidden="true">● ● ●</span><span>{{ zh ? '最近 3 条日志' : 'Latest 3 log entries' }}</span></div><ol><li v-for="item in items" :key="text(item)" data-preview-item><span>INFO</span><code>{{ text(item) }}</code></li></ol><p v-if="!items.length" class="preview-empty">{{ zh ? '等待日志…' : 'Waiting for logs…' }}</p><span class="preview-log-footer">{{ items.length }}/3 {{ zh ? '条可见' : 'visible' }}</span></div>

      <div v-else-if="kind === 'timeline'" class="preview-timeline"><strong class="preview-list-heading">{{ zh ? 'Agent 活动时间线' : 'Agent activity' }}</strong><div v-for="(event, index) in events" :key="index" class="preview-timeline-row" data-preview-item><span class="preview-event-dot" aria-hidden="true"/><div><span class="preview-event-type">{{ text(event.type) }}</span><p>{{ text(event.text) || text(event.name) }}</p></div><small>{{ String(index + 1).padStart(2, '0') }}</small></div><p v-if="!events.length" class="preview-empty">{{ zh ? '等待 Agent 事件…' : 'Waiting for agent events…' }}</p></div>

      <div v-else-if="kind === 'tools'" class="preview-tool-list"><div class="preview-list-heading"><strong>{{ zh ? '工具调用' : 'Tool calls' }}</strong><span>{{ events.length }}</span></div><div v-for="(event, index) in events" :key="index" class="preview-tool-card" data-preview-item><span class="preview-symbol" aria-hidden="true">⌘</span><div><strong>{{ text(event.name) }}</strong><small>tool_call</small></div><span class="preview-tag">{{ zh ? '已接收' : 'Received' }}</span></div><p v-if="!events.length" class="preview-empty">{{ zh ? '等待工具调用，其他事件不会出现在这里' : 'Waiting for tool calls; other events stay out of this view' }}</p></div>

      <div v-else-if="kind === 'steps'" class="preview-step-list"><span class="preview-eyebrow">{{ zh ? '逐步到达的结果' : 'RESULTS AS THEY ARRIVE' }}</span><div v-for="(chunk, index) in received" :key="index" class="preview-step" data-preview-item><span>{{ index + 1 }}</span><code>{{ chunk.replace(/^→\s*/, '') }}</code><small>✓</small></div><p v-if="!received.length" class="preview-empty">{{ zh ? '等待第一个阶段…' : 'Waiting for the first stage…' }}</p></div>

      <div v-else-if="kind === 'merge'" class="preview-merge"><span class="preview-eyebrow">{{ zh ? '并行输入，统一输出' : 'PARALLEL SOURCES. ONE OUTPUT.' }}</span><div v-for="lane in ['A', 'B']" :key="lane" class="preview-source-lane"><strong>{{ zh ? '数据源' : 'Source' }} {{ lane }}</strong><span v-for="(chunk, index) in received.filter(item => item.startsWith(lane))" :key="index" :class="['preview-chunk', `lane-${lane}`]">{{ chunk }}</span></div><div class="preview-merge-arrow" aria-hidden="true">↓</div><div class="preview-arrival-order"><span v-for="(chunk, index) in received" :key="index" :class="['preview-chunk', `lane-${chunk[0]}`]" data-preview-item>{{ chunk }}</span><span v-if="!received.length" class="preview-muted">{{ zh ? '等待输入…' : 'Waiting for input…' }}</span></div><p class="preview-footnote">{{ zh ? '下方顺序即实际数据到达顺序' : 'The lower row preserves the actual arrival order' }}</p></div>

      <div v-else-if="kind === 'race'" class="preview-race"><span class="preview-eyebrow">{{ zh ? '最先返回数据的来源胜出' : 'FIRST RESPONSE WINS' }}</span><div class="preview-race-sources"><div v-for="source in ['Fast', 'Slow']" :key="source" :class="{ chosen: sourceSelected(source) }"><span aria-hidden="true">{{ sourceSelected(source) ? '✓' : '○' }}</span><strong>{{ source }} source</strong><small>{{ value ? (sourceSelected(source) ? (zh ? '已选中' : 'Selected') : (zh ? '未选中' : 'Not selected')) : (zh ? '等待首个数据块' : 'Waiting for first chunk') }}</small></div></div><p class="preview-race-result">{{ text(value) || '…' }}</p></div>

      <div v-else-if="kind === 'search'" class="preview-search"><span class="preview-eyebrow">{{ zh ? '只显示最新查询的结果' : 'ONLY THE LATEST QUERY RESULT' }}</span><div class="preview-search-query"><span aria-hidden="true">⌕</span><span>qo → qore</span><small>{{ zh ? '示例输入' : 'Example inputs' }}</small></div><div v-if="value" class="preview-search-result"><span class="preview-symbol" aria-hidden="true">↗</span><div><strong>{{ text(value) }}</strong><p>{{ zh ? '只展示最新查询返回的内容' : 'Only the latest query result is displayed' }}</p></div></div><p v-else class="preview-empty">{{ zh ? '等待最新查询结果…' : 'Waiting for the latest query result…' }}</p></div>

      <div v-else-if="kind === 'retry'" class="preview-retry"><span class="preview-connection-icon" :class="{ connected: status === 'completed' }" aria-hidden="true">{{ status === 'completed' ? '✓' : '↻' }}</span><h3>{{ status === 'completed' ? (zh ? '连接已恢复' : 'Connection recovered') : status === 'aborted' ? (zh ? '重试已停止' : 'Retry stopped') : (zh ? '正在尝试恢复连接' : 'Trying to reconnect') }}</h3><p>{{ text(value) || (zh ? '等待重试结果…' : 'Waiting for the retry result…') }}</p></div>

      <div v-else-if="kind === 'paced'" class="preview-paced"><span class="preview-eyebrow">{{ zh ? '按节奏接收数据' : 'PACED DELIVERY' }}</span><div class="preview-chunk-slots"><span v-for="index in 5" :key="index" :class="{ filled: received.length >= index }" :data-preview-item="received.length >= index ? '' : undefined">{{ received[index - 1] || '·' }}</span></div><p class="preview-footnote">{{ received.length }} / 5 {{ zh ? '个数据块已接收' : 'chunks received' }}</p><div class="preview-paced-output">{{ text(value) || '…' }}</div></div>
    </div>
  </div>
</template>
