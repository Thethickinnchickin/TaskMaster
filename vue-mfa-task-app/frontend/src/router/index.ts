// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import Tasks from "@/views/Task.vue";
import EmailVerification from "@/views/EmailVerification.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: EmailVerification },
  { path: "/register", component: EmailVerification },
  { path: "/tasks", component: Tasks },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
