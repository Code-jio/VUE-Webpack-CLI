import { createRouter, createWebHistory } from "vue-router"

const Home = () => import("../views/Home/Home.vue")
const About = () => import("../views/About/About.vue")

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: Home
        },
        {
            path: "/home",
            component: Home
        },
        {
            path: "/about",
            component: About
        }
    ]
})