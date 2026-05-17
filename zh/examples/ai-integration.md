# AI 集成示例

```ts
import { createOpenAI, h, mount, signal, stream, text } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const prompt = signal('用一句话解释 Qore')

let activeAnswer = stream(['点击 Ask 开始流式生成。'])
const answer = signal(activeAnswer)

function ask() {
  activeAnswer.abort()
  activeAnswer = stream(openAI.chat(prompt()))
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
