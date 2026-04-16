# Batch API

Batch 用于批量更新多个 Signal，避免中间状态触发多次重新计算。这是性能优化的重要工具。

## 函数签名

```typescript
function batch<T>(fn: () => T): T
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fn` | `() => T` | 是 | 包含多个 Signal 更新的函数 |

### 返回值

返回 `fn` 函数的执行结果。

---

## 为什么需要 Batch？

在 Qore 的响应式系统中，每次 Signal 更新都会触发依赖的重新计算。当需要更新多个相关的 Signal 时，这可能导致：

1. **多次不必要的重新计算**
2. **中间状态暴露给 Effect 和 Computed**
3. **性能浪费**

### 问题示例

```typescript
import { signal, computed, effect } from 'qore'

const firstName = signal('')
const lastName = signal('')

const fullName = computed(() => {
  console.log('Computing fullName...')
  return `${firstName()} ${lastName()}`
})

effect(() => {
  console.log('Full name changed:', fullName())
})

// ❌ 问题：会触发两次计算
firstName.set('John')  // 输出: Computing fullName... Full name changed: John 
lastName.set('Doe')    // 输出: Computing fullName... Full name changed:  Doe
```

### 使用 Batch 解决

```typescript
import { signal, computed, effect, batch } from 'qore'

const firstName = signal('')
const lastName = signal('')

const fullName = computed(() => {
  console.log('Computing fullName...')
  return `${firstName()} ${lastName()}`
})

effect(() => {
  console.log('Full name changed:', fullName())
})

// ✅ 使用 batch：只触发一次计算
batch(() => {
  firstName.set('John')
  lastName.set('Doe')
})
// 输出:
// Computing fullName...
// Full name changed: John Doe
```

---

## 基础用法

### 批量更新多个 Signal

```typescript
import { signal, batch } from 'qore'

const x = signal(0)
const y = signal(0)
const z = signal(0)

batch(() => {
  x.set(1)
  y.set(2)
  z.set(3)
  // 所有依赖只会在 batch 结束后更新一次
})
```

### 嵌套 Batch

```typescript
import { signal, batch } from 'qore'

const a = signal(0)
const b = signal(0)
const c = signal(0)

batch(() => {
  a.set(1)
  
  batch(() => {
    b.set(2)
    c.set(3)
  })
  
  // 外层 batch 结束后才触发更新
})
```

### 返回值

```typescript
import { signal, batch } from 'qore'

const count = signal(0)

const result = batch(() => {
  count.set(10)
  return count() * 2
})

console.log(result) // 20
```

---

## 使用场景

### 1. 表单重置

```typescript
import { component, signal, batch } from 'qore'

const Form = component(() => {
  const formData = signal({
    name: '',
    email: '',
    phone: ''
  })
  
  const resetForm = () => {
    batch(() => {
      formData.set({
        name: '',
        email: '',
        phone: ''
      })
    })
  }
  
  return () => `
    <form>
      <input value="${formData().name}" oninput="${e => formData.set({...formData(), name: e.target.value})}" />
      <input value="${formData().email}" oninput="${e => formData.set({...formData(), email: e.target.value})}" />
      <input value="${formData().phone}" oninput="${e => formData.set({...formData(), phone: e.target.value})}" />
      <button type="button" onclick="${resetForm}">Reset</button>
    </form>
  `
})
```

### 2. 列表操作

```typescript
import { component, signal, batch } from 'qore'

const TodoList = component(() => {
  const todos = signal([
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: false },
  ])
  
  const completeAll = () => {
    batch(() => {
      todos.set(todos().map(todo => ({ ...todo, done: true })))
    })
  }
  
  const addMultiple = () => {
    batch(() => {
      const newTodos = [
        { id: Date.now(), text: 'New Task 1', done: false },
        { id: Date.now() + 1, text: 'New Task 2', done: false },
        { id: Date.now() + 2, text: 'New Task 3', done: false },
      ]
      todos.set([...todos(), ...newTodos])
    })
  }
  
  return () => `
    <div>
      <button onclick="${completeAll}">Complete All</button>
      <button onclick="${addMultiple}">Add Multiple</button>
      <ul>
        ${todos().map(todo => `
          <li class="${todo.done ? 'done' : ''}">${todo.text}</li>
        `).join('')}
      </ul>
    </div>
  `
})
```

### 3. 状态同步

```typescript
import { signal, batch } from 'qore'

const user = signal({ name: '', email: '', age: 0 })
const displayName = signal('')
const isAdult = signal(false)

const updateUser = (newData: Partial<typeof user>) => {
  batch(() => {
    user.set({ ...user(), ...newData })
    
    if (newData.name) {
      displayName.set(newData.name)
    }
    
    if (newData.age) {
      isAdult.set(newData.age >= 18)
    }
  })
}

// 所有依赖只更新一次
updateUser({ name: 'Alice', age: 25 })
```

### 4. 动画状态

```typescript
import { signal, batch } from 'qore'

const animation = signal({
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1
})

const animateTo = (target: typeof animation) => {
  batch(() => {
    animation.set({
      x: target.x,
      y: target.y,
      scale: target.scale,
      rotation: target.rotation,
      opacity: target.opacity
    })
  })
}
```

### 5. 数据获取和更新

```typescript
import { signal, batch } from 'qore'

const data = signal([])
const loading = signal(false)
const error = signal(null)
const lastUpdated = signal(null)

const fetchData = async () => {
  batch(() => {
    loading.set(true)
    error.set(null)
  })
  
  try {
    const response = await fetch('/api/data')
    const result = await response.json()
    
    batch(() => {
      data.set(result)
      lastUpdated.set(Date.now())
      loading.set(false)
    })
  } catch (err) {
    batch(() => {
      error.set(err.message)
      loading.set(false)
    })
  }
}
```

---

## 性能对比

### 不使用 Batch

```typescript
import { signal, computed } from 'qore'

const a = signal(0)
const b = signal(0)
const c = signal(0)

// 每次 set 都会触发计算
const sum = computed(() => {
  console.log('Computing sum...')
  return a() + b() + c()
})

a.set(1) // Computing sum...
b.set(2) // Computing sum...
c.set(3) // Computing sum...
// 总共计算 3 次
```

### 使用 Batch

```typescript
import { signal, computed, batch } from 'qore'

const a = signal(0)
const b = signal(0)
const c = signal(0)

const sum = computed(() => {
  console.log('Computing sum...')
  return a() + b() + c()
})

batch(() => {
  a.set(1)
  b.set(2)
  c.set(3)
})
// Computing sum... (只计算 1 次)
```

---

## 高级用法

### Batch 嵌套 Computed

```typescript
import { signal, computed, batch } from 'qore'

const price = signal(100)
const quantity = signal(1)
const tax = signal(0.1)

const subtotal = computed(() => price() * quantity())
const taxAmount = computed(() => subtotal() * tax())
const total = computed(() => subtotal() + taxAmount())

batch(() => {
  price.set(200)
  quantity.set(3)
  // 所有 computed 只计算一次
})
```

### Batch 与 Effect

```typescript
import { signal, effect, batch } from 'qore'

const count = signal(0)
const name = signal('Qore')

effect(() => {
  console.log(`[${name()}] Count: ${count()}`)
})

// 只触发一次 effect
batch(() => {
  count.set(10)
  name.set('Updated')
})
// 输出: [Updated] Count: 10
```

### 条件 Batch

```typescript
import { signal, batch } from 'qore'

const shouldBatch = signal(true)

const update = (updates: () => void) => {
  if (shouldBatch()) {
    batch(updates)
  } else {
    updates()
  }
}

// 根据条件决定是否批量更新
update(() => {
  // 多个更新操作
})
```

---

## 注意事项

### 1. Batch 范围

Batch 只影响在 `fn` 函数内执行的 Signal 更新：

```typescript
import { signal, batch } from 'qore'

const a = signal(0)
const b = signal(0)

batch(() => {
  a.set(1) // 在 batch 内
})

b.set(2) // 在 batch 外，立即触发更新
```

### 2. 异步操作

Batch 不等待异步操作完成：

```typescript
import { signal, batch } from 'qore'

const data = signal([])
const loading = signal(false)

// ❌ 异步操作在 batch 结束后才完成
batch(() => {
  loading.set(true)
  fetch('/api/data').then(res => {
    data.set(await res.json()) // 这个更新不在 batch 内
  })
  loading.set(false) // 立即设置为 false
})

// ✅ 正确处理
batch(() => {
  loading.set(true)
})

fetch('/api/data')
  .then(res => res.json())
  .then(result => {
    batch(() => {
      data.set(result)
      loading.set(false)
    })
  })
```

### 3. 避免过度使用

对于单个 Signal 更新，不需要使用 batch：

```typescript
import { signal, batch } from 'qore'

const count = signal(0)

// ❌ 不必要
batch(() => {
  count.set(1)
})

// ✅ 直接更新
count.set(1)
```

---

## 最佳实践

### 1. 在用户操作中使用

```typescript
const handleSubmit = () => {
  batch(() => {
    formData.set(newData)
    errors.set([])
    isSubmitting.set(true)
  })
}
```

### 2. 在数据同步中使用

```typescript
const syncData = (newData: Data) => {
  batch(() => {
    state.data.set(newData.items)
    state.meta.set(newData.meta)
    state.timestamp.set(Date.now())
  })
}
```

### 3. 在复杂状态更新中使用

```typescript
const updateComplexState = () => {
  batch(() => {
    user.set(newUser)
    settings.set(newSettings)
    preferences.set(newPreferences)
  })
}
```

---

## 相关资源

- [Signal API](/api/signal) - 创建响应式状态
- [Computed API](/api/computed) - 创建派生状态
- [Effect API](/api/effect) - 处理副作用
- [性能优化指南](/guide/performance)
