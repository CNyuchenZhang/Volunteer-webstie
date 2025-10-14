/*import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
*/
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/style/index.css'

// 创建 Vue 实例
const app = createApp(App)

app.use(router)          // 路由
app.use(createPinia())   // Pinia 状态管理
app.use(ElementPlus)     // Element UI

app.mount('#app')
