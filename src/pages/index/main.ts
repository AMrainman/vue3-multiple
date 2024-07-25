import { createApp } from 'vue'
import App from './index.vue'
import 'virtual:uno.css'

console.log(createApp, App)
createApp(App).mount('#app')
