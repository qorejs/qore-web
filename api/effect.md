# Effect API

Effect 用于处理副作用，自动追踪依赖并在依赖变化时重新执行。Effect 是响应式系统与世界交互的桥梁。

## 函数签名

```typescript
function effect(
  fn: () => void | (() => void),
  options?: EffectOptions
): () => void
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fn` | `() => void \| () => () => void` | 是 | 副作用函数。可以返回一个清理函数 |
| `options` | `EffectOptions` | 否 | 配置选项（见下表） |

### EffectOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `immediate` | `boolean` | `true` | 是否立即执行一次 |
| `scheduler` | `(fn: () => void) => void` | - | 自定义调度器 |

### 返回值

返回一个清理函数，调用它会停止 Effect 并执行清理逻辑。

---

## 基础用法

### 创建 Effect

```typescript
import { signal, effect } from 'qore'

const count = signal(0)

// effect 会自动追踪 count 的变化
effect(() => {
  console.log(`Count is: ${count()}`)
})

count.set(1) // 输出: Count is: 1
count.set(2) // 输出: Count is: 2
```

### 清理函数

Effect 函数可以返回一个清理函数，在下次执行前或 Effect 停止时调用：

```typescript
import { signal, effect } from 'qore'

const userId = signal(1)

effect(() => {
  // 订阅用户更新
  const subscription = subscribeToUser(userId(), (user) => {
    console.log('User updated:', user)
  })
  
  // 返回清理函数
  return () => {
    subscription.unsubscribe()
    console.log('Cleanup for user:', userId())
  }
})

// 切换用户时，会自动清理旧的订阅
userId.set(2)
// 输出:
// Cleanup for user: 1
// (新的订阅开始)
```

### 停止 Effect

```typescript
import { signal, effect } from 'qore'

const count = signal(0)

// 获取停止函数
const stop = effect(() => {
  console.log(`Count: ${count()}`)
})

count.set(1) // 输出: Count: 1

// 停止 effect
stop()

count.set(2) // 无输出（effect 已停止）
```

---

## 高级用法

### 条件 Effect

```typescript
import { signal, effect } from 'qore'

const isActive = signal(true)
const count = signal(0)

effect(() => {
  if (isActive()) {
    console.log(`Active count: ${count()}`)
  }
})

count.set(1) // 输出: Active count: 1
isActive.set(false)
count.set(2) // 无输出（条件不满足）
```

### 多个依赖

```typescript
import { signal, effect } from 'qore'

const firstName = signal('John')
const lastName = signal('Doe')

effect(() => {
  const fullName = `${firstName()} ${lastName()}`
  console.log('Full name changed:', fullName)
  updateDocumentTitle(fullName)
})

firstName.set('Jane') // 输出: Full name changed: Jane Doe
```

### 异步 Effect

::: warning 注意
Effect 函数本身不能是 async，但可以在内部处理异步操作。
:::

```typescript
import { signal, effect } from 'qore'

const userId = signal(1)
const userData = signal(null)

effect(() => {
  const id = userId()
  
  // 使用 IIFE 处理异步
  ;(async () => {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      userData.set(data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  })()
})
```

### 防抖 Effect

```typescript
import { signal, effect } from 'qore'

const searchQuery = signal('')

// 自定义防抖调度器
const debounce = (fn: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(fn, delay)
  }
}

effect(() => {
  console.log('Searching for:', searchQuery())
  // 执行搜索 API 调用
}, {
  scheduler: (fn) => debounce(fn, 300)
})
```

---

## 类型定义

```typescript
interface EffectOptions {
  // 是否立即执行一次
  immediate?: boolean
  
  // 自定义调度器
  scheduler?: (fn: () => void) => void
}

type EffectCleanup = () => void

function effect(
  fn: () => void | EffectCleanup,
  options?: EffectOptions
): () => void
```

---

## 使用场景

### 1. DOM 操作

```typescript
import { component, signal, effect } from 'qore'

const Title = component(() => {
  const title = signal('My App')
  
  // 同步到 document.title
  effect(() => {
    document.title = title()
  })
  
  return () => `<h1>${title()}</h1>`
})
```

### 2. 本地存储同步

```typescript
import { signal, effect } from 'qore'

const theme = signal<'light' | 'dark'>('light')

// 保存到 localStorage
effect(() => {
  localStorage.setItem('theme', theme())
})

// 从 localStorage 加载
const saved = localStorage.getItem('theme')
if (saved) {
  theme.set(saved as 'light' | 'dark')
}
```

### 3. API 订阅

```typescript
import { signal, effect } from 'qore'

const channelId = signal('general')
const messages = signal([])

effect(() => {
  const id = channelId()
  
  // 取消之前的订阅
  const unsubscribe = subscribeToChannel(id, (msg) => {
    messages.update(m => [...m, msg])
  })
  
  // 清理函数
  return () => {
    unsubscribe()
    messages.set([]) // 清空消息
  }
})
```

### 4. 动画和定时器

```typescript
import { signal, effect } from 'qore'

const isPlaying = signal(false)
const progress = signal(0)

effect(() => {
  if (isPlaying()) {
    const intervalId = setInterval(() => {
      progress.update(p => (p >= 100 ? 0 : p + 1))
    }, 100)
    
    // 清理定时器
    return () => clearInterval(intervalId)
  }
})
```

### 5. 日志和监控

```typescript
import { signal, effect } from 'qore'

const errorCount = signal(0)
const lastError = signal(null)

// 错误监控
effect(() => {
  if (errorCount() > 0) {
    console.warn(`Error count: ${errorCount()}`)
    console.warn(`Last error: ${lastError()}`)
    
    // 发送到监控服务
    sendToMonitoring({
      count: errorCount(),
      lastError: lastError(),
      timestamp: Date.now()
    })
  }
})
```

---

## 生命周期集成

### 在组件中使用

```typescript
import { component, signal, effect, onUnmount } from 'qore'

const DataFetcher = component(() => {
  const data = signal(null)
  const loading = signal(false)
  
  const fetchData = async () => {
    loading.set(true)
    try {
      const response = await fetch('/api/data')
      data.set(await response.json())
    } finally {
      loading.set(false)
    }
  }
  
  // 组件挂载时获取数据
  effect(() => {
    fetchData()
  })
  
  // 组件卸载时清理
  onUnmount(() => {
    console.log('Component unmounted, cleaning up...')
  })
  
  return () => `
    <div>
      ${loading() ? 'Loading...' : data() ? JSON.stringify(data()) : 'No data'}
    </div>
  `
})
```

### onMount 和 onUnmount

```typescript
import { component, signal, onMount, onUnmount } from 'qore'

const Timer = component(() => {
  const seconds = signal(0)
  let intervalId: number
  
  onMount(() => {
    console.log('Timer mounted')
    intervalId = setInterval(() => {
      seconds.update(s => s + 1)
    }, 1000)
  })
  
  onUnmount(() => {
    console.log('Timer unmounted')
    clearInterval(intervalId)
  })
  
  return () => `<div>Elapsed: ${seconds()}s</div>`
})
```

---

## 性能优化

### 避免不必要的 Effect

```typescript
import { signal, effect } from 'qore'

const data = signal({ count: 0, name: 'Qore' })

// ❌ 不推荐 - 任何属性变化都会触发
effect(() => {
  console.log('Count:', data().count)
})

// ✅ 推荐 - 只追踪需要的属性
const count = signal(0)
effect(() => {
  console.log('Count:', count())
})
```

### 使用 peek() 避免追踪

```typescript
import { signal, effect } from 'qore'

const count = signal(0)
const logs = signal<string[]>([])

effect(() => {
  // 读取 count 但不建立依赖
  const currentCount = count.peek()
  logs.update(l => [...l, `Log at count ${currentCount}`])
})

count.set(1) // 不会触发 effect 重新执行
```

### 批处理更新

```typescript
import { signal, effect, batch } from 'qore'

const a = signal(0)
const b = signal(0)
const sum = signal(0)

effect(() => {
  console.log('Sum updated:', sum())
})

// ❌ 会触发两次 effect
a.set(1)
b.set(2)
sum.set(a() + b())

// ✅ 只触发一次 effect
batch(() => {
  a.set(1)
  b.set(2)
  sum.set(a() + b())
})
```

---

## 与 Computed 配合

```typescript
import { signal, computed, effect } from 'qore'

const price = signal(100)
const quantity = signal(2)

// computed 计算派生值
const total = computed(() => price() * quantity())

// effect 处理副作用
effect(() => {
  console.log('Total:', total())
  updateCartDisplay(total())
})

price.set(150) // 输出: Total: 300
```

---

## 错误处理

```typescript
import { signal, effect } from 'qore'

const data = signal([])

effect(() => {
  try {
    const result = processData(data())
    console.log('Processed:', result)
  } catch (error) {
    console.error('Effect error:', error)
    // 错误不会阻止 effect 继续追踪依赖
  }
})
```

### 错误恢复

```typescript
import { signal, effect } from 'qore'

const url = signal('/api/data')
const error = signal(null)

effect(() => {
  try {
    fetch(url())
      .then(res => res.json())
      .then(data => {
        error.set(null)
        // 处理数据
      })
      .catch(err => error.set(err.message))
  } catch (e) {
    error.set(e.message)
  }
})
```

---

## 常见问题

### Q: Effect 和 Computed 有什么区别？

A: Computed 用于计算派生值（返回一个值），Effect 用于处理副作用（不返回值，执行操作）。

### Q: Effect 什么时候执行？

A: 创建时立即执行一次，然后每次依赖变化时重新执行。

### Q: 如何停止 Effect？

A: 调用 effect() 返回的函数会停止 Effect 并执行清理逻辑。

### Q: Effect 可以是异步的吗？

A: Effect 函数本身不能是 async，但可以在内部使用 async/await 或 Promise。

### Q: 清理函数什么时候执行？

A: 在 Effect 重新执行前和 Effect 被停止时执行。

---

## 相关资源

- [Signal API](/api/signal) - 创建响应式状态
- [Computed API](/api/computed) - 创建派生状态
- [响应式系统指南](/guide/reactivity)
- [组件系统指南](/guide/components)
