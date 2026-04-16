<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stars = ref(1250)
const downloads = ref(15000)
const discordMembers = ref(800)
const contributors = ref(45)

const isVisible = ref(false)

onMounted(async () => {
  isVisible.value = true
  
  // Animate numbers
  const animateNumber = (target: number, duration: 2000) => {
    const start = 0
    const startTime = performance.now()
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      return Math.floor(start + (target - start) * easeOutQuart)
    }
    
    return { update }
  }
  
  try {
    const res = await fetch('https://api.github.com/repos/qorejs/qore')
    const data = await res.json()
    stars.value = data.stargazers_count || 1250
  } catch {
    stars.value = 1250
  }
})

const codeLines = [
  { text: `<span class="keyword">import</span> { signal, computed } <span class="keyword">from</span> <span class="string">'@qorejs/qore'</span>`, delay: 0 },
  { text: ``, delay: 0.2 },
  { text: `<span class="comment">// AI 生成响应式组件</span>`, delay: 0.4 },
  { text: `<span class="keyword">const</span> App = <span class="function">component</span>(() => {`, delay: 0.6 },
  { text: `  <span class="keyword">const</span> count = <span class="function">signal</span>(<span class="number">0</span>)`, delay: 0.8 },
  { text: `  <span class="keyword">return</span> <span class="tag">&lt;button</span> onClick={() => count.<span class="function">set</span>(count() + <span class="number">1</span>)}<span class="tag">&gt;</span>`, delay: 1 },
  { text: `    Count: {count()}`, delay: 1.2 },
  { text: `  <span class="tag">&lt;/button&gt;</span>`, delay: 1.4 },
  { text: `})`, delay: 1.6 },
]

const features = [
  {
    icon: '⚡',
    title: '极致性能',
    desc: '5KB 核心库，0.3ms 渲染时间，比 React 快 10 倍',
    link: '/guide/reactivity',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: '🤖',
    title: 'AI Native',
    desc: '原生支持流式 AI 响应，智能代码生成，自动性能优化',
    link: '/guide/ai-native',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '🌊',
    title: '流式渲染',
    desc: '原生 Streaming SSR，首屏加载速度提升 10 倍',
    link: '/guide/streaming',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '🎯',
    title: '简洁 API',
    desc: '3 行代码创建组件，完整的 TypeScript 支持',
    link: '/guide/quick-start',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '📦',
    title: '轻量级',
    desc: '零依赖，5KB gzipped，移动端友好',
    link: '/guide/introduction',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🔧',
    title: '开发体验',
    desc: '毫秒级 HMR，智能错误提示，完善的开发工具',
    link: '/guide/getting-started',
    gradient: 'from-blue-500 to-indigo-500',
  },
]

const stats = [
  { icon: '📦', value: '5KB', label: 'Bundle Size' },
  { icon: '⚡', value: '0.3ms', label: 'Render Time' },
  { icon: '🚀', value: '10x', label: 'Faster than React' },
  { icon: '🧪', value: '200+', label: 'Tests' },
]
</script>

<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="hero-background">
      <div class="neural-network">
        <svg class="neural-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
              <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:0.2" />
              <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.1" />
            </linearGradient>
          </defs>
          <circle class="neural-node" cx="100" cy="100" r="3" />
          <circle class="neural-node" cx="300" cy="150" r="3" />
          <circle class="neural-node" cx="500" cy="80" r="3" />
          <circle class="neural-node" cx="700" cy="200" r="3" />
          <circle class="neural-node" cx="900" cy="120" r="3" />
          <circle class="neural-node" cx="200" cy="300" r="3" />
          <circle class="neural-node" cx="400" cy="350" r="3" />
          <circle class="neural-node" cx="600" cy="280" r="3" />
          <circle class="neural-node" cx="800" cy="320" r="3" />
          <circle class="neural-node" cx="150" cy="500" r="3" />
          <circle class="neural-node" cx="350" cy="450" r="3" />
          <circle class="neural-node" cx="550" cy="480" r="3" />
          <circle class="neural-node" cx="750" cy="420" r="3" />
          <circle class="neural-node" cx="950" cy="500" r="3" />
          
          <line class="neural-line" x1="100" y1="100" x2="300" y2="150" />
          <line class="neural-line" x1="300" y1="150" x2="500" y2="80" />
          <line class="neural-line" x1="500" y1="80" x2="700" y2="200" />
          <line class="neural-line" x1="700" y1="200" x2="900" y2="120" />
          <line class="neural-line" x1="200" y1="300" x2="400" y2="350" />
          <line class="neural-line" x1="400" y1="350" x2="600" y2="280" />
          <line class="neural-line" x1="600" y1="280" x2="800" y2="320" />
          <line class="neural-line" x1="150" y1="500" x2="350" y2="450" />
          <line class="neural-line" x1="350" y1="450" x2="550" y2="480" />
          <line class="neural-line" x1="550" y1="480" x2="750" y2="420" />
          <line class="neural-line" x1="750" y1="420" x2="950" y2="500" />
        </svg>
      </div>
      <div class="cyber-grid"></div>
      <div class="floating-particles">
        <div class="particle" v-for="i in 30" :key="i" :style="`--i: ${i}`"></div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <!-- AI Badge -->
        <div class="hero-badge" :class="{ 'badge-visible': isVisible }">
          <span class="badge-pulse"></span>
          <span class="badge-icon">🤖</span>
          <span class="badge-text">AI-Native Framework</span>
        </div>
        
        <!-- Main Title -->
        <h1 class="hero-title" :class="{ 'title-visible': isVisible }">
          <div class="title-container">
            <span class="gradient-text glitch" data-text="Qore">Qore</span>
            <span class="ai-cursor">_</span>
          </div>
          <span class="subtitle">
            <span class="subtitle-line">The Core of</span>
            <span class="subtitle-line highlight">AI Era UI</span>
          </span>
        </h1>
        
        <!-- Tagline -->
        <p class="hero-tagline" :class="{ 'tagline-visible': isVisible }">
          <span class="tagline-text">细粒度响应式</span>
          <span class="tagline-separator">⚡</span>
          <span class="tagline-text">流式渲染</span>
          <span class="tagline-separator">🚀</span>
          <span class="tagline-text highlight">为 AI 应用而生</span>
        </p>
        
        <!-- Actions -->
        <div class="hero-actions" :class="{ 'actions-visible': isVisible }">
          <a href="/guide/quick-start.html" class="btn btn-primary btn-cyber">
            <span class="btn-cyber-border"></span>
            <span class="btn-icon">🚀</span>
            <span>快速开始</span>
          </a>
          <a href="/examples/basic.html" class="btn btn-hologram">
            <span class="btn-icon">💡</span>
            <span>查看示例</span>
          </a>
          <a href="https://github.com/qorejs/qore" target="_blank" class="btn btn-ghost btn-neon">
            <span class="btn-icon">⭐</span>
            <span>{{ stars }}+ Stars</span>
          </a>
        </div>
        
        <!-- Stats -->
        <div class="hero-stats" :class="{ 'stats-visible': isVisible }">
          <div class="stat-card" v-for="(stat, index) in stats" :key="index" :style="`transition-delay: ${index * 100}ms`">
            <div class="stat-hologram"></div>
            <span class="stat-icon">{{ stat.icon }}</span>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- AI Code Terminal -->
      <div class="hero-code" :class="{ 'code-visible': isVisible }">
        <div class="ai-terminal">
          <div class="terminal-header">
            <div class="terminal-controls">
              <span class="terminal-dot red"></span>
              <span class="terminal-dot yellow"></span>
              <span class="terminal-dot green"></span>
            </div>
            <div class="terminal-title">
              <span class="terminal-icon">🤖</span>
              <span>AI Code Generation</span>
            </div>
            <div class="terminal-status">
              <span class="status-dot"></span>
              <span>Live</span>
            </div>
          </div>
          <div class="terminal-body">
            <div class="code-lines">
              <div 
                v-for="(line, index) in codeLines" 
                :key="index" 
                class="code-line"
                :style="`--delay: ${line.delay}s`"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content" v-html="line.text"></span>
              </div>
            </div>
            <div class="typing-cursor">_</div>
          </div>
          <div class="terminal-glow"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <div class="header-badge">
            <span class="badge-icon">✨</span>
            <span>Powerful Features</span>
          </div>
          <h2 class="section-title">核心特性</h2>
          <p class="section-desc">为 AI 时代打造的高性能前端框架</p>
        </div>
        
        <div class="features-grid">
          <a 
            v-for="(feature, index) in features" 
            :key="index"
            :href="feature.link"
            class="feature-card"
            :style="`transition-delay: ${index * 80}ms`"
          >
            <div class="feature-icon-wrapper">
              <div class="feature-icon-bg" :class="feature.gradient"></div>
              <span class="feature-icon">{{ feature.icon }}</span>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <div class="feature-link">
              <span>了解更多</span>
              <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div class="card-glow"></div>
          </a>
        </div>
        
        <div class="features-cta">
          <a href="/guide/introduction.html" class="cta-link">
            <span>探索所有特性</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================
   Home Page - Premium AI Theme
   ============================================ */

.home-page {
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
  min-height: 100vh;
  color: #f1f5f9;
}

/* Animated Background */
.hero-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.neural-network {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.neural-svg {
  width: 100%;
  height: 100%;
}

.neural-node {
  fill: #6366f1;
  animation: nodePulse 3s ease-in-out infinite;
}

.neural-node:nth-child(odd) {
  animation-delay: 0.5s;
}

.neural-line {
  stroke: rgba(99, 102, 241, 0.3);
  stroke-width: 1;
  stroke-dasharray: 10;
  animation: lineFlow 20s linear infinite;
}

.cyber-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  border-radius: 50%;
  left: calc(var(--i) * 3.33%);
  top: calc(var(--i) * 3.33%);
  animation: particleFloat 15s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.5s);
  opacity: 0.6;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 8rem 4rem 4rem;
  max-width: 1600px;
  margin: 0 auto;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  width: fit-content;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.badge-visible {
  opacity: 1;
  transform: translateY(0);
}

.badge-pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.badge-icon {
  font-size: 1rem;
}

.badge-text {
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Title */
.hero-title {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.2s;
}

.title-visible {
  opacity: 1;
  transform: translateY(0);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gradient-text {
  font-size: 5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.glitch::before {
  animation: glitch-1 2s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-2px, -2px);
  opacity: 0.5;
}

.glitch::after {
  animation: glitch-2 3s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  transform: translate(2px, 2px);
  opacity: 0.5;
}

.ai-cursor {
  font-size: 5rem;
  color: #6366f1;
  animation: cursorBlink 1s step-end infinite;
}

.subtitle {
  display: block;
  font-size: 2rem;
  color: #94a3b8;
  margin-top: 1rem;
}

.subtitle-line {
  display: block;
}

.subtitle-line.highlight {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

/* Tagline */
.hero-tagline {
  font-size: 1.25rem;
  color: #cbd5e1;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.4s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tagline-visible {
  opacity: 1;
  transform: translateY(0);
}

.tagline-text.highlight {
  color: #6366f1;
  font-weight: 600;
}

/* Actions */
.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.6s;
}

.actions-visible {
  opacity: 1;
  transform: translateY(0);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
}

.btn-cyber {
  border: 1px solid rgba(99, 102, 241, 0.5);
}

.btn-cyber-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.btn-hologram {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  backdrop-filter: blur(10px);
}

.btn-hologram:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
}

.btn-ghost:hover {
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
}

/* Stats */
.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.8s;
}

.stats-visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-card {
  position: relative;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  text-align: center;
  overflow: hidden;
}

.stat-hologram {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-hologram {
  opacity: 1;
}

.stat-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Code Terminal */
.hero-code {
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s ease 0.6s;
}

.code-visible {
  opacity: 1;
  transform: translateX(0);
}

.ai-terminal {
  background: rgba(13, 17, 23, 0.9);
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(22, 27, 34, 0.8);
  border-bottom: 1px solid rgba(240, 246, 252, 0.1);
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dot.red { background: #ff5f56; }
.terminal-dot.yellow { background: #ffbd2e; }
.terminal-dot.green { background: #27c93f; }

.terminal-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b949e;
  font-size: 0.875rem;
}

.terminal-icon {
  font-size: 1rem;
}

.terminal-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.terminal-body {
  padding: 1.5rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  color: #a9b1d6;
  min-height: 280px;
  position: relative;
}

/* Code Syntax Highlighting - One Dark Pro inspired */
.code-line .keyword { color: #c678dd; }
.code-line .string { color: #98c379; }
.code-line .comment { color: #5c6370; font-style: italic; }
.code-line .function { color: #61afef; }
.code-line .number { color: #d19a66; }
.code-line .tag { color: #e06c75; }

.code-lines {
  position: relative;
}

.code-line {
  opacity: 0;
  transform: translateX(10px);
  animation: codeType 0.5s ease forwards;
  animation-delay: var(--delay);
  display: flex;
  gap: 1rem;
}

.line-number {
  color: #484f58;
  user-select: none;
  min-width: 2rem;
  text-align: right;
}

.typing-cursor {
  position: absolute;
  bottom: 1.5rem;
  left: 3.5rem;
  color: #6366f1;
  animation: cursorBlink 1s step-end infinite;
}

.terminal-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(99, 102, 241, 0.1), transparent);
  pointer-events: none;
}

/* Features Section */
.features-section {
  position: relative;
  z-index: 1;
  padding: 6rem 4rem;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  margin-bottom: 1.5rem;
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 500;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  color: #f1f5f9;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 1.25rem;
  color: #94a3b8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  position: relative;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  text-decoration: none;
  transition: all 0.4s ease;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.feature-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  opacity: 0.2;
}

.feature-icon-bg.from-indigo-500 to-purple-500 {
  background: linear-gradient(135deg, #6366f1, #a855f7);
}

.feature-icon-bg.from-purple-500 to-pink-500 {
  background: linear-gradient(135deg, #a855f7, #ec4899);
}

.feature-icon-bg.from-cyan-500 to-blue-500 {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
}

.feature-icon-bg.from-orange-500 to-red-500 {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.feature-icon-bg.from-emerald-500 to-teal-500 {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}

.feature-icon-bg.from-blue-500 to-indigo-500 {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.feature-icon {
  position: relative;
  font-size: 2rem;
  z-index: 1;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.75rem;
}

.feature-desc {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  font-weight: 600;
  font-size: 0.875rem;
}

.feature-link .arrow {
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-link .arrow {
  transform: translateX(4px);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.1), transparent 40%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.features-cta {
  text-align: center;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  font-weight: 600;
  font-size: 1.125rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-link:hover {
  color: #8b5cf6;
}

.cta-link svg {
  transition: transform 0.3s ease;
}

.cta-link:hover svg {
  transform: translateX(4px);
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes nodePulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes lineFlow {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
  50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
}

@keyframes codeType {
  0% { opacity: 0; transform: translateX(10px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-code {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 6rem 2rem 3rem;
  }
  
  .gradient-text,
  .ai-cursor {
    font-size: 3rem;
  }
  
  .subtitle {
    font-size: 1.5rem;
  }
  
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>
