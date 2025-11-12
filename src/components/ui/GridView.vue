<template>
  <div class="w-full h-full p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 scrollbar-auto">
    <div
      class="grid gap-4"
      :class="gridColumns"
    >
      <div
        v-for="(slide, index) in slides"
        :key="slide.pageIndex"
        class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden cursor-pointer hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow"
        @click="handleCardClick(index)"
      >
        <!-- Page Badge -->
        <div
          class="absolute top-2 right-2 w-8 h-8 bg-primary/80 dark:bg-primary-600 text-white dark:text-gray-100 rounded-full flex items-center justify-center font-bold text-xs z-10"
        >
          {{ slide.pageIndex }}
        </div>

        <!-- Card Preview -->
        <div class="p-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {{ slide.title }}
          </h3>
          <div
            class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3"
            v-html="slide.content.substring(0, 150)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SlideCard } from "@/data/types";

defineProps<{
  slides: SlideCard[];
}>();

const emit = defineEmits<{
  "card-click": [index: number];
}>();

const gridColumns = computed(() => {
  return {
    "grid-cols-3": true, // sm
    "md:grid-cols-4": true,
    "lg:grid-cols-5": true,
    "xl:grid-cols-6": true,
  };
});

const handleCardClick = (index: number) => {
  emit("card-click", index);
};
</script>

