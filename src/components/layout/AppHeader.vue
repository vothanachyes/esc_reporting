<template>
  <header
    class="sticky top-0 z-50 w-full px-6 flex items-center justify-between shadow-lg"
    :style="headerStyle"
  >
    <!-- Left: Logo + Handler -->
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center">
        <img src="@/assets/images/logo.png" alt="Logo" class="w-7 h-7 rounded-full border border-white dark:border-gray-200" />
      </div>
      <div class="flex items-center gap-1.5">
        <img
          v-if="data.handler.avatar"
          :src="data.handler.avatar"
          :alt="data.handler.name"
          class="w-7 h-7 rounded-full border border-white dark:border-gray-200"
        />
        <div
          v-else
          class="w-7 h-7 rounded-full bg-white/20 dark:bg-gray-200/20 border border-white dark:border-gray-200 flex items-center justify-center"
        >
          <span class="text-white dark:text-gray-900 text-xs font-semibold">
            {{ getInitials(data.handler.name) }}
          </span>
        </div>
        <span class="text-white dark:text-gray-100 font-bold text-sm">{{ data.handler.name }}</span>
      </div>
    </div>

    <!-- Center: Title -->
    <div class="flex-1 text-center">
      <h1 class="text-white dark:text-gray-100 text-base font-semibold">{{ data.title }}</h1>
    </div>

    <!-- Right: Team Leader + Menu -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1.5">
        <img
          v-if="data.teamLeader.avatar"
          :src="data.teamLeader.avatar"
          :alt="data.teamLeader.name"
          class="w-7 h-7 rounded-full border border-white dark:border-gray-200"
        />
        <div
          v-else
          class="w-7 h-7 rounded-full bg-white/20 dark:bg-gray-200/20 border border-white dark:border-gray-200 flex items-center justify-center"
        >
          <span class="text-white dark:text-gray-900 text-xs font-semibold">
            {{ getInitials(data.teamLeader.name) }}
          </span>
        </div>
        <span class="text-white dark:text-gray-100 font-semibold text-sm">{{ data.teamLeader.name }}</span>
      </div>
      <div class="relative">
        <button
          class="w-7 h-7 flex items-center justify-center text-white dark:text-gray-100 hover:bg-white/10 dark:hover:bg-gray-200/10 rounded-lg transition-colors"
          @click="toggleMenu"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Menu Dropdown -->
        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
        >
          <button
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            @click="handlePrint"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </button>
          <button
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            @click="handleShare"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between gap-2"
            @click="toggleDarkMode"
          >
            <div class="flex items-center gap-2">
              <svg
                v-if="isDark"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>{{ isDark ? "Dark Mode" : "Light Mode" }}</span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ isDark ? "ON" : "OFF" }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { MainWrapperData } from "@/data/types";
import { useDarkMode } from "@/composables/useDarkMode";

defineProps<{
  data: MainWrapperData;
}>();

const { isDark, toggle } = useDarkMode();
const menuOpen = ref(false);

const headerStyle = computed(() => {
  const gradient = isDark.value
    ? "linear-gradient(135deg, #022f40 0%, #011e26 100%)"
    : "linear-gradient(135deg, #045174 0%, #022f40 100%)";
  return {
    height: "5vh",
    background: gradient,
    opacity: "0.95",
  };
});

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const toggleDarkMode = () => {
  toggle();
  menuOpen.value = false;
};

const handlePrint = () => {
  window.print();
  menuOpen.value = false;
};

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: "Monthly Report",
      text: "Check out this monthly report",
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }
  menuOpen.value = false;
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  window.document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.document.removeEventListener("click", handleClickOutside);
});
</script>

