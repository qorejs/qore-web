import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  type Event = { type: 'text'; text: string } | { type: 'status'; label: string }
  const events = stream.events<Event>([
    { type: 'text', text: 'One stream, ' },
    { type: 'status', label: 'working' },
    { type: 'text', text: 'many views.' },
  ], { backpressure: { interval } })
  const answer = events.select('text', {
    seed: '', reduce: (current, event) => current + event.text,
  })
  return { stream: answer, dispose: () => events.abort() }
}
