<template>
  <div
    class="relative w-full flex items-center justify-center"
    :class="props.isPrintMode ? 'min-h-0' : 'h-full'"
  >
      <!-- Card Container with rounded corners, shadow, and default bg -->
      <div
        class="relative flex items-center justify-center backdrop-blur-sm"
        :class="[
          props.isPrintMode 
            ? 'w-full rounded-none p-2 print-card-container'
            : (isImageTypeSlide || isVideoTypeSlide) 
              ? 'w-full rounded-none p-0 h-full' 
              : 'w-[92%] max-[450px]:w-[99%] rounded-3xl max-[450px]:rounded-lg shadow-2xl dark:shadow-gray-900/50 p-5 max-[450px]:p-2 border border-white/10 dark:border-gray-700/30 h-full',
          cardBgClass,
          enable3DHover && !props.isPrintMode ? 'card-3d-hover' : ''
        ]"
        :style="mergedCardStyle"
      >
        <!-- Inner wrapper for GSAP animations - separate from scroll snap container -->
        <div
          ref="cardRef"
          class="relative w-full flex items-start justify-center"
          :class="props.isPrintMode 
            ? 'overflow-visible min-h-0 print-card-inner' 
            : 'h-full overflow-hidden rounded-3xl max-[450px]:rounded-lg'"
        >
        <!-- Page Number Badge - Editable -->
        <div
          v-if="!isEditingPageNumber"
          @click="startEditingPageNumber"
          class="absolute top-[5px] right-[5px] w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-primary/90 dark:bg-primary-600/90 text-white dark:text-gray-100 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] md:text-xs z-10 shadow-lg backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-primary dark:hover:bg-primary-600 transition-colors"
          :title="`Click to navigate to a page (1-${totalPages})`"
        >
          {{ pageIndex }}/{{ totalPages }}
        </div>
        <input
          v-else
          ref="pageNumberInputRef"
          v-model="pageNumberInputValue"
          type="number"
          :min="1"
          :max="totalPages"
          @keydown.enter="handlePageNumberEnter"
          @keydown.escape="cancelEditingPageNumber"
          @input="handlePageNumberInput"
          @blur="handlePageNumberBlur"
          class="absolute top-[5px] right-[5px] w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-primary dark:bg-primary-600 text-white dark:text-gray-100 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] md:text-xs z-10 shadow-lg backdrop-blur-sm border-2 border-white/40 dark:border-white/40 text-center focus:outline-none focus:ring-2 focus:ring-white/50 cursor-text"
        />

        <!-- Maximize Button - Positioned to avoid page number badge -->
        <button
          v-if="!props.isPrintMode && !isGlobalMaximized.value"
          @click="handleMaximize"
          class="absolute top-[5px] right-[50px] sm:right-[55px] md:right-[60px] w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-105 active:scale-95 cursor-pointer z-20"
          aria-label="Maximize slide"
        >
          <i class="pi pi-window-maximize text-xs"></i>
        </button>

        <!-- Content Container Wrapper - Clips absolutely positioned content -->
        <div 
          class="w-full relative"
          :class="props.isPrintMode ? 'overflow-visible min-h-0' : 'h-full overflow-hidden'"
        >
          <!-- Content Container -->
          <div 
            ref="contentContainerRef"
            class="w-full flex flex-col md:flex-row gap-8 py-2"
            :class="[
              props.isPrintMode 
                ? 'overflow-visible min-h-0 print-content-container' 
                : 'h-full overflow-y-auto overflow-x-hidden scrollable-content',
              hasNoMedia ? 'items-center md:items-center justify-center md:justify-center' : 'items-start md:items-start'
            ]"
          >
        <!-- Video Container -->
        <SlideVideoContainer
          v-if="card.video && !isTableContent"
          :video="card.video"
        />

        <!-- Image Container -->
        <SlideImageContainer
          v-if="card.images && card.images.length > 0 && !isTableContent && !card.video"
          :images="card.images"
          :alignment="card.imageAlignment || 'right'"
          :layout="getImageLayout"
          :available-height="availableHeight"
          :aspect-ratios="aspectRatios"
          :card-height="cardHeight"
          :is-print-mode="props.isPrintMode"
        />

          <!-- Table Container - For appendix slides -->
          <TableSlide
            v-if="isTableContent"
            :title="card.title"
            :subtitles="subtitles"
            :table-data="card.content as ContentTable"
            :is-print-mode="props.isPrintMode"
          />

          <!-- Text Container - Hide if Image/Video type with empty content or if table content -->
          <SlideTextContainer
            v-if="!isTableContent && (!isImageTypeSlide && !isVideoTypeSlide || hasContent) && textContent"
            :title="card.title"
            :subtitles="subtitles"
            :content="textContent"
            :width="textContainerWidth"
            :is-print-mode="props.isPrintMode"
            :has-images="!!((card.images && card.images.length > 0) || card.video)"
            :slide-type="card.type"
          />
          </div>
        </div>
      </div>
    </div>

    <!-- Maximize Dialog -->
    <Teleport to="body">
      <PrimeDialog
        v-model:visible="isMaximizedDialogVisible"
        modal
        :closable="true"
        :draggable="false"
        :maximizable="false"
        class="slide-maximize-dialog"
        :pt="{
          root: { class: 'w-full h-full max-w-full max-h-full m-0' },
          content: { class: 'p-6 h-full flex flex-col' },
          header: { class: 'flex-shrink-0' },
        }"
        @hide="handleMinimize"
      >
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col gap-1">
              <h3 class="text-xl font-bold text-white dark:text-gray-100">{{ card.title }}</h3>
              <div v-if="subtitles.length > 0" class="flex flex-col gap-0.5">
                <span
                  v-for="(subtitle, index) in subtitles"
                  :key="index"
                  class="text-sm text-gray-300 dark:text-gray-400"
                >
                  {{ subtitle }}
                </span>
              </div>
            </div>
            <button
              @click="handleMinimize"
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-105 active:scale-95"
              aria-label="Minimize slide"
            >
              <i class="pi pi-window-minimize text-sm"></i>
            </button>
          </div>
        </template>
        
        <div class="flex-1 overflow-hidden min-h-0">
          <!-- Render slide content directly in maximized view -->
          <div class="w-full h-full relative flex items-center justify-center">
            <div class="relative w-full h-full flex items-center justify-center backdrop-blur-sm">
              <div
                class="relative flex items-center justify-center w-full h-full rounded-3xl shadow-2xl dark:shadow-gray-900/50 p-5 border border-white/10 dark:border-gray-700/30"
                :style="mergedCardStyle"
              >
                <div class="relative w-full h-full flex items-start justify-center overflow-hidden rounded-3xl">
                  <div class="w-full relative h-full overflow-hidden">
                    <div class="w-full h-full flex flex-col md:flex-row gap-8 py-2 overflow-y-auto overflow-x-hidden scrollable-content">
                      <!-- Video Container -->
                      <SlideVideoContainer
                        v-if="card.video && !isTableContent"
                        :video="card.video"
                      />

                      <!-- Image Container -->
                      <SlideImageContainer
                        v-if="card.images && card.images.length > 0 && !isTableContent && !card.video"
                        :images="card.images"
                        :alignment="card.imageAlignment || 'right'"
                        :layout="getImageLayout"
                        :available-height="availableHeight"
                        :aspect-ratios="aspectRatios"
                        :card-height="cardHeight"
                        :is-print-mode="false"
                      />

                      <!-- Table Container -->
                      <TableSlide
                        v-if="isTableContent"
                        :title="card.title"
                        :subtitles="subtitles"
                        :table-data="card.content as ContentTable"
                        :is-print-mode="false"
                        :is-maximized="true"
                      />

                      <!-- Text Container -->
                      <SlideTextContainer
                        v-if="!isTableContent && (!isImageTypeSlide && !isVideoTypeSlide || hasContent) && textContent"
                        :title="card.title"
                        :subtitles="subtitles"
                        :content="textContent"
                        :width="textContainerWidth"
                        :is-print-mode="false"
                        :has-images="!!((card.images && card.images.length > 0) || card.video)"
                        :slide-type="card.type"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PrimeDialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Teleport } from "vue";
import type { SlideCard, ImageLayout } from "@/data/types";
import { gsap } from "gsap";
import PrimeDialog from "primevue/dialog";
import SlideImageContainer from "./SlideImageContainer.vue";
import SlideTextContainer from "./SlideTextContainer.vue";
import SlideVideoContainer from "./SlideVideoContainer.vue";
import TableSlide from "./TableSlide.vue";
import { useGSAPAnimations } from "@/composables/useGSAPAnimations";
import { useDarkMode } from "@/composables/useDarkMode";
import { useCardHeight } from "@/composables/useCardHeight";
import { useImageDimensions } from "@/composables/useImageDimensions";
import { useMaximizeMode } from "@/composables/useMaximizeMode";
import type { ContentTable, ContentItem, ContentStats } from "@/data/types";

const props = defineProps<{
  card: SlideCard;
  pageIndex: number;
  totalPages: number;
  isActive: boolean;
  enable3DHover?: boolean;
  isPrintMode?: boolean;
}>();

const emit = defineEmits<{
  "navigate-to-page": [pageNumber: number];
}>();

const cardRef = ref<HTMLElement | null>(null);
const pageNumberInputRef = ref<HTMLInputElement | null>(null);
const contentContainerRef = ref<HTMLElement | null>(null);
const { animateIn, animateOut } = useGSAPAnimations();
const { isDark } = useDarkMode();
const { isMaximized: isGlobalMaximized, setMaximized, clearMaximized } = useMaximizeMode();
const isMaximizedDialogVisible = ref(false);
const slideId = `slide-${props.pageIndex}-${props.card.title}`;
// Track current animation timeline for proper cleanup
let currentAnimation: gsap.core.Timeline | null = null;

// Page number editing state
const isEditingPageNumber = ref(false);
const pageNumberInputValue = ref<string>("");
let pageNumberDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Use composables for image dimensions and card height
const { availableHeight } = useCardHeight(contentContainerRef);
const { getAspectRatio } = useImageDimensions(props.card.images || []);

// Calculate actual card height for max-height constraint (use cardRef which is the inner wrapper)
const cardHeight = computed(() => {
  if (!cardRef.value) return 0;
  return cardRef.value.clientHeight;
});

// Calculate aspect ratios for all images
const aspectRatios = computed(() => {
  if (!props.card.images || props.card.images.length === 0) {
    return [];
  }
  return props.card.images.map((image) => getAspectRatio(image));
});

/**
 * Generate a random gradient degree based on pageIndex for consistency
 * Each slide will have the same gradient direction every time
 */
const getGradientDegree = (pageIndex: number): number => {
  // Use pageIndex as seed for consistent random gradient per slide
  // Generate degree between 135 and 225 (similar to header's 135deg)
  const seed = pageIndex * 17; // Prime number for better distribution
  return 135 + (seed % 90); // Range: 135-224 degrees
};

const cardBgClass = computed(() => {
  // Default to primary dark background if no custom background is set
  const bg = props.card.background;
  if (!bg || (!bg.bgColor && !bg.bgImg)) {
    return "";
  }
  return "";
});

const cardStyle = computed(() => {
  const bg = props.card.background;
  const style: Record<string, string> = {};

  // If no background is set, use random gradient like header
  if (!bg || (!bg.bgColor && !bg.bgImg)) {
    const gradientDegree = getGradientDegree(props.pageIndex);
    
    if (isDark.value) {
      // Dark mode: darker gradient
      style.background = `linear-gradient(${gradientDegree}deg, #022f40 0%, #011e26 100%)`;
    } else {
      // Light mode: lighter gradient (similar to header)
      style.background = `linear-gradient(${gradientDegree}deg, #022f40 0%, #011e26 100%)`;
    }
    style.opacity = "0.95";
    return style;
  }

  if (bg.bgColor) {
    style.backgroundColor = bg.bgColor;
    if (bg.bgOpacity !== undefined) {
      style.opacity = String(bg.bgOpacity);
    }
  }

  if (bg.bgImg) {
    style.backgroundImage = `url(${bg.bgImg})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    style.backgroundColor = bg.bgColor || "#022f40"; // Fallback to primary-700 if no bgColor
    if (bg.bgOpacity !== undefined) {
      style.opacity = String(bg.bgOpacity);
    }
  }

  return style;
});

const subtitles = computed(() => {
  if (!props.card.subtitle) return [];
  return Array.isArray(props.card.subtitle) ? props.card.subtitle : [props.card.subtitle];
});

const getImageLayout = computed((): ImageLayout => {
  if (!props.card.images) return "single";
  if (props.card.images.length === 1) return "single";
  if (props.card.images.length <= 4) return "grid";
  return "scrollable";
});

const isImageTypeSlide = computed(() => {
  // Check if content is empty (string, array, or object)
  const isEmptyContent = () => {
    if (!props.card.content) return true;
    if (typeof props.card.content === "string") {
      return props.card.content.trim() === "";
    }
    if (Array.isArray(props.card.content)) {
      return props.card.content.length === 0;
    }
    // For ContentStats, check if it has no meaningful content
    if (typeof props.card.content === "object" && "type" in props.card.content) {
      return false; // Stats always has content
    }
    return false;
  };

  return props.card.type === "Image" &&
         props.card.images &&
         props.card.images.length === 1 &&
         isEmptyContent();
});

const isVideoTypeSlide = computed(() => {
  // Check if content is empty (string, array, or object)
  const isEmptyContent = () => {
    if (!props.card.content) return true;
    if (typeof props.card.content === "string") {
      return props.card.content.trim() === "";
    }
    if (Array.isArray(props.card.content)) {
      return props.card.content.length === 0;
    }
    // For ContentStats, check if it has no meaningful content
    if (typeof props.card.content === "object" && "type" in props.card.content) {
      return false; // Stats always has content
    }
    return false;
  };

  return props.card.type === "Video" &&
         props.card.video &&
         isEmptyContent();
});

const textContainerWidth = computed(() => {
  if (!props.card.images || props.card.images.length === 0) return "100%";
  // On mobile, text takes full width when images are stacked
  // On desktop, use the configured width
  return "md:w-auto w-full";
});

const hasNoMedia = computed(() => {
  return (!props.card.images || props.card.images.length === 0) && !props.card.video;
});

const hasContent = computed(() => {
  if (!props.card.content) return false;
  if (typeof props.card.content === "string") {
    return props.card.content.trim() !== "";
  }
  if (Array.isArray(props.card.content)) {
    return props.card.content.length > 0;
  }
  // For ContentStats and ContentTable, always has content
  if (typeof props.card.content === "object" && "type" in props.card.content) {
    return true;
  }
  return false;
});

const isTableContent = computed(() => {
  return (
    typeof props.card.content === "object" &&
    props.card.content !== null &&
    "type" in props.card.content &&
    props.card.content.type === "table"
  );
});

/**
 * Get content for SlideTextContainer, excluding ContentTable
 * TypeScript type guard to ensure proper type narrowing
 */
const textContent = computed(() => {
  if (isTableContent.value) {
    return null;
  }
  // At this point, TypeScript knows content is not ContentTable
  return props.card.content as string | ContentItem[] | ContentStats;
});

/**
 * Get reduction factor for 3D effect based on screen size
 * Reduces effect on screens larger than sm (640px)
 */
const get3DReductionFactor = (): number => {
  if (typeof window === 'undefined') return 0.3; // SSR fallback
  
  const width = window.innerWidth;
  // sm breakpoint is 640px, so > sm means > 640px
  if (width > 640) {
    return 0.3; // Reduce to 30% on screens larger than sm (more subtle)
  }
  return 0.6; // Reduced effect on sm and smaller screens (was 1.0)
};

/**
 * Generate 3D transform values based on slide position
 * Rotation varies from left (negative) to right (positive) based on position in sequence
 * Reduced values for a more subtle effect
 */
const get3DStyle = computed((): Record<string, string> => {
  if (!props.enable3DHover) return {};
  
  // Get reduction factor for larger screens
  const reductionFactor = get3DReductionFactor();
  
  // Normalize position to 0-1 range (0 = first slide, 1 = last slide)
  const normalizedPosition = props.totalPages > 1 
    ? (props.pageIndex - 1) / (props.totalPages - 1) 
    : 0.5;
  
  // Map position to rotation: left (-1.5deg) to right (+1.5deg) - reduced from -3 to +3
  // First slides rotate left (negative), last slides rotate right (positive)
  const baseRotateY = (normalizedPosition - 0.5) * 3; // Range: -1.5 to +1.5 degrees (reduced from 6)
  
  // Add random variation based on pageIndex for uniqueness
  const seed = props.pageIndex * 17 + 23;
  const randomVariation = ((seed % 5) - 2) * 0.15; // Small random variation: -0.3 to +0.3 degrees (reduced from 0.4)
  const rotateY = (baseRotateY + randomVariation) * reductionFactor;
  
  // Random X rotation and Z translation (independent of position) - reduced values
  const rotateX = ((seed % 5) - 2) * 0.3 * reductionFactor; // Range: -0.6 to 0.6 degrees (reduced from 0.6)
  const translateZ = (4 + ((seed % 5) * 1)) * reductionFactor; // Range: 4 to 8px (reduced from 8-16px)
  
  // Store values in CSS custom properties for hover effect
  return {
    '--rotate-y': `${rotateY}deg`,
    '--rotate-x': `${rotateX}deg`,
    '--translate-z': `${translateZ}px`,
  };
});

/**
 * Merge card style with 3D style
 */
const mergedCardStyle = computed(() => {
  return { ...cardStyle.value, ...get3DStyle.value };
});

/**
 * Clean up any existing animations
 * Ensures no animation conflicts during rapid navigation
 */
const cleanupAnimation = () => {
  if (currentAnimation) {
    currentAnimation.kill();
    currentAnimation = null;
  }
};

/**
 * Trigger animation based on direction (in/out)
 * Handles all navigation methods: scroll, keydown, click
 * Respects animation settings from JSON
 */
const triggerAnimation = (direction: "in" | "out") => {
  if (!cardRef.value) return;

  // Clean up any existing animation first
  cleanupAnimation();

  // Use requestAnimationFrame to ensure element is visible and ready
  requestAnimationFrame(() => {
    if (!cardRef.value) {
      return;
    }

    if (direction === "in") {
      // Clear any previous transforms/opacity to start fresh
      gsap.set(cardRef.value, { clearProps: "all" });

      // Get animation types from card config (respects JSON settings)
      const animations = props.card.animationIn || [];

      // If no animations configured, just ensure element is visible
      if (animations.length === 0) {
        gsap.set(cardRef.value, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
        return;
      }

      // Set initial state based on animation types from JSON
      const initialProps: Record<string, number> = {};

      if (animations.includes("fade")) {
        initialProps.opacity = 0;
      }
      if (animations.includes("slideUp")) {
        initialProps.y = 50;
      }
      if (animations.includes("slideDown")) {
        initialProps.y = -50;
      }
      if (animations.includes("slideLeft")) {
        initialProps.x = 50;
      }
      if (animations.includes("slideRight")) {
        initialProps.x = -50;
      }
      if (animations.includes("scale")) {
        initialProps.scale = 0.8;
      }
      if (animations.includes("rotate")) {
        initialProps.rotation = -10;
      }

      // Set all initial properties at once
      if (Object.keys(initialProps).length > 0) {
        gsap.set(cardRef.value, initialProps);
      }

      // Small delay to ensure initial state is set, then animate
      requestAnimationFrame(() => {
        if (!cardRef.value) {
          return;
        }

        // Trigger animation using composable (respects JSON settings)
        const anim = animateIn(cardRef.value, animations);
        if (anim) {
          currentAnimation = anim;
          // Clean up reference when animation completes
          anim.eventCallback("onComplete", () => {
            currentAnimation = null;
          });
        }
      });
    } else {
      // Animation out - use animationOut settings from JSON
      const animations = props.card.animationOut || [];

      if (animations.length === 0) {
        // No out animation configured, just hide immediately
        gsap.set(cardRef.value, { opacity: 0 });
        return;
      }

      // Trigger animation using composable (respects JSON settings)
      const anim = animateOut(cardRef.value, animations);
      if (anim) {
        currentAnimation = anim;
        // Clean up reference when animation completes
        anim.eventCallback("onComplete", () => {
          currentAnimation = null;
        });
      }
    }
  });
};

/**
 * Watch for active state changes
 * This triggers animations for all navigation methods:
 * - Scroll navigation (via isActive prop change)
 * - Keyboard navigation (via isActive prop change)
 * - Click navigation from GridView (via isActive prop change)
 */
watch(
  () => props.isActive,
  (isActive, wasActive) => {
    // Skip animations in print mode
    if (props.isPrintMode) return;
    
    // Only trigger if state actually changed
    if (isActive === wasActive) return;

    if (!cardRef.value) return;

    // If becoming active, animate in
    // If becoming inactive, animate out
    if (isActive) {
      // Small delay to ensure scroll has settled (for scroll/keydown navigation)
      // This ensures animations trigger after scroll completes
      setTimeout(() => {
        if (cardRef.value && props.isActive) {
          triggerAnimation("in");
        }
      }, 50);
    } else {
      triggerAnimation("out");
    }
  },
  { immediate: false }
);

onMounted(() => {
  // Skip animations in print mode
  if (props.isPrintMode) return;
  
  // If this slide is already active on mount, trigger animation
  if (cardRef.value && props.isActive) {
    // Use a small delay to ensure DOM is fully ready
    nextTick(() => {
      requestAnimationFrame(() => {
        if (cardRef.value && props.isActive) {
          triggerAnimation("in");
        }
      });
    });
  }
});

// Cleanup on unmount
onUnmounted(() => {
  cleanupAnimation();
  if (pageNumberDebounceTimer) {
    clearTimeout(pageNumberDebounceTimer);
    pageNumberDebounceTimer = null;
  }
});

function handleMaximize() {
  isMaximizedDialogVisible.value = true;
  setMaximized(slideId);
}

function handleMinimize() {
  isMaximizedDialogVisible.value = false;
  clearMaximized();
}

/**
 * Start editing page number
 */
function startEditingPageNumber() {
  if (props.isPrintMode) return;
  isEditingPageNumber.value = true;
  pageNumberInputValue.value = String(props.pageIndex);
  nextTick(() => {
    if (pageNumberInputRef.value) {
      pageNumberInputRef.value.focus();
      pageNumberInputRef.value.select();
    }
  });
}

/**
 * Cancel editing page number
 */
function cancelEditingPageNumber() {
  isEditingPageNumber.value = false;
  pageNumberInputValue.value = "";
  if (pageNumberDebounceTimer) {
    clearTimeout(pageNumberDebounceTimer);
    pageNumberDebounceTimer = null;
  }
}

/**
 * Navigate to the specified page number
 */
function navigateToPage(pageNumber: number) {
  // Clamp to valid range
  const clampedPage = Math.max(1, Math.min(Math.floor(pageNumber), props.totalPages));
  if (clampedPage !== props.pageIndex) {
    emit("navigate-to-page", clampedPage);
  }
  cancelEditingPageNumber();
}

/**
 * Handle Enter key press in page number input
 */
function handlePageNumberEnter() {
  const pageNumber = parseInt(pageNumberInputValue.value, 10);
  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= props.totalPages) {
    navigateToPage(pageNumber);
  } else {
    cancelEditingPageNumber();
  }
}

/**
 * Handle input in page number field - reset debounce timer
 */
function handlePageNumberInput() {
  // Clear existing debounce timer
  if (pageNumberDebounceTimer) {
    clearTimeout(pageNumberDebounceTimer);
    pageNumberDebounceTimer = null;
  }

  // Set new debounce timer for 3 seconds
  pageNumberDebounceTimer = setTimeout(() => {
    const pageNumber = parseInt(pageNumberInputValue.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= props.totalPages) {
      navigateToPage(pageNumber);
    } else {
      cancelEditingPageNumber();
    }
  }, 3000);
}

/**
 * Handle blur event - navigate if valid value
 */
function handlePageNumberBlur() {
  // Small delay to allow Enter key handler to fire first
  setTimeout(() => {
    const pageNumber = parseInt(pageNumberInputValue.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= props.totalPages) {
      navigateToPage(pageNumber);
    } else {
      cancelEditingPageNumber();
    }
  }, 100);
}

// Watch for external maximize state changes
watch(() => isGlobalMaximized.value, (maximized) => {
  if (!maximized && isMaximizedDialogVisible.value) {
    isMaximizedDialogVisible.value = false;
  }
});
</script>

<style scoped>
.scrollable-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(4, 81, 116, 0.5) transparent;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: rgba(4, 81, 116, 0.5);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(4, 81, 116, 0.7);
}

.dark .scrollable-content {
  scrollbar-color: rgba(4, 81, 116, 0.7) transparent;
}

.dark .scrollable-content::-webkit-scrollbar-thumb {
  background-color: rgba(4, 81, 116, 0.7);
}

.dark .scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(4, 81, 116, 0.9);
}

/* Subtle 3D hover effect with left-to-right variation - reduced intensity */
.card-3d-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.card-3d-hover:hover {
  transform: perspective(1000px) 
    rotateY(var(--rotate-y, 1deg)) 
    rotateX(var(--rotate-x, -0.5deg)) 
    translateZ(var(--translate-z, 5px));
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 
              0 0 10px rgba(4, 81, 116, 0.15);
}

/* Disable 3D effect on touch devices to prevent issues */
@media (hover: none) {
  .card-3d-hover:hover {
    transform: none;
    box-shadow: inherit;
  }
}

/* Page number input styling */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Print mode styles */
.print-card-container {
  min-height: auto;
  height: auto;
  page-break-inside: avoid;
  break-inside: avoid;
}

.print-card-inner {
  min-height: auto;
  height: auto;
}

.print-content-container {
  min-height: auto;
  height: auto;
}

/* Slide Maximize Dialog Styles */
:deep(.slide-maximize-dialog .p-dialog) {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

:deep(.slide-maximize-dialog .p-dialog-content) {
  height: calc(100vh - 120px) !important;
  padding: 1.5rem !important;
  background: linear-gradient(135deg, #022f40 0%, #011e26 100%);
}

:deep(.slide-maximize-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #022f40 0%, #011e26 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem !important;
}

:deep(.slide-maximize-dialog .p-dialog-mask) {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}
</style>

