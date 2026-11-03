import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  type Event = { type: 'text'; text: string } | { type: 'tool_call'; name: string }
  const events = stream.events<Event>([
    { type: 'text', text: 'Searching…' },
    { type: 'tool_call', name: 'search_docs' },
    { type: 'tool_call', name: 'read_page' },
  ], { backpressure: { interval } })
  const tools = events.select('tool_call')
  return { stream: tools, dispose: () => events.abort() }
}
