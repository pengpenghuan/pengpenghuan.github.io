import DefaultTheme from 'vitepress/theme'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import './style.css'
import Button from '../../../src/components/Button.vue'
import '../../../src/styles/index.css'

// custom layout
import Enter from '../components/controlCenter/layout/enter.vue'

// md editor plugin
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// editor page
import Editor from "../components/controlCenter/editor/index.vue";
import MenuEditor from "../components/controlCenter/menuEditor/index.vue";
import { h } from "../cache/deps/vue.js";

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(Enter)
    })
  },
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component(Button.name, Button)

    ctx.app.component('MdEditor', MdEditor)
    ctx.app.component('Editor', Editor)
    ctx.app.component('MenuEditor', MenuEditor)
  }
}
