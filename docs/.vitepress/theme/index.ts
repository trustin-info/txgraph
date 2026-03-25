import DefaultTheme from 'vitepress/theme'
import DemoFrame from './DemoFrame.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoFrame', DemoFrame)
  },
}
