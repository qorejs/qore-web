export const usage = `async function main() {
  const example = createExample()
  const unsubscribe = example.stream.subscribe(console.log)
  try {
    await example.stream.ready
  } catch (error) {
    console.error(error)
  } finally {
    unsubscribe()
    example.stream.abort()
    if ('dispose' in example && typeof example.dispose === 'function') {
      example.dispose()
    }
  }
}
void main()`
