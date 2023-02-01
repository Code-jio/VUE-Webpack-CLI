import { createApp } from "vue";
import App from "./App";
import "@/styles/common.scss"
// import * as echarts from "echarts"
// import ElementPlus from "element-plus"
// import "element-plus/dist/index.css"

import router from "./router"

const app = createApp(App)

app.use(router)
    // .use(ElementPlus)
    .mount(document.getElementById("app"));