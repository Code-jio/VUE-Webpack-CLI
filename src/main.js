import { createApp } from "vue";
import App from "./App";

// import * as echarts from "echarts"
// import ElementPlus from "element-plus"
// import "element-plus/dist/index.css"

import router from "./router"

const app = createApp(App)

app.use(router)
    // .use(ElementPlus)
    .mount(document.getElementById("app"));
// app.config.globalProperties.$echarts = echarts