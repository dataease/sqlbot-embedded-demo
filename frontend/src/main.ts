import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import * as ElementPlusIcons from '@element-plus/icons-vue'
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIcons)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')