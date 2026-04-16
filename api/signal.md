# Signal API

Signal 是 Qore 响应式系统的核心构建块。它是一个可追踪的响应式值，当值发生变化时，所有依赖它的计算和副作用都会自动更新。

## 函数签名

```typescript
function signal<T>(initialValue: T): Signal<T>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `initialValue` | `T` | 是 | Signal 的初始值，可以是任意类型（基本类型、对象、数组等） |

### 返回值

返回一个 `Signal<T>` 对象，具有以下方法和特性：

| 方法/调用 | 签名 | 说明 |
|-----------|------|------|
| `signal()` | `() => T` | 读取当前值（使用函数调用语法） |
| `signal.set()` | `(value: T) => void` | 设置新值 |
| `signal.update()` | `(fn: (value: T) => T) => void` | 基于当前值更新 |
| `signal.peek()` | `() => T` | 读取值但不追踪依赖 |

---

## 基础用法

### 创建 Signal

```typescript
import { signal } from 'qore'

// 基本类型
const count = signal(0)
const name = signal('Qore')
const isActive = signal(true)

// 复杂类型
const user = signal({ id: 1, name: 'Alice' })
const items = signal([1, 2, 3])
const nullable = signal<string | null>(null)
```

### 读取值

使用函数调用语法读取 Signal 的值。**重要**：在组件或 computed 中读取 Signal 会自动建立依赖关系。

```typescript
import { signal } from 'qore'

const count = signal(0)

// 读取值
console.log(count()) // 0

// 在组件中使用
const Counter = () => {
  const count = signal(0)
  return `<div>${count()}</div>` // 读取 count，建立依赖
}
```

### 设置值

使用 `set()` 方法设置新值。这会触发所有依赖的更新。

```typescript
import { signal } from 'qore'

const count = signal(0)

count.set(10)
console.log(count()) // 10

// 设置对象
const user = signal({ name: 'Alice' })
user.set({ name: 'Bob' }) // 替换整个对象
```

::: tip 注意
Signal 使用引用相等性进行比较。对于对象和数组，设置相同的引用不会触发更新：

```typescript
const obj = signal({ value: 1 })
const sameObj = obj()

obj.set(sameObj) // 不会触发更新（引用相同）
obj.set({ value: 1 }) // 会触发更新（新对象）
```
:::

### 更新值

使用 `update()` 方法基于当前值进行更新。这是 `set()` 的便捷方法，接受一个更新函数。

```typescript
import { signal } from 'qore'

const count = signal(0)

// 以下两种方式等价
count.set(count() + 1)
count.update(n => n + 1)

// 对象更新示例
const user = signal({ name: 'Alice', age: 25 })
user.update(u => ({ ...u, age: u.age + 1 }))
```

---

## 高级用法

### peek() - 静默读取

`peek()` 读取 Signal 的值但**不建立依赖关系**。适用于不想触发重新计算的场景。

```typescript
import { signal, computed } from 'qore'

const count = signal(0)
const logs = signal<string[]>([])

// 使用 peek() 读取，不会让 computed 依赖 count
const lastLog = computed(() => {
  const logsValue = logs()
  return logsValue.length > 0 ? logsValue[logsValue.length - 1] : 'No logs'
})

// 记录日志但不触发 lastLog 更新
const logCount = () => {
  logs.update(l => [...l, `Count is: ${count.peek()}`])
}
```

### 在 Effect 中使用

```typescript
import { signal, effect } from 'qore'

const count = signal(0)

// effect 会自动追踪 count 的变化
effect(() => {
  console.log(`Count changed to: ${count()}`)
})

count.set(1) // 输出: Count changed to: 1
count.set(2) // 输出: Count changed to: 2
```

### 在 Computed 中使用

```typescript
import { signal, computed } from 'qore'

const price = signal(100)
const quantity = signal(2)

// computed 自动追踪 price 和 quantity
const total = computed(() => {
  return price() * quantity()
})

console.log(total()) // 200

price.set(150)
console.log(total()) // 300 (自动重新计算)
```

---

## 类型定义

```typescript
interface Signal<T> {
  // 读取值（函数调用语法）
  (): T
  
  // 设置新值
  set(value: T): void
  
  // 基于当前值更新
  update(fn: (value: T) => T): void
  
  // 静默读取（不追踪依赖）
  peek(): T
}
```

### TypeScript 泛型

Signal 完全支持 TypeScript 泛型，提供完整的类型推断：

```typescript
import { signal } from 'qore'

// 显式指定类型
const count = signal<number>(0)
const names = signal<string[]>([])
const user = signal<{ id: number; name: string } | null>(null)

// 类型推断（推荐）
const count = signal(0) // Signal<number>
const name = signal('Qore') // Signal<string>
const items = signal([1, 2, 3]) // Signal<number[]>

// 类型检查
count.set(10) // ✅
count.set('wrong') // ❌ TypeScript 错误

// 更新函数的类型检查
count.update(n => n + 1) // ✅
count.update(n => n + 'wrong') // ❌ TypeScript 错误
```

---

## 使用场景

### 1. 组件状态

```typescript
import { component, signal } from 'qore'

const Counter = component(() => {
  const count = signal(0)
  
  return () => `
    <div>
      <p>Count: ${count()}</p>
      <button onclick="${() => count.update(n => n + 1)}">
        Increment
      </button>
      <button onclick="${() => count.set(0)}">
        Reset
      </button>
    </div>
  `
})
```

### 2. 表单输入

```typescript
import { component, signal } from 'qore'

const Form = component(() => {
  const email = signal('')
  const password = signal('')
  const errors = signal<string[]>([])
  
  const validate = () => {
    const newErrors: string[] = []
    if (!email().includes('@')) newErrors.push('Invalid email')
    if (password().length < 8) newErrors.push('Password too short')
    errors.set(newErrors)
  }
  
  return () => `
    <form onsubmit="${e => { e.preventDefault(); validate() }}">
      <input 
        type="email" 
        value="${email()}"
        oninput="${e => email.set(e.target.value)}"
        placeholder="Email"
      />
      <input 
        type="password"
        value="${password()}"
        oninput="${e => password.set(e.target.value)}"
        placeholder="Password"
      />
      ${errors().length > 0 ? `
        <ul class="errors">
          ${errors().map(err => `<li>${err}</li>`).join('')}
        </ul>
      ` : ''}
      <button type="submit">Submit</button>
    </form>
  `
})
```

### 3. 共享状态

```typescript
import { signal } from 'qore'

// 在模块级别创建共享状态
export const store = {
  user: signal<{ id: number; name: string } | null>(null),
  isAuthenticated: signal(false),
  
  login(user: { id: number; name: string }) {
    this.user.set(user)
    this.isAuthenticated.set(true)
  },
  
  logout() {
    this.user.set(null)
    this.isAuthenticated.set(false)
  }
}

// 在多个组件中使用
import { store } from './store'

const UserProfile = component(() => {
  return () => `
    <div>
      ${store.user()?.name || 'Not logged in'}
    </div>
  `
})
```

---

## 性能优化

### 避免不必要的更新

```typescript
import { signal } from 'qore'

const data = signal({ value: 1 })

// ❌ 不推荐 - 即使值相同也会触发更新
data.set({ value: 1 })

// ✅ 推荐 - 先检查再更新
if (data().value !== 1) {
  data.set({ value: 1 })
}

// ✅ 或使用 update 进行条件更新
data.update(d => d.value !== 1 ? { value: 1 } : d)
```

### 批量更新

当需要更新多个 Signal 时，使用 `batch()` 避免中间状态触发多次更新：

```typescript
import { signal, batch } from 'qore'

const firstName = signal('')
const lastName = signal('')
const fullName = computed(() => `${firstName()} ${lastName()}`)

// ❌ 会触发两次 fullName 重新计算
firstName.set('John')
lastName.set('Doe')

// ✅ 只触发一次 fullName 重新计算
batch(() => {
  firstName.set('John')
  lastName.set('Doe')
})
```

---

## 常见问题

### Q: Signal 和 React 的 useState 有什么区别？

A: Signal 是可变的外部引用，可以在组件外部创建和共享；useState 是不可变的，只能在组件内部使用。

### Q: 什么时候使用 update() 而不是 set()？

A: 当新值依赖于当前值时使用 `update()`，这样代码更简洁且避免竞态条件。

### Q: Signal 支持深度响应式吗？

A: Signal 本身是浅层响应式。对于对象的深层变化，需要替换整个对象或使用嵌套 Signal。

---

## 相关资源

- [Computed API](/api/computed) - 创建派生状态
- [Effect API](/api/effect) - 处理副作用
- [Batch API](/api/batch) - 批量更新
- [响应式系统指南](/guide/reactivity)
