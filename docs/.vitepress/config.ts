import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'TxGraph',
  ignoreDeadLinks: true,
  description: 'Blockchain transaction tracing graph — open source React components',
  base: '/txgraph/',
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'TxGraph' },
    nav: [
      { text: 'Guide', link: '/guide/layer1-product' },
      { text: 'API', link: '/api/components' },
      { text: 'GitHub', link: 'https://github.com/trustin-info/txgraph' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: '🌐 Use TrustIn Explorer', link: '/guide/layer1-product' },
          { text: '💻 Run Demo Locally', link: '/guide/layer2-demo' },
          { text: '🛠 Build Your Own', link: '/guide/layer3-component' },
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
      { icon: 'github', link: 'https://github.com/trustin-info/txgraph' },
    ],
  },
})
