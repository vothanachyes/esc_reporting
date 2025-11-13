import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const SESSION_STORAGE_KEY = "pin-verified-session";
const LOCAL_STORAGE_KEY = "pin-verified-local";

// Helper function to check if PIN is verified
function isPinVerified(): boolean {
  return (
    sessionStorage.getItem(SESSION_STORAGE_KEY) === "true" ||
    localStorage.getItem(LOCAL_STORAGE_KEY) === "true"
  );
}

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginPage.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
    meta: {
      requiresAuth: true,
      viewType: "mini",
    },
  },
  {
    path: "/detail",
    name: "Detail",
    component: () => import("@/views/HomePage.vue"),
    meta: {
      requiresAuth: true,
      viewType: "detail",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check PIN verification
router.beforeEach((to, from, next) => {
  const verified = isPinVerified();

  if (to.meta.requiresAuth && !verified) {
    // Redirect to login if not verified and trying to access protected route
    next({ name: "Login" });
  } else if (to.name === "Login" && verified) {
    // Redirect to home if already verified and trying to access login
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;

