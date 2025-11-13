<template>
    <div class="w-full h-full p-6 max-[450px]:p-3 overflow-y-auto bg-gray-50 dark:bg-gray-900 scrollbar-auto">
    <div
      class="grid gap-4"
      :class="gridColumns"
    >
      <div
        v-for="(slide, index) in slides"
        :key="slide.pageIndex"
        class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden cursor-pointer transition-all group grid-card-3d"
        :style="getRandom3DStyle(index)"
        @click="handleCardClick(index)"
      >
        <!-- Page Badge -->
        <div
          class="absolute top-2 right-2 w-8 h-8 max-[450px]:w-6 max-[450px]:h-6 bg-primary/80 dark:bg-primary-600 text-white dark:text-gray-100 rounded-full flex items-center justify-center font-bold text-xs max-[450px]:text-[10px] z-10"
        >
          {{ slide.pageIndex }}
        </div>

        <!-- Video Title Overlay (only for video slides, shows on hover) -->
        <div
          v-if="isVideoSlide(slide)"
          class="absolute inset-0 bg-black/70 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20"
        >
          <h3 class="text-lg max-[450px]:text-base font-bold text-white px-4 text-center">
            {{ slide.title }}
          </h3>
        </div>

        <!-- Card Preview -->
        <div class="p-4 max-[450px]:p-2">
          <h3 
            v-if="!isVideoSlide(slide)"
            class="text-sm max-[450px]:text-xs font-bold mb-2 line-clamp-2 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent"
          >
            {{ slide.title }}
          </h3>
          <div
            v-if="!isVideoSlide(slide)"
            class="text-xs max-[450px]:text-[10px] text-gray-600 dark:text-gray-300 line-clamp-3"
          >
            {{ getContentPreview(slide.content) }}
          </div>
          <!-- Video placeholder for video slides -->
          <div
            v-if="isVideoSlide(slide)"
            class="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-700 rounded"
          >
            <span class="text-gray-500 dark:text-gray-400 text-xs max-[450px]:text-[10px]">Video: {{ slide.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SlideCard, ContentItem, ContentStats } from "@/data/types";

const props = defineProps<{
  slides: SlideCard[];
}>();

const emit = defineEmits<{
  "card-click": [index: number];
}>();

const gridColumns = computed(() => {
  return {
    "grid-cols-2": true, // < 360px
    "min-[360px]:grid-cols-3": true, // sm
    "md:grid-cols-4": true,
    "lg:grid-cols-5": true,
    "xl:grid-cols-6": true,
  };
});

/**
 * Convert content to a preview string for grid display
 */
const getContentPreview = (content: string | ContentItem[] | ContentStats): string => {
  // If content is a string, return it directly (truncated)
  if (typeof content === "string") {
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, "");
    return textContent.substring(0, 150);
  }

  // If content is an array of ContentItem
  if (Array.isArray(content)) {
    const preview = content
      .map((item: ContentItem) => {
        let text = item.title;
        if (item.description) {
          text += `: ${item.description}`;
        }
        return text;
      })
      .join(". ");
    return preview.substring(0, 150);
  }

  // If content is ContentStats
  if (typeof content === "object" && "type" in content && content.type === "stats") {
    const stats = content as ContentStats;
    if (stats.text) {
      return stats.text.substring(0, 150);
    }
    const statsText = stats.stats.map((stat) => `${stat.label}: ${stat.value}`).join(", ");
    return statsText.substring(0, 150);
  }

  return "";
};

const handleCardClick = (index: number) => {
  emit("card-click", index);
};

/**
 * Check if a slide is a video slide
 */
const isVideoSlide = (slide: SlideCard): boolean => {
  return slide.type === "Video" && !!slide.video;
};

/**
 * Get the number of columns based on screen size
 * Uses a reasonable default that works for most screen sizes
 */
const getColumnCount = (): number => {
  if (typeof window === 'undefined') return 4; // SSR fallback
  
  const width = window.innerWidth;
  if (width >= 1280) return 6; // xl
  if (width >= 1024) return 5; // lg
  if (width >= 768) return 4;  // md
  if (width >= 360) return 3; // sm
  return 2; // < 360px
};

/**
 * Generate random 3D transform values for each card based on index
 * Rotation varies from left (negative) to right (positive) based on column position
 */
const getRandom3DStyle = (index: number): Record<string, string> => {
  // Calculate column position (0-based)
  const columnCount = getColumnCount();
  const columnIndex = index % columnCount;
  
  // Normalize column position to 0-1 range (0 = leftmost, 1 = rightmost)
  const normalizedPosition = columnCount > 1 ? columnIndex / (columnCount - 1) : 0.5;
  
  // Map position to rotation: left (-3deg) to right (+3deg)
  // Left side rotates left (negative), right side rotates right (positive)
  const baseRotateY = (normalizedPosition - 0.5) * 6; // Range: -3 to +3 degrees
  
  // Add random variation based on index for uniqueness
  const seed = index * 17 + 23;
  const randomVariation = ((seed % 5) - 2) * 0.4; // Small random variation: -0.8 to +0.8 degrees
  const rotateY = baseRotateY + randomVariation;
  
  // Random X rotation and Z translation (independent of position)
  const rotateX = ((seed % 5) - 2) * 0.6; // Range: -1.2 to 1.2 degrees
  const translateZ = 8 + ((seed % 5) * 2); // Range: 8 to 16px
  
  // Store values in CSS custom properties for hover effect
  return {
    '--rotate-y': `${rotateY}deg`,
    '--rotate-x': `${rotateX}deg`,
    '--translate-z': `${translateZ}px`,
  };
};
</script>

<style scoped>
/* Random 3D hover effect for grid cards */
.grid-card-3d {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.grid-card-3d:hover {
  transform: perspective(1000px) 
    rotateY(var(--rotate-y, 2deg)) 
    rotateX(var(--rotate-x, -1deg)) 
    translateZ(var(--translate-z, 10px));
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
              0 0 20px rgba(4, 81, 116, 0.2);
}

/* Disable 3D effect on touch devices to prevent issues */
@media (hover: none) {
  .grid-card-3d:hover {
    transform: none;
    box-shadow: inherit;
  }
}
</style>

