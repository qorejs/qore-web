import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const job = stream.create(['Prepared', 'Built', 'Published'], {
    seed: { completed: 0, total: 3, current: 'Waiting' },
    reduce: (state, current) => ({
      ...state, completed: state.completed + 1, current,
    }),
    backpressure: { interval },
  })
  return { stream: job }
}
