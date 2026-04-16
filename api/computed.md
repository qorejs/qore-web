# Computed API

Computed 创建派生状态，自动追踪依赖并在依赖变化时重新计算。Computed 值是**只读**的，只能从它的依赖 Signal 派生。

## 函数签名

```typescript
function computed<T>(getter: () => T): Computed<T>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `getter` | `() => T` | 是 | 计算函数，返回派生值。函数内读取的 Signal 会自动成为依赖 |

### 返回值

返回一个 `Computed<T>` 对象，具有以下特性：

| 方法/调用 | 签名 | 说明 |
|-----------|------|------|
| `computed()` | `() => T` | 读取计算值（使用函数调用语法） |
| `computed.peek()` | `() => T` | 读取值但不追踪依赖 |

::: warning 重要
Computed 是**只读**的，不能使用 `set()` 或 `update()` 方法修改。
:::

---

## 基础用法

### 创建 Computed

```typescript
import { signal, computed } from 'qore'

const price = signal(100)
const quantity = signal(2)

// 创建派生状态
const total = computed(() => price() * quantity())

console.log(total()) // 200

// 当依赖变化时，自动重新计算
price.set(150)
console.log(total()) // 300
```

### 依赖追踪

Computed 自动追踪在 getter 函数中读取的所有 Signal：

```typescript
import { signal, computed } from 'qore'

const firstName = signal('John')
const lastName = signal('Doe')

// 自动追踪 firstName 和 lastName
const fullName = computed(() => {
  return `${firstName()} ${lastName()}`
})

console.log(fullName()) // "John Doe"

firstName.set('Jane')
console.log(fullName()) // "Jane Doe" (自动更新)
```

### 链式 Computed

Computed 可以依赖其他 Computed：

```typescript
import { signal, computed } from 'qore'

const price = signal(100)
const quantity = signal(2)
const taxRate = signal(0.1)

const subtotal = computed(() => price() * quantity())
const tax = computed(() => subtotal() * taxRate())
const total = computed(() => subtotal() + tax())

console.log(total()) // 220

price.set(200)
console.log(total()) // 440 (所有依赖链自动更新)
```

---

## 高级用法

### 条件计算

```typescript
import { signal, computed } from 'qore'

const discount = signal(0)
const price = signal(100)

const finalPrice = computed(() => {
  if (discount() > 0) {
    return price() * (1 - discount())
  }
  return price()
})

console.log(finalPrice()) // 100

discount.set(0.2)
console.log(finalPrice()) // 80
```

### 缓存机制

Computed 具有内置缓存，只有依赖变化时才会重新计算：

```typescript
import { signal, computed } from 'qore'

const data = signal([])

// 昂贵的计算
const processed = computed(() => {
  console.log('Computing...') // 只在依赖变化时执行
  return data().map(item => expensiveTransform(item))
})

processed() // 输出: Computing...
processed() // 无输出（使用缓存）

data.set([1, 2, 3]) // 输出: Computing... (依赖变化)
```

### peek() - 静默读取

```typescript
import { signal, computed } from 'qore'

const count = signal(0)
const double = computed(() => count() * 2)
const logs = signal<string[]>([])

// 读取 double 但不建立依赖
const logDouble = () => {
  logs.update(l => [...l, `Double is: ${double.peek()}`])
}
```

---

## 类型定义

```typescript
interface Computed<T> {
  // 读取计算值（函数调用语法）
  (): T
  
  // 静默读取（不追踪依赖）
  peek(): T
}
```

### TypeScript 泛型

Computed 完全支持 TypeScript 泛型：

```typescript
import { signal, computed } from 'qore'

// 类型推断（推荐）
const count = signal(0)
const double = computed(() => count() * 2) // Computed<number>

// 显式指定类型
const result = computed<number>(() => {
  return count() * 2
})

// 复杂类型
interface User {
  id: number
  name: string
}

const users = signal<User[]>([])
const userNames = computed(() => users().map(u => u.name)) // Computed<string[]>

// 类型检查
const wrong: Computed<string> = computed(() => 123) // ❌ TypeScript 错误
```

---

## 使用场景

### 1. 派生状态

```typescript
import { component, signal, computed } from 'qore'

const ShoppingCart = component(() => {
  const items = signal([
    { id: 1, name: 'Apple', price: 1.5, quantity: 3 },
    { id: 2, name: 'Banana', price: 0.8, quantity: 5 },
  ])
  
  // 派生状态
  const itemCount = computed(() => 
    items().reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const totalPrice = computed(() => 
    items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  const formattedTotal = computed(() => 
    `$${totalPrice().toFixed(2)}`
  )
  
  return () => `
    <div>
      <h2>Shopping Cart</h2>
      <p>Items: ${itemCount()}</p>
      <p>Total: ${formattedTotal()}</p>
      <ul>
        ${items().map(item => `
          <li>${item.name} x ${item.quantity}</li>
        `).join('')}
      </ul>
    </div>
  `
})
```

### 2. 过滤和排序

```typescript
import { component, signal, computed } from 'qore'

const TodoList = component(() => {
  const todos = signal([
    { id: 1, text: 'Learn Qore', done: true },
    { id: 2, text: 'Build app', done: false },
    { id: 3, text: 'Deploy', done: false },
  ])
  const filter = signal<'all' | 'active' | 'completed'>('all')
  
  const filteredTodos = computed(() => {
    switch (filter()) {
      case 'active':
        return todos().filter(t => !t.done)
      case 'completed':
        return todos().filter(t => t.done)
      default:
        return todos()
    }
  })
  
  const remainingCount = computed(() => 
    todos().filter(t => !t.done).length
  )
  
  return () => `
    <div>
      <h1>Todo List (${remainingCount()} remaining)</h1>
      
      <div class="filters">
        <button onclick="${() => filter.set('all')}">All</button>
        <button onclick="${() => filter.set('active')}">Active</button>
        <button onclick="${() => filter.set('completed')}">Completed</button>
      </div>
      
      <ul>
        ${filteredTodos().map(todo => `
          <li class="${todo.done ? 'done' : ''}">${todo.text}</li>
        `).join('')}
      </ul>
    </div>
  `
})
```

### 3. 表单验证

```typescript
import { component, signal, computed } from 'qore'

const LoginForm = component(() => {
  const email = signal('')
  const password = signal('')
  
  const emailError = computed(() => {
    if (!email()) return ''
    if (!email().includes('@')) return 'Invalid email format'
    return ''
  })
  
  const passwordError = computed(() => {
    if (!password()) return ''
    if (password().length < 8) return 'Password must be at least 8 characters'
    return ''
  })
  
  const isValid = computed(() => 
    email() && !emailError() && password() && !passwordError()
  )
  
  return () => `
    <form>
      <input 
        type="email"
        value="${email()}"
        oninput="${e => email.set(e.target.value)}"
        placeholder="Email"
      />
      ${emailError() ? `<span class="error">${emailError()}</span>` : ''}
      
      <input 
        type="password"
        value="${password()}"
        oninput="${e => password.set(e.target.value)}"
        placeholder="Password"
      />
      ${passwordError() ? `<span class="error">${passwordError()}</span>` : ''}
      
      <button type="submit" disabled="${!isValid()}">
        Login
      </button>
    </form>
  `
})
```

### 4. 数据转换

```typescript
import { signal, computed } from 'qore'

interface APIUser {
  id: number
  first_name: string
  last_name: string
  created_at: string
}

interface DisplayUser {
  id: number
  fullName: string
  createdAt: Date
}

const rawUsers = signal<APIUser[]>([])

// 转换 API 数据为展示格式
const displayUsers = computed<DisplayUser[]>(() => {
  return rawUsers().map(user => ({
    id: user.id,
    fullName: `${user.first_name} ${user.last_name}`,
    createdAt: new Date(user.created_at)
  }))
})

// 进一步派生
const userNames = computed(() => 
  displayUsers().map(u => u.fullName)
)
```

---

## 性能优化

### 避免重复计算

```typescript
import { signal, computed } from 'qore'

const numbers = signal<number[]>([])

// ❌ 不推荐 - 每次访问都重新计算
const expensive = () => {
  return numbers().reduce((sum, n) => sum + Math.sqrt(n), 0)
}

// ✅ 推荐 - 使用 computed 缓存结果
const expensiveComputed = computed(() => {
  return numbers().reduce((sum, n) => sum + Math.sqrt(n), 0)
})
```

### 惰性计算

Computed 只在被读取时才会计算：

```typescript
import { signal, computed } from 'qore'

const data = signal([])

// 这个 computed 不会立即执行
const processed = computed(() => {
  console.log('Computing...')
  return data().map(transform)
})

// 只有第一次读取时才计算
processed() // 输出: Computing...
processed() // 无输出（缓存）

data.set([1, 2, 3]) // 依赖变化，但不会立即计算

processed() // 输出: Computing... (依赖变化后首次读取)
```

### 避免过度依赖

```typescript
import { signal, computed } from 'qore'

const data = signal({ a: 1, b: 2, c: 3 })

// ❌ 不推荐 - 任何属性变化都会触发重新计算
const sum = computed(() => data().a + data().b)

// ✅ 推荐 - 只依赖需要的属性
const a = signal(1)
const b = signal(2)
const sum = computed(() => a() + b())
```

---

## 与 Effect 配合

```typescript
import { signal, computed, effect } from 'qore'

const price = signal(100)
const quantity = signal(2)
const total = computed(() => price() * quantity())

// effect 追踪 computed，computed 追踪 signals
effect(() => {
  console.log(`Total: ${total()}`)
})

price.set(150) // 输出: Total: 300
```

---

## 常见问题

### Q: Computed 和 Signal 有什么区别？

A: Signal 是可写的状态源，Computed 是只读的派生状态。Computed 的值由 getter 函数决定，不能直接修改。

### Q: Computed 什么时候重新计算？

A: 只有当依赖的 Signal 发生变化**并且**Computed 被读取时才会重新计算。

### Q: 可以在 Computed 中执行副作用吗？

A: 不应该。Computed 应该是纯函数，不产生副作用。副作用应该放在 Effect 中。

### Q: Computed 会缓存吗？

A: 是的，Computed 会缓存结果，只有依赖变化时才重新计算。

---

## 相关资源

- [Signal API](/api/signal) - 创建响应式状态
- [Effect API](/api/effect) - 处理副作用
- [响应式系统指南](/guide/reactivity)
- [计数器示例](/examples/counter)
