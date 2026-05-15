# Todo Example

```ts
import { computed, h, list, mount, signal, text } from '@qorejs/qore'

const todos = signal([
  { id: 1, text: 'Learn Qore', done: true },
  { id: 2, text: 'Build something streaming', done: false }
])
const input = signal('')
const remaining = computed(() => todos().filter(todo => !todo.done).length)

function addTodo() {
  if (!input().trim()) return
  todos([...todos(), { id: Date.now(), text: input(), done: false }])
  input('')
}

function toggle(id: number) {
  todos(todos().map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))
}

mount('#app', () => h('main', {},
  h('h1', {}, 'Todo List'),
  h('input', { value: input(), oninput: event => input(event.target.value) }),
  h('button', { onclick: addTodo }, 'Add'),
  h('ul', {}, list(todos, todo => h('li', {},
    h('label', {},
      h('input', { type: 'checkbox', checked: todo.done, onchange: () => toggle(todo.id) }),
      todo.text
    )
  ))),
  h('p', {}, text(() => `${remaining()} remaining`))
))
```
