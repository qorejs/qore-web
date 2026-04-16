/**
 * Qore Mock Implementation for Doctest
 * 用于测试文档示例代码的轻量级实现
 */

type CleanupFn = () => void

interface Signal<T> {
  (): T
  set(value: T): void
  update(fn: (value: T) => T): void
  peek(): T
}

interface Computed<T> {
  (): T
  peek(): T
}

interface EffectOptions {
  immediate?: boolean
  scheduler?: (fn: () => void) => void
}

// 依赖追踪
let activeEffect: (() => void) | null = null
const effectStack: (() => void)[] = []

// Signal 实现
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue
  const listeners = new Set<() => void>()

  const sig = function() {
    if (activeEffect) {
      listeners.add(activeEffect)
    }
    return value
  } as Signal<T>

  sig.set = (newValue: T) => {
    if (value !== newValue) {
      value = newValue
      listeners.forEach(fn => fn())
    }
  }

  sig.update = (fn: (value: T) => T) => {
    sig.set(fn(value))
  }

  sig.peek = () => value

  return sig
}

// Computed 实现
export function computed<T>(getter: () => T): Computed<T> {
  let cachedValue: T | null = null
  let dirty = true
  const depsListeners = new Set<() => void>()

  const compute = () => {
    dirty = false
    cachedValue = getter()
    depsListeners.forEach(fn => fn())
  }

  const notify = () => {
    dirty = true
  }

  // 创建一个 effect 来追踪依赖
  const effectCleanup = effect(() => {
    if (dirty || cachedValue === null) {
      compute()
    }
  })

  const comp = function() {
    if (activeEffect) {
      depsListeners.add(activeEffect)
    }
    if (dirty || cachedValue === null) {
      const prevEffect = activeEffect
      activeEffect = notify
      try {
        cachedValue = getter()
        dirty = false
      } finally {
        activeEffect = prevEffect
      }
    }
    return cachedValue!
  } as Computed<T>

  comp.peek = () => {
    if (dirty || cachedValue === null) {
      cachedValue = getter()
      dirty = false
    }
    return cachedValue
  }

  return comp
}

// Effect 实现
export function effect(
  fn: () => void | CleanupFn,
  options?: EffectOptions
): () => void {
  let cleanup: CleanupFn | null = null
  let stopped = false

  const run = () => {
    if (stopped) return

    if (cleanup) {
      cleanup()
    }

    if (activeEffect) {
      effectStack.push(activeEffect)
    }

    activeEffect = run
    try {
      const result = fn()
      if (typeof result === 'function') {
        cleanup = result
      }
    } finally {
      activeEffect = effectStack.pop() || null
    }
  }

  // 立即执行
  if (options?.immediate !== false) {
    if (options?.scheduler) {
      options.scheduler(run)
    } else {
      run()
    }
  }

  return () => {
    stopped = true
    if (cleanup) {
      cleanup()
    }
  }
}

// Batch 实现
let batchDepth = 0
const batchedEffects = new Set<() => void>()

export function batch<T>(fn: () => T): T {
  batchDepth++
  try {
    return fn()
  } finally {
    batchDepth--
    if (batchDepth === 0) {
      batchedEffects.forEach(effect => effect())
      batchedEffects.clear()
    }
  }
}

// 组件占位符（用于文档示例）
export function component<T extends () => string>(fn: T): T {
  return fn
}

// 生命周期占位符
export function onMount(fn: () => void): void {
  fn()
}

export function onUnmount(fn: () => void): void {
  // 在测试中不执行
}

// 导出类型
export type { Signal, Computed, EffectOptions, CleanupFn }
