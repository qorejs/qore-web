import assert from 'node:assert/strict'
import { readdir, mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { usage } from '../.vitepress/examples/usage'

const expectations: Record<string, { value?: unknown; status?: string; error?: string }> = {
  'text-stream': { value: 'Hello, streaming world.' },
  'async-generator': { value: 'Plan → Build → Ship' },
  'readable-stream': { value: 'A browser stream.' },
  'promise-source': { value: 'Resolved, then streamed.' },
  'list': { value: ['Search', 'Read', 'Answer'] },
  'latest': { value: 100 },
  'running-total': { value: 42 },
  'object-state': { value: { completed: 3, total: 3, current: 'Published' } },
  'json-output': { value: { title: 'Qore', items: ['stream', 'signal'] } },
  'bounded-logs': { value: ['log 4', 'log 5', 'log 6'] },
  'agent-events': { value: [{ type: 'status', text: 'thinking' }, { type: 'tool_call', name: 'search_docs' }, { type: 'text', text: 'Found the answer.' }] },
  'tool-selector': { value: [{ type: 'tool_call', name: 'search_docs' }, { type: 'tool_call', name: 'read_page' }] },
  'text-selector': { value: 'One stream, many views.' },
  'merge': { value: 'A1 B1 A2 B2 ' },
  'concat': { value: 'Plan. Build. Ship.' },
  'pipeline': { value: 'draft\nreview(draft)\nship(review(draft))' },
  'race': { value: 'Fast source wins.' },
  'switch-latest': { value: 'Result: qore' },
  'retry': { value: 'Recovered on attempt 3.' },
  'backpressure': { value: '12345' },
  'cancellation': { value: 'Kept partial output.', status: 'aborted' },
  'error-handling': { value: 'Partial response. ', status: 'error', error: 'Demo connection lost' },
}

assert.equal((await readdir(new URL('../.vitepress/examples/snippets/', import.meta.url))).filter(f => f.endsWith('.ts')).length, Object.keys(expectations).length)
const failures: string[] = []
for (const [id, expected] of Object.entries(expectations)) {
  const { createExample } = await import(`../.vitepress/examples/snippets/${id}.ts`)
  const example = createExample(5)
  const updates: unknown[] = []
  const unsubscribe = example.stream.subscribe((value: unknown) => updates.push(value))
  try {
    await example.stream.ready.catch(() => {})
    assert.equal(example.stream.status(), expected.status ?? 'completed', `${id}: terminal state`)
    assert.deepEqual(example.stream(), expected.value, `${id}: result`)
    if (expected.error) assert.equal(example.stream.error()?.message, expected.error)
    assert.ok(updates.length > 0, `${id}: actual subscription updates`)
    console.log(`✓ ${id}`)
  } catch (error) {
    failures.push(String(error))
  } finally {
    unsubscribe()
    example.stream.abort()
    example.dispose?.()
  }
  // Stopping a running sample must not leak a rejection or keep changing its value.
  const stopped = createExample(10)
  void stopped.stream.ready.catch(() => {})
  stopped.stream.abort()
  stopped.dispose?.()
  const snapshot = JSON.stringify(stopped.stream())
  await new Promise(resolve => setTimeout(resolve, 70))
  assert.equal(JSON.stringify(stopped.stream()), snapshot, `${id}: stable after abort`)
}
assert.deepEqual(failures, [])
console.log('examples-ok: 22 real runtime examples and cancellation checks')

// Verify the complete copied artifact in a project that has no ESM package default.
const cache = fileURLToPath(new URL('../.vitepress/cache/', import.meta.url))
await mkdir(cache, { recursive: true })
const directory = await mkdtemp(join(cache, 'copied-examples-'))
try {
  await writeFile(join(directory, 'package.json'), '{"type":"commonjs"}')
  for (const id of ['text-stream', 'tool-selector', 'error-handling']) {
    const source = await readFile(new URL(`../.vitepress/examples/snippets/${id}.ts`, import.meta.url), 'utf8')
    const file = join(directory, `${id}.mts`)
    await writeFile(file, `${source}\n${usage}\n`)
    const result = spawnSync(process.execPath, ['--import', 'tsx', file], { encoding: 'utf8', timeout: 10000 })
    assert.equal(result.status, 0, `${id}: copied .mts failed: ${result.stderr}`)
    assert.ok(result.stdout.trim(), `${id}: copied source should emit output`)
  }
} finally {
  await rm(directory, { recursive: true, force: true })
}
console.log('copied-examples-ok: complete ESM samples run in a default CommonJS project')
