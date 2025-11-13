<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          ref="cardRef"
          class="relative w-full max-w-md bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden profile-card-3d"
          :style="cardStyle"
          @mouseleave="resetCardRotation"
        >
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 z-10 shadow-md hover:scale-110 cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-5 dark:opacity-10">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 40px 40px;"></div>
          </div>

          <!-- Content -->
          <div class="relative p-6 md:p-8">
            <!-- Header Section -->
            <div class="flex flex-col items-center mb-6">
              <!-- Avatar -->
              <div class="relative mb-4">
                <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-linear-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 p-1 shadow-xl overflow-hidden">
                  <PrimeImage
                    v-if="profile.avatar && avatarUrl"
                    :src="avatarUrl"
                    :alt="profile.name"
                    class="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
                    preview
                    :pt="{
                      root: { class: 'w-full h-full rounded-full overflow-hidden' },
                      image: { class: 'w-full h-full rounded-full object-cover' },
                      preview: { class: 'cursor-pointer' }
                    }"
                  />
                  <div
                    v-else
                    class="w-full h-full rounded-full bg-linear-to-br from-primary-300 to-primary-500 dark:from-primary-400 dark:to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-800"
                  >
                    <span class="text-3xl md:text-4xl font-bold text-white">
                      {{ getInitials(profile.name) }}
                    </span>
                  </div>
                </div>
                <!-- Status Badge -->
                <div
                  v-if="isTeamLeader"
                  class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 z-10"
                >
                  <span class="text-white text-xs font-bold">TL</span>
                </div>
              </div>

              <!-- Name -->
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                {{ profile.name }}
              </h2>

              <!-- Role -->
              <div class="px-4 py-1.5 rounded-full bg-linear-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 border border-primary/30 mb-4">
                <span class="text-sm md:text-base font-semibold text-primary dark:text-primary-300">
                  {{ profile.role || (isTeamLeader ? "Technical Director" : "Desktop Senior Developer") }}
                </span>
              </div>
            </div>

            <!-- Company Section -->
            <div class="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <img
                v-if="companyLogo"
                :src="companyLogo"
                alt="E-School Cambodia"
                class="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <div class="text-center">
                <p class="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">E-School Cambodia</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Working at</p>
              </div>
            </div>

            <!-- Info Section -->
            <div class="space-y-3">
              <!-- Email -->
              <div v-if="profile.email" class="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                <div class="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ profile.email }}</p>
                </div>
              </div>

              <!-- Department -->
              <div v-if="profile.department" class="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                <div class="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Department</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ profile.department }}</p>
                </div>
              </div>

              <!-- Location -->
              <div v-if="profile.location" class="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                <div class="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Location</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ profile.location }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { getAvatarUrl } from "@/utils/avatarUtils";
import type { PersonInfo } from "@/data/types";
import PrimeImage from "primevue/image";

const props = defineProps<{
  profile: PersonInfo;
  isOpen: boolean;
  isTeamLeader?: boolean;
  companyLogo?: string;
}>();

const emit = defineEmits<{
  "close": [];
}>();

const cardRef = ref<HTMLElement | null>(null);
const rotationX = ref(0);
const rotationY = ref(0);

const avatarUrl = computed(() => {
  return props.profile.avatar ? getAvatarUrl(props.profile.avatar) : null;
});

const companyLogo = computed(() => {
  if (props.companyLogo) {
    return props.companyLogo;
  }
  // Default to E-School Cambodia logo from assets
  return undefined;
});

const cardStyle = computed(() => {
  return {
    transform: `perspective(1000px) rotateX(${rotationX.value}deg) rotateY(${rotationY.value}deg)`,
    transition: "transform 0.1s ease-out",
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

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return;

  const rect = cardRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseX = e.clientX - centerX;
  const mouseY = e.clientY - centerY;

  // Calculate rotation (max 15 degrees)
  rotationY.value = (mouseX / rect.width) * 15;
  rotationX.value = -(mouseY / rect.height) * 15;
};

const resetCardRotation = () => {
  rotationX.value = 0;
  rotationY.value = 0;
};

const close = () => {
  resetCardRotation();
  emit("close");
};

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    close();
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleEscape);
      resetCardRotation();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.profile-card-3d {
  transform-style: preserve-3d;
  will-change: transform;
}

/* Smooth transitions */
.profile-card-3d * {
  transform-style: preserve-3d;
}
</style>

