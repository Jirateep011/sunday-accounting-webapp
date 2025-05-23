import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import styles
import './assets/styles/main.scss'

// Import Bootstrap JS
import 'bootstrap'

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')