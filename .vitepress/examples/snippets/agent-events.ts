import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const events = stream.events([
    { type: 'status', text: 'thinking' },
    { type: 'tool_call', name: 'search_docs' },
    { type: 'text', text: 'Found the answer.' },
  ], { backpressure: { interval } })
  return { stream: events }
}
