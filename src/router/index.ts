import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { getCurrentUser } from "../settings/firebase";
import { setTitle, setDescription } from "@/composables/set-title-description";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Home", desc: "たこの世話管理ボード" },
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    meta: { title: "About", desc: "説明ページ" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: { title: "Login", desc: "ログインページ" },
  },
  {
    path: "/records",
    name: "Records",
    component: () => import("../views/Records.vue"),
    meta: { requiresAuth: true, title: "Records", desc: "管理ボード" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const currentUser = await getCurrentUser();
  setTitle(to.meta.title as string);
  setDescription(to.meta.desc as string);
  if (requiresAuth && !currentUser) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
