import type { App } from 'vue'
import copyText from './copyText'

export default function directive(app: App) {
  app.directive('copyText', copyText)
}
