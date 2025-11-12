<template>
  <div
    class="h-full flex items-start md:items-center w-full overflow-hidden image-container-responsive"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Single Image -->
    <div v-if="layout === 'single' && images.length === 1" class="w-full h-full">
      <img
        :src="getImageUrl(images[0].url)"
        :alt="images[0].alt || 'Slide image'"
        class="w-full h-full object-contain rounded-lg"
      />
    </div>

    <!-- Pinterest-style Masonry Layout -->
    <div
      v-else-if="layout === 'grid' || layout === 'scrollable'"
      class="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-auto pinterest-masonry"
      :style="masonryStyle"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="pinterest-item break-inside-avoid mb-2"
      >
        <img
          :src="getImageUrl(image.url)"
          :alt="image.alt || `Slide image ${index + 1}`"
          class="w-full h-auto rounded-lg object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ImageConfig, ImageAlignment, ImageLayout } from "@/data/types";

const props = defineProps<{
  images: ImageConfig[];
  alignment: ImageAlignment;
  containerWidth: number;
  layout: ImageLayout;
}>();

const containerClass = computed(() => {
  // Mobile: left alignment -> image appears after text (bottom/right side visually) = order-last
  // Mobile: right alignment -> image appears before text (top/left side visually) = order-first
  // Desktop: left->justify-start, right->justify-end
  const baseClass = props.alignment === "left"
    ? "md:justify-start order-last md:order-none"
    : "md:justify-end order-first md:order-none";
  return baseClass;
});

const containerStyle = computed(() => {
  // Mobile: full width (handled by w-full class)
  // Desktop: use configured width percentage via inline style
  return {
    "--image-container-width": `${props.containerWidth}%`,
  };
});

const masonryStyle = computed(() => {
  // Pinterest-style: responsive column count based on container width
  // Mobile: always 2 columns
  // Desktop: adjust based on container width
  let columnCount = 2;
  
  // Only adjust columns on desktop (containerWidth is meaningful on desktop)
  // For mobile, always use 2 columns (handled by CSS media query)
  if (props.containerWidth >= 50) {
    columnCount = 4; // Large containers: 4 columns
  } else if (props.containerWidth >= 40) {
    columnCount = 3; // Medium containers: 3 columns
  } else {
    columnCount = 2; // Small/very small containers: 2 columns
  }
  
  return {
    "--masonry-columns": String(columnCount),
    columnCount: columnCount,
    columnGap: "0.5rem",
  };
});

const getImageUrl = (url: string): string => {
  // Handle local images
  if (url.startsWith("/") || url.startsWith("./")) {
    return url;
  }
  // Handle remote URLs
  return url;
};
</script>

<style scoped>
.image-container-responsive {
  width: 100%;
}

@media (min-width: 768px) {
  .image-container-responsive {
    width: var(--image-container-width);
  }
}

/* Pinterest-style Masonry Layout */
.pinterest-masonry {
  column-fill: balance;
  column-gap: 0.5rem;
  /* Mobile: always 2 columns */
  column-count: 2;
}

.pinterest-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 0.5rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pinterest-item img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
  object-fit: cover;
}

.pinterest-item:hover img {
  transform: scale(1.02);
  opacity: 0.9;
}

/* Desktop: use dynamic column count based on container width */
@media (min-width: 768px) {
  .pinterest-masonry {
    column-count: var(--masonry-columns, 2);
    column-gap: 0.75rem;
  }
  
  .pinterest-item {
    margin-bottom: 0.75rem;
  }
}
</style>

