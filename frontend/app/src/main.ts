import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ← 这里改成默认导入
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/style/index.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
