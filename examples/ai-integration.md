# AI Integration Example

```ts
import { createOpenAI, h, mount, signal, stream, text } from '@qorejs/qore'

const openAI = createOpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const prompt = signal('Explain Qore in one sentence')
const answer = signal<ReturnType<typeof stream> | null>(null)

function ask() {
  answer(stream(openAI.chat(prompt())))
}

mount('#app', () => h('main', {},
  h('textarea', { value: prompt(), oninput: event => prompt(event.target.value) }),
  h('button', { onclick: ask }, 'Ask'),
  h('article', {}, text(() => answer()?.() ?? 'Ask something...')),
  h('small', {}, text(() => answer()?.status() ?? 'idle'))
))
```

The provider stream becomes a signal, and the article updates token by token.
