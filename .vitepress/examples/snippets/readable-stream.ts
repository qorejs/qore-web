import { stream } from '@qorejs/qore'

export function createExample(interval = 160) {
  const source = new ReadableStream<string>({
    start(controller) {
      controller.enqueue('A browser ')
      controller.enqueue('stream.')
      controller.close()
    },
  })
  return { stream: stream.paced(source, interval) }
}
