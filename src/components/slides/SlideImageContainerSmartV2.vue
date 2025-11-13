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
      v-if="smartLayout.layoutType === 'single'" 
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

    <!-- Smart Grid Layout for Multiple Images -->
    <div
      v-else-if="smartLayout.layoutType === 'mixed' || smartLayout.layoutType === 'grid'"
      class="w-full image-grid-smart"
      :class="[
        props.isPrintMode 
          ? 'min-h-0 overflow-visible print-image-grid' 
          : 'h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-auto',
        smartLayout.layoutType === 'mixed' ? 'image-grid-mixed' : ''
      ]"
      :style="smartGridStyle"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="image-grid-item cursor-pointer"
        :class="{
          'image-full-width': smartLayout.fullWidthIndices.includes(index)
        }"
        :style="getImageItemStyle(index)"
        @click="!props.isPrintMode && handleImageClick(index)"
      >
        <img
          :src="getImageUrl(image)"
          :alt="image.alt || `Slide image ${index + 1}`"
          class="w-full h-auto rounded-lg object-contain"
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
          class="w-full h-auto rounded-md object-contain"
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

/**
 * Layout configuration type
 */
interface SmartLayoutConfig {
  layoutType: "single" | "mixed" | "grid";
  columns: number | { mobile: number; desktop: number };
  fullWidthIndices: number[];
  gridIndices: number[];
  gridColumns: number; // Number of columns for grid sections
}

/**
 * Check if aspect ratio represents landscape orientation
 */
const isLandscape = (aspectRatio: number): boolean => {
  return aspectRatio > 1;
};

/**
 * Check if aspect ratio represents portrait orientation
 */
const isPortrait = (aspectRatio: number): boolean => {
  return aspectRatio < 1;
};

/**
 * Case 2: Determine layout for 2 images based on their aspect ratios
 * Returns: number of columns (1 or 2)
 */
const getTwoImageLayout = (aspectRatios: number[]): number => {
  if (aspectRatios.length < 2) return 1;
  
  const [first, second] = aspectRatios;
  const firstLandscape = isLandscape(first);
  const secondLandscape = isLandscape(second);
  
  // If both landscape: 1 column
  if (firstLandscape && secondLandscape) {
    return 1;
  }
  
  // If both portrait: 2 columns
  if (isPortrait(first) && isPortrait(second)) {
    return 2;
  }
  
  // If one landscape, one portrait: 1 column
  return 1;
};

/**
 * Calculate smart layout based on image count and aspect ratios
 * Implements Case 1-4 logic
 */
const calculateSmartLayout = (images: ImageConfig[], aspectRatios: number[]): SmartLayoutConfig => {
  const imageCount = images.length;
  
  // Case 1: Single image - full width
  if (imageCount === 1) {
    return {
      layoutType: "single",
      columns: 1,
      fullWidthIndices: [0],
      gridIndices: [],
      gridColumns: 1,
    };
  }
  
  // Case 2: Two images
  if (imageCount === 2) {
    const columns = getTwoImageLayout(aspectRatios);
    return {
      layoutType: "grid",
      columns: columns,
      fullWidthIndices: [],
      gridIndices: [0, 1],
      gridColumns: columns,
    };
  }
  
  // Case 3: Three images
  if (imageCount === 3) {
    const firstAspectRatio = aspectRatios[0];
    
    // If first image is landscape: full width, remaining 2 apply Case 2
    if (isLandscape(firstAspectRatio)) {
      const remainingColumns = getTwoImageLayout([aspectRatios[1], aspectRatios[2]]);
      return {
        layoutType: "mixed",
        columns: remainingColumns,
        fullWidthIndices: [0],
        gridIndices: [1, 2],
        gridColumns: remainingColumns,
      };
    }
    
    // If first image is portrait: apply Case 2 logic to all 3
    // Determine columns based on first two images using Case 2 logic
    const gridCols = getTwoImageLayout([aspectRatios[0], aspectRatios[1]]);
    return {
      layoutType: "grid",
      columns: gridCols,
      fullWidthIndices: [],
      gridIndices: [0, 1, 2],
      gridColumns: gridCols,
    };
  }
  
  // Case 4: Four+ images
  const firstAspectRatio = aspectRatios[0];
  
  // If first image is landscape: full width, then apply Case 2 to next 2, continue pattern
  if (isLandscape(firstAspectRatio)) {
    const fullWidthIndices: number[] = [0];
    const gridIndices: number[] = [];
    let currentIndex = 1;
    
    // Process remaining images in pairs
    while (currentIndex < imageCount) {
      if (currentIndex + 1 < imageCount) {
        // Two images available, apply Case 2
        gridIndices.push(currentIndex, currentIndex + 1);
        currentIndex += 2;
      } else {
        // One image remaining, add to grid
        gridIndices.push(currentIndex);
        currentIndex += 1;
      }
    }
    
    // Determine grid columns based on first pair after full-width image
    const gridColumns = gridIndices.length >= 2 
      ? getTwoImageLayout([aspectRatios[gridIndices[0]], aspectRatios[gridIndices[1]]])
      : 1;
    
    return {
      layoutType: "mixed",
      columns: gridColumns,
      fullWidthIndices,
      gridIndices,
      gridColumns,
    };
  }
  
  // If first image is portrait: apply Case 2 logic to all images
  // Determine columns based on first two images using Case 2 logic
  const gridCols = aspectRatios.length > 1 
    ? getTwoImageLayout([aspectRatios[0], aspectRatios[1]])
    : 1;
  
  return {
    layoutType: "grid",
    columns: gridCols,
    fullWidthIndices: [],
    gridIndices: Array.from({ length: imageCount }, (_, i) => i),
    gridColumns: gridCols,
  };
};

/**
 * Get smart layout configuration
 */
const smartLayout = computed((): SmartLayoutConfig => {
  // If no aspect ratios provided, fall back to original layout logic
  if (!props.aspectRatios || props.aspectRatios.length === 0 || props.aspectRatios.length !== props.images.length) {
    // Fallback to original behavior
    if (props.images.length === 1) {
      return {
        layoutType: "single",
        columns: 1,
        fullWidthIndices: [0],
        gridIndices: [],
        gridColumns: 1,
      };
    }
    return {
      layoutType: "grid",
      columns: props.images.length <= 2 ? props.images.length : 2,
      fullWidthIndices: [],
      gridIndices: Array.from({ length: props.images.length }, (_, i) => i),
      gridColumns: props.images.length <= 2 ? props.images.length : 2,
    };
  }
  
  return calculateSmartLayout(props.images, props.aspectRatios);
});

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

  if (smartLayout.value.layoutType === "single" && props.aspectRatios.length > 0) {
    // Single image: width = height * aspectRatio
    const aspectRatio = props.aspectRatios[0];
    calculatedWidth = availableH * aspectRatio;
  } else if ((smartLayout.value.layoutType === "grid" || smartLayout.value.layoutType === "mixed") && props.aspectRatios.length > 0) {
    // Grid/Mixed layout: calculate based on layout structure
    if (smartLayout.value.layoutType === "mixed" && smartLayout.value.fullWidthIndices.length > 0) {
      // Mixed layout: use first full-width image for width calculation
      const firstFullWidthIndex = smartLayout.value.fullWidthIndices[0];
      const aspectRatio = props.aspectRatios[firstFullWidthIndex];
      calculatedWidth = availableH * aspectRatio;
    } else {
      // Grid layout: calculate based on first image and grid structure
      const aspectRatio = props.aspectRatios[0];
      const columnCount = typeof smartLayout.value.gridColumns === 'number' 
        ? smartLayout.value.gridColumns 
        : (smartLayout.value.gridColumns as { desktop?: number } | undefined)?.desktop || 2;
      
      // For grid, we want to ensure at least one row is visible
      // Calculate width per column, then multiply by column count
      const heightPerRow = availableH / Math.ceil(smartLayout.value.gridIndices.length / columnCount);
      const widthPerColumn = heightPerRow * aspectRatio;
      calculatedWidth = widthPerColumn * columnCount;
    }
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
 * Get grid style for smart layout
 */
const smartGridStyle = computed(() => {
  const layout = smartLayout.value;
  
  if (layout.layoutType === "single") {
    return {};
  }
  
  // For mixed layouts, we need to handle full-width items
  if (layout.layoutType === "mixed") {
    const columns = typeof layout.gridColumns === 'number' 
      ? layout.gridColumns 
      : (layout.gridColumns as { desktop?: number } | undefined)?.desktop || 2;
    
    return {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      '--grid-columns': String(columns),
    };
  }
  
  // For regular grid layouts
  const columns = typeof layout.columns === 'number' 
    ? layout.columns 
    : (layout.columns as { desktop?: number } | undefined)?.desktop || 2;
  
  return {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    '--grid-columns': String(columns),
  };
});

/**
 * Get style for individual image item
 */
const getImageItemStyle = (index: number): Record<string, string> => {
  const layout = smartLayout.value;
  const style: Record<string, string> = {};
  
  // If this image should span full width
  if (layout.fullWidthIndices.includes(index)) {
    style.gridColumn = '1 / -1';
  }
  
  return style;
};

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

/* Smart Grid Layout for Multiple Images */
.image-grid-smart {
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

.image-full-width {
  grid-column: 1 / -1;
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
  object-fit: contain;
  aspect-ratio: auto;
  display: block;
}

/* Desktop: adjust columns */
@media (min-width: 768px) {
  .image-grid-smart {
    grid-template-columns: repeat(var(--grid-columns, 2), 1fr) !important;
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
  object-fit: contain;
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

