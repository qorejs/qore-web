import type { QoreStream } from '@qorejs/qore'

export interface ExampleSession {
  stream: QoreStream<unknown, unknown>
  dispose?: () => void
}

// Code shown and code executed come from the same source file.
const modules = import.meta.glob('./snippets/*.ts') as Record<string, () => Promise<{ createExample: (interval?: number) => ExampleSession }>>
const sources = import.meta.glob('./snippets/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export function exampleCode(id: string) {
  return sources[`./snippets/${id}.ts`] ?? ''
}

export async function loadExample(id: string) {
  const load = modules[`./snippets/${id}.ts`]
  if (!load) throw new Error(`Unknown example: ${id}`)
  return load()
}

export function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === undefined) return 'undefined'
  return JSON.stringify(value, null, 2)
}
