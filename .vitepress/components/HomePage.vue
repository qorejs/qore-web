<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { h, mount, stream, text } from '@qorejs/qore'

const qoreRoot = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let disposeQore: (() => Element) | null = null

const qoreCode = `import { h, stream, text } from '@qorejs/qore'

const answer = stream(openAI.chat('hello'))

export function App() {
  return h('main', {},
    text(() => answer())
  )
}`

const reactCode = `const { messages, input, handleInputChange } = useChat()

return messages.map(message => (
  <Markdown key={message.id}>
    {message.content}
  </Markdown>
))`

const streamTokens = [
  'Token arrives. ',
  'Signal updates. ',
  'Text node paints. ',
  'The UI keeps flowing.'
]

const pillars = [
  ['stream = signal', 'AI output is reactive state from the first byte.'],
  ['Token-level UI', 'Only the dependent text node updates while tokens arrive.'],
  ['Provider-ready', 'OpenAI, Anthropic, and generic SSE adapters fit one primitive.']
]

onMounted(() => {
  isVisible.value = true

  if (!qoreRoot.value) {
    return
  }

  const answer = stream.paced(streamTokens, 42)

  disposeQore = mount(qoreRoot.value, () => h('section', { class: 'runtime-shell' },
    h('div', { class: 'runtime-topline' },
      h('span', { class: 'runtime-dot' }),
      h('span', {}, 'Qore runtime demo')
    ),
    h('pre', { class: 'runtime-output' }, text(() => answer() || 'waiting for the first token...')),
    h('div', { class: 'runtime-meta' }, text(() => {
      const status = answer.status()
      const chunks = answer.chunkCount()
      const buffered = answer.buffered()
      return `${status} / ${chunks} chunks / ${buffered} buffered`
    }))
  ))
})

onBeforeUnmount(() => {
  disposeQore?.()
  disposeQore = null
})
</script>

<template>
  <main class="home-page" :class="{ visible: isVisible }">
    <section class="hero-section">
      <div class="aurora aurora-one"></div>
      <div class="aurora aurora-two"></div>
      <div class="hero-copy">
        <p class="eyebrow">Streaming Response Framework</p>
        <h1>Qore</h1>
        <p class="tagline">让数据像水流一样自然地流进 UI。</p>
        <p class="summary">stream 是数据流动的方式，signal 是 UI 响应变化的方式。Qore 把它们变成同一个 primitive。</p>
        <div class="actions">
          <a class="primary-action" href="/guide/quick-start.html">快速开始</a>
          <a class="secondary-action" href="/guide/streaming.html">看流式响应</a>
          <a class="secondary-action" href="https://github.com/qorejs/qore" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <div class="demo-card">
        <div class="card-label">Live primitive</div>
        <div ref="qoreRoot" class="qore-root"></div>
      </div>
    </section>

    <section class="pillars-section" aria-label="Qore pillars">
      <a v-for="pillar in pillars" :key="pillar[0]" class="pillar-card" href="/guide/streaming.html">
        <span>{{ pillar[0] }}</span>
        <p>{{ pillar[1] }}</p>
      </a>
    </section>

    <section class="compare-section">
      <div class="compare-copy">
        <p class="eyebrow">The point</p>
        <h2>不是把 token 搬进状态，而是让 token 自己成为状态。</h2>
        <p>一个 AI 聊天页最核心的代码，只需要声明数据流和视图依赖。</p>
      </div>
      <div class="code-grid">
        <article class="code-card featured-code">
          <div class="code-title">Qore</div>
          <pre><code>{{ qoreCode }}</code></pre>
        </article>
        <article class="code-card muted-code">
          <div class="code-title">Typical chat UI</div>
          <pre><code>{{ reactCode }}</code></pre>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.VPContent.is-home) {
  padding-top: 0;
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

:global(.VPNavBar.has-sidebar .content) {
  border-bottom: none;
}

.home-page {
  --qore-bg: #07110f;
  --qore-panel: rgba(239, 255, 244, 0.08);
  --qore-panel-strong: rgba(239, 255, 244, 0.13);
  --qore-line: rgba(183, 255, 214, 0.2);
  --qore-text: #f3fff7;
  --qore-muted: rgba(243, 255, 247, 0.68);
  --qore-accent: #8fffc1;
  --qore-cyan: #74f7ff;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  box-sizing: border-box;
  width: 100vw;
  max-width: 100%;
  margin-top: -64px;
  padding: 118px clamp(22px, 4vw, 76px) 96px;
  color: var(--qore-text);
  background:
    radial-gradient(circle at 10% 8%, rgba(116, 247, 255, 0.22), transparent 28%),
    radial-gradient(circle at 92% 18%, rgba(143, 255, 193, 0.22), transparent 30%),
    radial-gradient(circle at 48% 110%, rgba(30, 230, 168, 0.14), transparent 34%),
    linear-gradient(135deg, #06100f 0%, #0b1d19 48%, #020605 100%);
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
  grid-template-columns: minmax(0, 0.95fr) minmax(380px, 0.82fr);
  gap: clamp(32px, 5vw, 92px);
  align-items: center;
  min-height: clamp(600px, calc(100vh - 74px), 740px);
}

.hero-copy {
  display: grid;
  gap: 22px;
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

h1,
h2,
.tagline,
.summary {
  margin: 0;
}

h1 {
  font: 900 clamp(76px, 13vw, 170px)/0.82 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  letter-spacing: -0.12em;
  color: transparent;
  background: linear-gradient(110deg, #ffffff 0%, #b4ffd5 48%, #73f7ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 54px rgba(143, 255, 193, 0.3);
}

.tagline {
  max-width: 760px;
  font-size: clamp(28px, 3.5vw, 52px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.06em;
}

.summary,
.compare-copy p,
.pillar-card p {
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
.pillar-card:hover {
  transform: translateY(-2px);
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
  align-self: center;
  justify-self: stretch;
  min-height: 440px;
  max-width: 680px;
  padding: clamp(16px, 2vw, 26px);
  border-radius: 34px;
  transform: rotate(0.35deg);
}

.qore-root {
  height: calc(100% - 24px);
  margin-top: 14px;
}

:deep(.runtime-shell) {
  display: grid;
  gap: 18px;
  height: 100%;
  min-height: 372px;
  padding: clamp(20px, 2.6vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(5, 24, 19, 0.94), rgba(3, 8, 8, 0.98)),
    radial-gradient(circle at 20% 20%, rgba(143, 255, 193, 0.22), transparent 36%);
  border: 1px solid rgba(143, 255, 193, 0.2);
}

:deep(.runtime-topline) {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--qore-muted);
  font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

:deep(.runtime-dot) {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--qore-accent);
  box-shadow: 0 0 24px var(--qore-accent);
}

:deep(.runtime-output) {
  min-height: 186px;
  margin: 0;
  white-space: pre-wrap;
  color: #eafff1;
  font: 700 clamp(22px, 2.65vw, 40px)/1.22 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
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

@media (max-width: 920px) {
  .home-page {
    margin-top: -56px;
    padding: 112px 18px 64px;
  }

  .hero-section,
  .compare-section,
  .pillars-section {
    grid-template-columns: 1fr;
  }

  .hero-section {
    min-height: auto;
  }

  .demo-card {
    min-height: 340px;
    transform: none;
  }

  :deep(.runtime-shell) {
    min-height: 292px;
  }

  :deep(.runtime-output) {
    min-height: 132px;
  }
}
</style>
