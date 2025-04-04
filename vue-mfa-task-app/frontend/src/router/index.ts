// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/AboutView.vue";
import Register from "../views/Register.vue";
import Tasks from "@/views/Task.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/tasks", component: Tasks },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
