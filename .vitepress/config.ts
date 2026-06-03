import { defineConfig } from 'vitepress'

const englishNav = [
  { text: 'Why', link: '/guide/why-qore' },
  { text: 'Demo', link: '/#surfaces' },
  { text: 'Docs', link: '/guide/quick-start' },
  { text: 'GitHub', link: 'https://github.com/qorejs/qore' },
]

const chineseNav = [
  { text: '为什么', link: '/zh/guide/why-qore' },
  { text: 'Demo', link: '/zh/#surfaces' },
  { text: '文档', link: '/zh/guide/quick-start' },
  { text: 'GitHub', link: 'https://github.com/qorejs/qore' },
]

const englishSidebar = {
  '/guide/': [
    {
      text: 'Start Here',
      items: [
        { text: 'Why Qore', link: '/guide/why-qore' },
        { text: '5-Minute Quick Start', link: '/guide/quick-start' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ],
    },
    {
      text: 'Runtime',
      items: [
        { text: 'Streaming Response', link: '/guide/streaming' },
        { text: 'Reactivity', link: '/guide/reactivity' },
        { text: 'Core Concepts', link: '/guide/core-concepts' },
        { text: 'Components', link: '/guide/components' },
      ],
    },
    {
      text: 'Providers & Server',
      items: [
        { text: 'Provider Integration', link: '/guide/ai-native' },
        { text: 'Server Streaming', link: '/guide/server-streaming' },
        { text: 'Server Rendering', link: '/guide/ssr' },
      ],
    },
    {
      text: 'Migration',
      items: [
        { text: 'From React', link: '/guide/migration-from-react' },
        { text: 'From Vue', link: '/guide/migration-from-vue' },
      ],
    },
  ],
  '/api/': [
    {
      text: 'Stream API',
      items: [
        { text: 'Streaming', link: '/api/streaming' },
      ],
    },
    {
      text: 'Reactive API',
      items: [
        { text: 'Signal', link: '/api/signal' },
        { text: 'Computed', link: '/api/computed' },
        { text: 'Effect', link: '/api/effect' },
        { text: 'Batch', link: '/api/batch' },
      ],
    },
    {
      text: 'DOM API',
      items: [
        { text: 'Component', link: '/api/component' },
        { text: 'Renderer', link: '/api/renderer' },
      ],
    },
  ],
  '/examples/': [
    {
      text: 'Examples',
      items: [
        { text: 'AI Integration', link: '/examples/ai-integration' },
        { text: 'Basic', link: '/examples/basic' },
        { text: 'Counter', link: '/examples/counter' },
        { text: 'Todo List', link: '/examples/todo' },
      ],
    },
  ],
}

const chineseSidebar = {
  '/zh/guide/': [
    {
      text: '开始',
      items: [
        { text: '为什么选择 Qore', link: '/zh/guide/why-qore' },
        { text: '5 分钟快速入门', link: '/zh/guide/quick-start' },
        { text: '快速开始', link: '/zh/guide/getting-started' },
      ],
    },
    {
      text: '运行时',
      items: [
        { text: '流式响应', link: '/zh/guide/streaming' },
        { text: '响应式系统', link: '/zh/guide/reactivity' },
        { text: '核心概念', link: '/zh/guide/core-concepts' },
        { text: '组件系统', link: '/zh/guide/components' },
      ],
    },
    {
      text: 'Providers 与服务端',
      items: [
        { text: 'Provider 集成', link: '/zh/guide/ai-native' },
        { text: '服务端流式输出', link: '/zh/guide/server-streaming' },
        { text: '服务端渲染', link: '/zh/guide/ssr' },
      ],
    },
    {
      text: '迁移',
      items: [
        { text: '从 React 迁移', link: '/zh/guide/migration-from-react' },
        { text: '从 Vue 迁移', link: '/zh/guide/migration-from-vue' },
      ],
    },
  ],
  '/zh/api/': [
    {
      text: 'Stream API',
      items: [
        { text: 'Streaming', link: '/zh/api/streaming' },
      ],
    },
    {
      text: 'Reactive API',
      items: [
        { text: 'Signal', link: '/zh/api/signal' },
        { text: 'Computed', link: '/zh/api/computed' },
        { text: 'Effect', link: '/zh/api/effect' },
        { text: 'Batch', link: '/zh/api/batch' },
      ],
    },
    {
      text: 'DOM API',
      items: [
        { text: 'Component', link: '/zh/api/component' },
        { text: 'Renderer', link: '/zh/api/renderer' },
      ],
    },
  ],
  '/zh/examples/': [
    {
      text: '示例',
      items: [
        { text: 'AI 集成', link: '/zh/examples/ai-integration' },
        { text: '基础示例', link: '/zh/examples/basic' },
        { text: '计数器', link: '/zh/examples/counter' },
        { text: 'Todo 列表', link: '/zh/examples/todo' },
      ],
    },
  ],
}

export default defineConfig({
  lang: 'en-US',
  title: 'Qore',
  description: 'Qore is the reactive stream runtime for AI-native interfaces.',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
    ['meta', { name: 'theme-color', content: '#07110f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:title', content: 'Qore - Reactive Stream Runtime' }],
    ['meta', { property: 'og:description', content: 'Reactive Stream Runtime for AI-native interfaces. Make streams first-class state.' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: englishNav,
    sidebar: englishSidebar,

    search: {
      provider: 'local',
      options: {
        detailedView: true,
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search docs',
                buttonAriaLabel: 'Search docs',
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Reset search',
                footer: {
                  selectText: 'select',
                  navigateText: 'navigate',
                },
              },
            },
          },
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/qorejs/qore', ariaLabel: 'Qore on GitHub' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Qore Runtime',
    },

    editLink: {
      pattern: 'https://github.com/qorejs/qore-web/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },

    outline: {
      label: 'On this page',
    },

    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Return to top',
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Qore',
      description: 'Qore is the reactive stream runtime for AI-native interfaces.',
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Qore',
      description: 'Qore 是面向 AI-native interface 的 reactive stream runtime.',
      themeConfig: {
        nav: chineseNav,
        sidebar: chineseSidebar,
        editLink: {
          pattern: 'https://github.com/qorejs/qore-web/edit/main/:path',
          text: '在 GitHub 上编辑此页面',
        },
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },
        outline: {
          label: '本页目录',
        },
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
      },
    },
  },

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    lineNumbers: false,
  },

  vite: {
    optimizeDeps: {
      include: ['vue', '@qorejs/qore'],
    },
  },

  ignoreDeadLinks: true,

  lastUpdated: {
    text: 'Last updated',
    formatOptions: {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Shanghai',
    },
  },
})
