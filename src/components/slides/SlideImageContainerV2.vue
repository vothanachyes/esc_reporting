<template>
  <div
    class="flex items-start md:items-center w-full image-container-responsive"
    :class="[
      containerClass,
      props.isPrintMode ? 'overflow-visible min-h-0 print-image-container' : 'overflow-hidden'
    ]"
    :style="containerStyle"
    ref="containerRef"
  >
    <!-- Single Image -->
    <div 
      v-if="layout === 'single' && images.length === 1" 
      class="w-full cursor-pointer flex items-center justify-center"
      :class="props.isPrintMode ? 'min-h-0 print-image-single' : 'h-full'"
      @click="!props.isPrintMode && handleImageClick(0)"
    >
      <img
        :src="getImageUrl(images[0])"
        :alt="images[0].alt || 'Slide image'"
        :class="props.isPrintMode ? 'w-full h-auto object-contain rounded-lg' : 'w-full h-full object-contain rounded-lg'"
      />
    </div>

    <!-- Grid Layout for Multiple Images -->
    <div
      v-else-if="layout === 'grid'"
      class="w-full image-grid"
      :class="props.isPrintMode 
        ? 'min-h-0 overflow-visible print-image-grid' 
        : 'h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-auto'"
      :style="gridStyle"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="image-grid-item cursor-pointer"
        @click="!props.isPrintMode && handleImageClick(index)"
      >
        <img
          :src="getImageUrl(image)"
          :alt="image.alt || `Slide image ${index + 1}`"
          class="w-full h-auto rounded-lg object-cover"
        />
      </div>
    </div>

    <!-- Scrollable Layout for Many Images -->
    <div
      v-else-if="layout === 'scrollable'"
      class="w-full image-scrollable"
      :class="props.isPrintMode 
        ? 'min-h-0 overflow-visible print-image-scrollable' 
        : 'h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-auto'"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="image-scrollable-item mb-2 cursor-pointer"
        @click="!props.isPrintMode && handleImageClick(index)"
      >
        <img
          :src="getImageUrl(image)"
          :alt="image.alt || `Slide image ${index + 1}`"
          class="w-full h-auto rounded-md object-cover"
        />
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal
      v-if="!props.isPrintMode"
      v-model:visible="isModalVisible"
      :images="images"
      :initial-index="clickedImageIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ImageConfig, ImageAlignment, ImageLayout } from "@/data/types";
import ImageModal from "@/components/ui/ImageModal.vue";

const containerRef = ref<HTMLElement | null>(null);
const isModalVisible = ref(false);
const clickedImageIndex = ref(0);

const props = defineProps<{
  images: ImageConfig[];
  alignment: ImageAlignment;
  containerWidth?: number; // Deprecated: kept for backward compatibility, ignored
  layout: ImageLayout;
  availableHeight?: number; // Available height for image container
  aspectRatios?: number[]; // Aspect ratios for all images
  cardHeight?: number; // Card height for max-height constraint
  isPrintMode?: boolean;
}>();

const handleImageClick = (index: number) => {
  if (props.isPrintMode) return;
  clickedImageIndex.value = index;
  isModalVisible.value = true;
};

const containerClass = computed(() => {
  // Mobile: left alignment -> image appears after text (bottom/right side visually) = order-last
  // Mobile: right alignment -> image appears before text (top/left side visually) = order-first
  // Desktop: left->justify-start, right->justify-end
  const baseClass = props.alignment === "left"
    ? "md:justify-start order-last md:order-none"
    : "md:justify-end order-first md:order-none";
  return baseClass;
});

/**
 * Calculate optimal column count for grid layout (helper function, doesn't depend on calculated dimensions)
 */
const calculateGridColumns = (imageCount: number): number => {
  if (imageCount <= 2) {
    return imageCount;
  }
  if (imageCount <= 4) {
    return 2;
  }
  if (imageCount <= 9) {
    return 3;
  }
  return 4;
};

/**
 * Check if images are positioned above content (mobile with right alignment)
 */
const isImagesAboveContent = computed(() => {
  const isMobile = window.innerWidth < 768;
  // Right alignment on mobile means images come first (order-first), so they're above content
  return isMobile && props.alignment === "right";
});

/**
 * Calculate optimal container dimensions based on available height and image aspect ratios
 */
const calculatedDimensions = computed(() => {
  // If no available height or aspect ratios provided, fall back to old behavior
  if (!props.availableHeight || !props.aspectRatios || props.aspectRatios.length === 0) {
    return {
      width: props.containerWidth ? `${props.containerWidth}%` : "40%",
      height: "100%",
    };
  }

  let availableH = props.availableHeight;
  const isMobile = window.innerWidth < 768;

  // If images are above content, constrain height to max 60% of card height
  if (isImagesAboveContent.value && props.cardHeight) {
    const maxHeight = props.cardHeight * 0.6;
    availableH = Math.min(availableH, maxHeight);
  }

  // On mobile, use full width
  if (isMobile) {
    return {
      width: "100%",
      height: `${availableH}px`,
      maxHeight: isImagesAboveContent.value && props.cardHeight ? `${props.cardHeight * 0.6}px` : undefined,
      minHeight: `${availableH}px`,
    };
  }

  // On desktop, calculate width based on aspect ratio and available height
  let calculatedWidth: number;

  if (props.layout === "single" && props.aspectRatios.length > 0) {
    // Single image: width = height * aspectRatio
    const aspectRatio = props.aspectRatios[0];
    calculatedWidth = availableH * aspectRatio;
  } else if (props.layout === "grid" && props.aspectRatios.length > 0) {
    // Grid layout: calculate based on first image and grid structure
    const aspectRatio = props.aspectRatios[0];
    const columnCount = calculateGridColumns(props.images.length);
    
    // For grid, we want to ensure at least one row is visible
    // Calculate width per column, then multiply by column count
    const heightPerRow = availableH / Math.ceil(props.images.length / columnCount);
    const widthPerColumn = heightPerRow * aspectRatio;
    calculatedWidth = widthPerColumn * columnCount;
  } else if (props.layout === "scrollable" && props.aspectRatios.length > 0) {
    // Scrollable layout: ensure first image fits, calculate width from its aspect ratio
    const aspectRatio = props.aspectRatios[0];
    // Use available height for first image
    calculatedWidth = availableH * aspectRatio;
  } else {
    // Fallback: use first aspect ratio or default
    const aspectRatio = props.aspectRatios[0] || 16 / 9;
    calculatedWidth = availableH * aspectRatio;
  }

  // Constrain width to not exceed 60% of container (leave space for text)
  const maxWidth = window.innerWidth * 0.6;
  calculatedWidth = Math.min(calculatedWidth, maxWidth);

  // Ensure minimum width
  const minWidth = 200;
  calculatedWidth = Math.max(calculatedWidth, minWidth);

  return {
    width: `${calculatedWidth}px`,
    height: `${availableH}px`,
    maxHeight: isImagesAboveContent.value && props.cardHeight ? `${props.cardHeight * 0.6}px` : undefined,
    minHeight: `${availableH}px`,
  };
});

const containerStyle = computed(() => {
  // In print mode, allow auto height
  if (props.isPrintMode) {
    return {
      width: "100%",
      height: "auto",
      minHeight: "0",
      maxHeight: "none",
    };
  }

  const dims = calculatedDimensions.value;
  
  // Mobile: full width (handled by w-full class)
  // Desktop: use calculated width
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    const style: Record<string, string | undefined> = {
      height: dims.height,
      minHeight: dims.minHeight,
      maxHeight: dims.maxHeight,
    };
    return style;
  }

  const style: Record<string, string | undefined> = {
    width: dims.width,
    height: dims.height,
    minHeight: dims.minHeight,
    maxHeight: dims.maxHeight,
    "--image-container-width": dims.width, // Keep for CSS compatibility
  };
  return style;
});

/**
 * Calculate optimal column count based on number of images and calculated width
 * Better detection for better visual layout
 */
const getOptimalColumns = computed(() => {
  const imageCount = props.images.length;
  const dims = calculatedDimensions.value;
  const calculatedWidthPx = typeof dims.width === "string" 
    ? parseFloat(dims.width.replace("px", "")) 
    : 0;
  const containerWidthPercent = calculatedWidthPx > 0 
    ? (calculatedWidthPx / window.innerWidth) * 100 
    : (props.containerWidth || 40);
  
  // For small number of images, use fewer columns for better display
  if (imageCount <= 2) {
    return imageCount; // 1 or 2 columns
  }
  
  // For medium number of images (3-6), use 2-3 columns
  if (imageCount <= 4) {
    // On mobile: 1 column, on desktop: 2 columns
    return { mobile: 1, desktop: 2 };
  }
  
  // For many images (5-9), use 2-3 columns based on container width
  if (imageCount <= 9) {
    if (containerWidthPercent >= 50) {
      return { mobile: 2, desktop: 3 };
    } else if (containerWidthPercent >= 40) {
      return { mobile: 1, desktop: 2 };
    } else {
      return { mobile: 1, desktop: 2 };
    }
  }
  
  // For many images (10+), use more columns
  if (containerWidthPercent >= 50) {
    return { mobile: 2, desktop: 4 };
  } else if (containerWidthPercent >= 40) {
    return { mobile: 2, desktop: 3 };
  } else {
    return { mobile: 1, desktop: 2 };
  }
});

const gridStyle = computed(() => {
  const columns = getOptimalColumns.value;
  
  if (typeof columns === 'number') {
    return {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    };
  }
  
  return {
    gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
    '--desktop-columns': String(columns.desktop),
  };
});

const getImageUrl = (image: ImageConfig): string => {
  // Handle local images
  if (image.local) {
    return image.url.startsWith("/") ? image.url : `/${image.url}`;
  }
  // Handle remote URLs
  return image.url;
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

/* Grid Layout for Multiple Images */
.image-grid {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  min-height: 0;
}

.image-grid-item {
  width: 100%;
  min-height: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.image-grid-item:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

.image-grid-item img {
  width: 100%;
  height: auto;
  min-height: 100px;
  border-radius: 0.5rem;
  object-fit: cover;
  aspect-ratio: auto;
  display: block;
}

/* Desktop: adjust columns */
@media (min-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(var(--desktop-columns, 2), 1fr) !important;
    gap: 0.75rem;
  }
}

/* Scrollable Layout for Many Images */
.image-scrollable {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-scrollable-item {
  width: 100%;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.image-scrollable-item:hover {
  transform: scale(1.01);
  opacity: 0.9;
}

.image-scrollable-item img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  object-fit: cover;
  aspect-ratio: auto;
}

@media (min-width: 768px) {
  .image-scrollable {
    gap: 0.75rem;
  }
}

/* Print mode styles */
.print-image-container {
  height: auto;
  min-height: 0;
}

.print-image-single {
  height: auto;
  min-height: 0;
}

.print-image-grid {
  height: auto;
  min-height: 0;
}

.print-image-scrollable {
  height: auto;
  min-height: 0;
}
</style>

