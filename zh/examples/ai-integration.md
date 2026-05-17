# AI 集成示例

这个示例使用生产安全形态：模型厂商 key 留在服务端，浏览器只消费你的 `/api/chat` SSE 代理。

## 服务端路由

```ts
import { createOpenAI } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { prompt } = await request.json() as { prompt: string }
  const encoder = new TextEncoder()

  return new Response(new ReadableStream({
    async start(controller) {
      for await (const token of openAI.chat(prompt)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: token })}\n\n`))
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  }), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/event-stream; charset=utf-8'
    }
  })
}
```

## 浏览器应用

```ts
import { createSSEAdapter, h, mount, signal, stream, text } from '@qorejs/qore'

const chat = createSSEAdapter<{ prompt: string }, string, { text?: string }>({
  name: 'Server Chat',
  url: '/api/chat',
  headers: { 'Content-Type': 'application/json' },
  buildRequest(request) {
    return { body: JSON.stringify(request) }
  },
  buildChatRequest(prompt) {
    return { prompt }
  },
  eventToText(event) {
    return event.data.text
  }
})

const prompt = signal('用一句话解释 Qore')
let activeAnswer = stream(['点击 Ask 开始流式生成。'])
const answer = signal(activeAnswer)

function ask() {
  activeAnswer.abort()
  activeAnswer = stream(chat.chat(prompt()))
  answer(activeAnswer)
}

mount('#app', () => h('main', {},
  h('textarea', {
    value: prompt(),
    oninput: (event: Event) => prompt((event.currentTarget as HTMLTextAreaElement).value)
  }),
  h('button', { onclick: ask }, 'Ask'),
  h('article', {}, text(() => answer()())),
  h('small', {}, text(() => answer().status()))
))
```

外层 `answer` signal 负责切换当前对话；内部 `QoreStream` 继续按 token 驱动文章内容。
