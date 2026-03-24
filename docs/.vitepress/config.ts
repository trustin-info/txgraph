import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'TxGraph',
  ignoreDeadLinks: true,
  description: 'Blockchain transaction tracing graph — open source React components',
  base: '/txgraph/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/txgraph/logo.svg' }],
  ],
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'TxGraph' },
    nav: [
      { text: 'Guide', link: '/guide/layer1-product' },
      { text: 'API', link: '/api/components' },
      { text: 'GitHub', link: 'https://github.com/Blackman99/txgraph' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: '🌐 Layer 1: Use Explorer', link: '/guide/layer1-product' },
          { text: '🤖 Layer 2: AI Agent API', link: '/guide/layer2-agent' },
          { text: '💻 Layer 3: Local Demo', link: '/guide/layer3-demo' },
          { text: '🛠 Layer 4: Build Your Own', link: '/guide/layer4-component' },
          { text: '⚡ Claude Code Skill', link: '/guide/claude-code-skill' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Components', link: '/api/components' },
          { text: 'Types', link: '/api/types' },
          { text: 'REST API', link: '/api/rest-api' },
        ],
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 TrustIn',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Blackman99/txgraph' },
    ],
  },
})
