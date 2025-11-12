<template>
  <header
    class="sticky top-0 z-50 w-full px-6 flex items-center justify-between backdrop-blur-md border-b border-white/10 dark:border-gray-700/30"
    :style="headerStyle"
  >
    <!-- Left: Logo + Handler -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-br from-white to-gray-100 dark:from-gray-100 dark:to-gray-200 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-white/50 dark:ring-gray-300/50">
        <img src="@/assets/images/logo.png" alt="Logo" class="w-7 h-7 rounded-full" />
      </div>
      <button
        @click="openHandlerProfile"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-md hover:bg-white/15 dark:hover:bg-gray-800/40 transition-all duration-200 cursor-pointer group"
      >
        <img
          v-if="handlerAvatarUrl"
          :src="handlerAvatarUrl"
          :alt="data.handler.name"
          class="w-7 h-7 rounded-full border-2 border-white/50 dark:border-gray-300/50 shadow-md ring-2 ring-primary/20 group-hover:scale-110 transition-transform"
        />
        <div
          v-else
          class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 border-2 border-white/50 dark:border-gray-300/50 flex items-center justify-center shadow-md ring-2 ring-primary/20 group-hover:scale-110 transition-transform"
        >
          <span class="text-white text-xs font-bold">
            {{ getInitials(data.handler.name) }}
          </span>
        </div>
        <span class="hidden sm:inline text-white dark:text-gray-100 font-bold text-sm drop-shadow-sm group-hover:text-primary-200 transition-colors">{{ data.handler.name }}</span>
      </button>
    </div>

    <!-- Right: Team Leader + Menu -->
    <div class="flex items-center gap-3">
      <button
        @click="openTeamLeaderProfile"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-md hover:bg-white/15 dark:hover:bg-gray-800/40 transition-all duration-200 cursor-pointer group"
      >
        <span
          class="hidden sm:inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold shadow-md shadow-orange-500/30 border border-orange-300/50"
        >
          TL
        </span>
        <img
          v-if="teamLeaderAvatarUrl"
          :src="teamLeaderAvatarUrl"
          :alt="data.teamLeader.name"
          class="w-7 h-7 rounded-full border-2 border-white/50 dark:border-gray-300/50 shadow-md ring-2 ring-orange-500/20 group-hover:scale-110 transition-transform"
        />
        <div
          v-else
          class="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 border-2 border-white/50 dark:border-gray-300/50 flex items-center justify-center shadow-md ring-2 ring-orange-500/20 group-hover:scale-110 transition-transform"
        >
          <span class="text-white text-xs font-bold">
            {{ getInitials(data.teamLeader.name) }}
          </span>
        </div>
        <span class="hidden sm:inline text-white dark:text-gray-100 font-semibold text-sm drop-shadow-sm group-hover:text-orange-200 transition-colors">{{ data.teamLeader.name }}</span>
      </button>
      <div class="relative">
        <button
          class="w-9 h-9 flex items-center justify-center text-white dark:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-200/15 rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-md hover:shadow-lg hover:scale-105"
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
          class="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-hidden"
        >
          <button
            class="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 flex items-center gap-3 cursor-pointer transition-all duration-200 group"
            @click="handlePrint"
          >
            <svg
              class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
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
            <span class="group-hover:text-primary transition-colors">Print</span>
          </button>
          <button
            class="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 flex items-center gap-3 cursor-pointer transition-all duration-200 group"
            @click="handleShare"
          >
            <svg
              class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
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
            <span class="group-hover:text-primary transition-colors">Share</span>
          </button>
          <div class="border-t border-gray-200/50 dark:border-gray-700/50 my-1.5" />
          <button
            class="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 group"
            @click="toggleDarkMode"
          >
            <div class="flex items-center gap-3">
              <svg
                v-if="isDark"
                class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
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
                class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
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
              <span class="group-hover:text-primary transition-colors">{{ isDark ? "Dark Mode" : "Light Mode" }}</span>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 text-primary border border-primary/30">
              {{ isDark ? "ON" : "OFF" }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Cards -->
    <ProfileCard
      :profile="handlerProfile"
      :is-open="handlerProfileOpen"
      :is-team-leader="false"
      :company-logo="companyLogoUrl"
      @close="closeHandlerProfile"
    />
    <ProfileCard
      :profile="teamLeaderProfile"
      :is-open="teamLeaderProfileOpen"
      :is-team-leader="true"
      :company-logo="companyLogoUrl"
      @close="closeTeamLeaderProfile"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { MainWrapperData, PersonInfo } from "@/data/types";
import { useDarkMode } from "@/composables/useDarkMode";
import { getAvatarUrl } from "@/utils/avatarUtils";
import ProfileCard from "../ui/ProfileCard.vue";
import companyLogo from "@/assets/images/logo.png";

const props = defineProps<{
  data: MainWrapperData;
}>();

const { isDark, toggle } = useDarkMode();
const menuOpen = ref(false);
const handlerProfileOpen = ref(false);
const teamLeaderProfileOpen = ref(false);

// Company logo URL - E-School Cambodia logo
const companyLogoUrl = companyLogo;

// Extended profile info with defaults
const handlerProfile = computed<PersonInfo>(() => ({
  ...props.data.handler,
  role: props.data.handler.role || "Desktop Senior Developer",
  email: props.data.handler.email,
  department: props.data.handler.department,
  location: props.data.handler.location || "Phnom Penh, Cambodia",
}));

const teamLeaderProfile = computed<PersonInfo>(() => ({
  ...props.data.teamLeader,
  role: props.data.teamLeader.role || "Technical Director",
  email: props.data.teamLeader.email,
  department: props.data.teamLeader.department,
  location: props.data.teamLeader.location || "Phnom Penh, Cambodia",
}));

// Resolve avatar URLs using the utility function
// This ensures Vite processes the assets correctly for production builds
const handlerAvatarUrl = computed(() => getAvatarUrl(props.data.handler.avatar));
const teamLeaderAvatarUrl = computed(() => getAvatarUrl(props.data.teamLeader.avatar));

const headerStyle = computed(() => {
  const gradient = isDark.value
    ? "linear-gradient(135deg, rgba(2, 47, 64, 0.95) 0%, rgba(1, 30, 38, 0.95) 100%)"
    : "linear-gradient(135deg, rgba(2, 47, 64, 0.95) 0%, rgba(1, 30, 38, 0.95) 100%)";
  return {
    height: "50px",
    background: gradient,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
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

const openHandlerProfile = () => {
  handlerProfileOpen.value = true;
  menuOpen.value = false;
};

const closeHandlerProfile = () => {
  handlerProfileOpen.value = false;
};

const openTeamLeaderProfile = () => {
  teamLeaderProfileOpen.value = true;
  menuOpen.value = false;
};

const closeTeamLeaderProfile = () => {
  teamLeaderProfileOpen.value = false;
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

