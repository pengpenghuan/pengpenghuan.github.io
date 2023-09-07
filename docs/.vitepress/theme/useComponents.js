// Don't remove this file, because it registers the demo components.
import ButtonDemo from '../components/button/demo.vue'
import ControlCenterSabr from '../components/controlCenter/sabre.js'
import InputDemo from '../components/input/demo.vue'
import ControlCenterEditorInde from '../components/controlCenter/editor/index.js'
import ControlCenterEditor from '../components/controlCenter/editor/index.vue'
import ControlCenterLayoutEnter from '../components/controlCenter/layout/enter.vue'
import ControlCenterMenuEditor from '../components/controlCenter/menuEditor/index.vue'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'

export function useComponents(app) {
  app.component('ButtonDemo', ButtonDemo)
  app.component('ControlCenterSabr', ControlCenterSabr)
  app.component('InputDemo', InputDemo)
  app.component('ControlCenterEditorInde', ControlCenterEditorInde)
  app.component('ControlCenterEditor', ControlCenterEditor)
  app.component('ControlCenterLayoutEnter', ControlCenterLayoutEnter)
  app.component('ControlCenterMenuEditor', ControlCenterMenuEditor)
  app.component('Demo', Demo)
  app.component('DemoBlock', DemoBlock)
}
