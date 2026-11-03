export const examples = [
  {
    "id": "text-stream",
    "category": "basics",
    "title": {
      "en": "Streaming text",
      "zh": "逐字输出文本"
    },
    "description": {
      "en": "Accumulate tokens into one readable signal.",
      "zh": "把逐步到达的文本累积成一个可读取的 signal。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "async-generator",
    "category": "basics",
    "title": {
      "en": "Async generators",
      "zh": "异步生成器"
    },
    "description": {
      "en": "Connect an async iterable to reactive state.",
      "zh": "让异步迭代器直接成为响应式状态。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "readable-stream",
    "category": "basics",
    "title": {
      "en": "Web ReadableStream",
      "zh": "浏览器 ReadableStream"
    },
    "description": {
      "en": "Consume a browser-native stream without a server.",
      "zh": "用浏览器原生流演示数据接入，无需服务端。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "promise-source",
    "category": "basics",
    "title": {
      "en": "Promise sources",
      "zh": "Promise 数据源"
    },
    "description": {
      "en": "Resolve a promised value into a stream signal.",
      "zh": "等待 Promise 返回结果，再将结果发布为流式状态。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "list",
    "category": "data",
    "title": {
      "en": "Accumulated lists",
      "zh": "累积列表"
    },
    "description": {
      "en": "Collect every item while retaining typed values.",
      "zh": "保留每个数据项的原始类型并累积为列表。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "latest",
    "category": "data",
    "title": {
      "en": "Latest value",
      "zh": "只保留最新值"
    },
    "description": {
      "en": "Show the current progress instead of the entire history.",
      "zh": "展示当前进度，而不是累积所有历史数值。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "running-total",
    "category": "data",
    "title": {
      "en": "Running totals",
      "zh": "实时累计"
    },
    "description": {
      "en": "Reduce incoming numbers into a running total.",
      "zh": "使用 reducer 把增量数字累积成总数。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "object-state",
    "category": "data",
    "title": {
      "en": "Structured state",
      "zh": "结构化任务状态"
    },
    "description": {
      "en": "Track a job with an object-shaped signal.",
      "zh": "用对象形式的 signal 跟踪任务进度与当前步骤。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "json-output",
    "category": "data",
    "title": {
      "en": "JSON after completion",
      "zh": "完整 JSON 输出"
    },
    "description": {
      "en": "Accumulate a JSON document, then parse its complete value.",
      "zh": "先接收完整 JSON 文档，再解析为结构化对象。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "bounded-logs",
    "category": "data",
    "title": {
      "en": "Bounded log window",
      "zh": "有界日志窗口"
    },
    "description": {
      "en": "Keep only the latest three log entries with a reducer.",
      "zh": "通过 reducer 仅保留最近三条日志，控制显示窗口。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "agent-events",
    "category": "agents",
    "title": {
      "en": "Agent timeline",
      "zh": "Agent 事件时间线"
    },
    "description": {
      "en": "Keep status, tool calls, and text in one event timeline.",
      "zh": "把状态、工具调用和文本放入同一条事件时间线。"
    },
    "guide": "/examples/agent-event-stream"
  },
  {
    "id": "tool-selector",
    "category": "agents",
    "title": {
      "en": "Select tool calls",
      "zh": "筛选工具调用"
    },
    "description": {
      "en": "Subscribe only to tool calls from a mixed event stream.",
      "zh": "从混合事件流中只订阅工具调用。"
    },
    "guide": "/examples/agent-event-stream"
  },
  {
    "id": "text-selector",
    "category": "agents",
    "title": {
      "en": "Reduce selected text",
      "zh": "合并选中的文本"
    },
    "description": {
      "en": "Build an answer while ignoring other event types.",
      "zh": "合并文本事件构建回答，同时忽略其他类型的事件。"
    },
    "guide": "/examples/agent-event-stream"
  },
  {
    "id": "merge",
    "category": "composition",
    "title": {
      "en": "Merge sources",
      "zh": "合并并行数据源"
    },
    "description": {
      "en": "Interleave updates from two independent sources.",
      "zh": "把两个独立数据源的更新合并到同一条流。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "concat",
    "category": "composition",
    "title": {
      "en": "Sequential stages",
      "zh": "顺序连接多段流"
    },
    "description": {
      "en": "Finish one source before starting the next.",
      "zh": "等待前一个数据源完成，再接收下一个数据源。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "pipeline",
    "category": "composition",
    "title": {
      "en": "Transform pipeline",
      "zh": "多阶段转换管线"
    },
    "description": {
      "en": "Pass each stage result into the next transformation.",
      "zh": "把每个阶段的结果交给下一个转换步骤。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "race",
    "category": "composition",
    "title": {
      "en": "First source wins",
      "zh": "选择最快数据源"
    },
    "description": {
      "en": "Continue with the source that produces its first chunk first.",
      "zh": "选择最先产生数据的数据源，并继续消费它。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "switch-latest",
    "category": "composition",
    "title": {
      "en": "Latest query wins",
      "zh": "只接收最新查询结果"
    },
    "description": {
      "en": "Drop stale results when a new query arrives.",
      "zh": "新查询到达后，忽略旧查询后续产生的结果。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "retry",
    "category": "control",
    "title": {
      "en": "Retry a failed source",
      "zh": "失败后重试"
    },
    "description": {
      "en": "Recover from two simulated failures with bounded retries.",
      "zh": "模拟两次失败，通过有限次数的重试恢复。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "backpressure",
    "category": "control",
    "title": {
      "en": "Pace a fast producer",
      "zh": "控制快速生产者"
    },
    "description": {
      "en": "Apply backpressure while preserving every chunk.",
      "zh": "施加背压控制输出速度，同时保留每个数据块。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "cancellation",
    "category": "control",
    "title": {
      "en": "Cancel and keep output",
      "zh": "取消并保留已有输出"
    },
    "description": {
      "en": "Abort a stream explicitly without losing its partial value.",
      "zh": "主动取消流，同时保留已经接收到的内容。"
    },
    "guide": "/api/streaming"
  },
  {
    "id": "error-handling",
    "category": "control",
    "title": {
      "en": "Observe an error",
      "zh": "观察错误状态"
    },
    "description": {
      "en": "Keep partial output and inspect the terminal error.",
      "zh": "发生错误后保留部分输出，并读取错误信息。"
    },
    "guide": "/api/streaming"
  }
] as const

export type ExampleId = typeof examples[number]['id']
