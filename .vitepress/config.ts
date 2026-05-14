import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Qore',
  description: 'Streaming response framework: stream becomes signal.',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
    ['meta', { name: 'theme-color', content: '#07110f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: 'Qore - Streaming Response Framework' }],
    ['meta', { property: 'og:description', content: 'stream becomes signal, and AI tokens flow directly into UI.' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '流式响应', link: '/guide/streaming' },
      { text: 'API', link: '/api/streaming' },
      { text: '示例', link: '/examples/ai-integration' },
      { text: 'GitHub', link: 'https://github.com/qorejs/qore' },
    ],

    search: {
      provider: 'local',
      options: {
        detailedView: true,
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '5 分钟快速入门', link: '/guide/quick-start' },
            { text: '为什么选择 Qore', link: '/guide/why-qore' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/core-concepts' },
          ],
        },
        {
          text: '流式响应',
          items: [
            { text: '响应式系统', link: '/guide/reactivity' },
            { text: '流式渲染', link: '/guide/streaming' },
            { text: 'AI 流', link: '/guide/ai-native' },
            { text: '服务端渲染', link: '/guide/ssr' },
          ],
        },
        {
          text: '组件',
          items: [
            { text: '组件系统', link: '/guide/components' },
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
          text: '示例',
          items: [
            { text: 'AI 集成', link: '/examples/ai-integration' },
            { text: '快速开始', link: '/examples/basic' },
            { text: '计数器', link: '/examples/counter' },
            { text: 'Todo 列表', link: '/examples/todo' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/qorejs/qore', ariaLabel: 'Qore on GitHub' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Qore Framework',
    },

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

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Qore',
      description: 'Streaming response framework: stream becomes signal.',
    },
  },

  lastUpdated: {
    text: '最后更新时间',
    formatOptions: {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Shanghai',
    },
  },
})
