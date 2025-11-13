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
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          ref="cardRef"
          class="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden company-card-3d flex flex-col"
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

          <!-- Scrollable Content -->
          <div class="relative flex-1 overflow-y-auto">
            <div class="p-6 md:p-8">
              <!-- Header Section -->
              <div class="flex flex-col items-center mb-6">
                <!-- Company Logo -->
                <div class="relative mb-4">
                  <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 p-1 shadow-xl overflow-hidden">
                    <img
                      v-if="companyLogoUrl"
                      :src="companyLogoUrl"
                      alt="E-School Cambodia"
                      class="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                    />
                    <div
                      v-else
                      class="w-full h-full rounded-full bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-400 dark:to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-800"
                    >
                      <span class="text-3xl md:text-4xl font-bold text-white">ES</span>
                    </div>
                  </div>
                </div>

                <!-- Company Name -->
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {{ companyInfo.name }}
                </h2>

                <!-- Website Badge -->
                <a
                  :href="companyInfo.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 border border-primary/30 hover:from-primary/30 hover:to-primary/20 dark:hover:from-primary/40 dark:hover:to-primary/30 transition-all duration-200 mb-4 group"
                >
                  <svg class="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span class="text-sm md:text-base font-semibold text-primary dark:text-primary-300">Visit Website</span>
                </a>
              </div>

              <!-- Description Section -->
              <div v-if="companyInfo.description" class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                  {{ companyInfo.description.english || companyInfo.description.main }}
                </p>
              </div>

              <!-- Contact Information -->
              <div class="space-y-3 mb-6">
                <!-- Email -->
                <div v-if="companyInfo.contact?.email" class="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                    <a
                      :href="`mailto:${companyInfo.contact.email}`"
                      class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {{ companyInfo.contact.email }}
                    </a>
                  </div>
                </div>

                <!-- Phone -->
                <div v-if="companyInfo.contact?.phones && companyInfo.contact.phones.length > 0" class="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Phone</p>
                    <div class="flex flex-wrap gap-2">
                      <a
                        v-for="(phone, index) in companyInfo.contact.phones"
                        :key="index"
                        :href="`tel:${phone.replace(/\s/g, '')}`"
                        class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                      >
                        {{ phone }}
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Address -->
                <div v-if="companyInfo.address" class="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Address</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                      {{ companyInfo.address.english || companyInfo.address.khmer }}
                    </p>
                    <p v-if="companyInfo.address.english && companyInfo.address.khmer" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ companyInfo.address.khmer }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Features Section -->
              <div v-if="companyInfo.features && companyInfo.features.length > 0" class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Key Features</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="(feature, index) in companyInfo.features"
                    :key="index"
                    class="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <h4 class="text-sm font-semibold text-primary dark:text-primary-300 mb-1">
                      {{ feature.english || feature.title }}
                    </h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {{ feature.descriptionEnglish || feature.description }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Teachers Section (Optional) -->
              <div v-if="companyInfo.teachers && companyInfo.teachers.length > 0" class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Our Teachers</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="(teacher, index) in companyInfo.teachers"
                    :key="index"
                    class="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ teacher.english || teacher.name }}
                    </p>
                    <p class="text-xs text-primary dark:text-primary-300 mt-0.5">
                      {{ teacher.subjectEnglish || teacher.subject }}
                    </p>
                  </div>
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
import { ref, computed, watch, onUnmounted } from "vue";
import type { CompanyInfo } from "@/data/types";
import companyLogo from "@/assets/images/logo.png";

const props = defineProps<{
  companyInfo: CompanyInfo;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "close": [];
}>();

const cardRef = ref<HTMLElement | null>(null);
const rotationX = ref(0);
const rotationY = ref(0);

const companyLogoUrl = companyLogo;

const cardStyle = computed(() => {
  return {
    transform: `perspective(1000px) rotateX(${rotationX.value}deg) rotateY(${rotationY.value}deg)`,
    transition: "transform 0.1s ease-out",
  };
});

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return;

  const rect = cardRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseX = e.clientX - centerX;
  const mouseY = e.clientY - centerY;

  // Calculate rotation (max 10 degrees for larger card)
  rotationY.value = (mouseX / rect.width) * 10;
  rotationX.value = -(mouseY / rect.height) * 10;
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
.company-card-3d {
  transform-style: preserve-3d;
  will-change: transform;
}

/* Smooth transitions */
.company-card-3d * {
  transform-style: preserve-3d;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

