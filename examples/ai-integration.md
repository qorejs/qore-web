# AI Integration Example

```ts
import { createOpenAI, h, mount, signal, stream, text } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const prompt = signal('Explain Qore in one sentence')

let activeAnswer = stream(['Ask something and the answer will stream here.'])
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

The holder signal swaps between conversations. The active `QoreStream` still drives the article token by token.
