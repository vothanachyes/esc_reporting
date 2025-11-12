<template>
  <div
    ref="containerRef"
    class="w-full h-full p-5 overflow-hidden slides-container"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <div ref="slidesWrapperRef" class="flex flex-row h-full" style="will-change: transform;">
      <SlideCardComponent
        v-for="(slide, index) in slides"
        :id="`slide-${index}`"
        :key="index"
        :ref="(el) => setSlideRef(el, index)"
        :card="slide"
        :page-index="index + 1"
        :total-pages="slides.length"
        :is-active="currentIndex === index"
        :enable3-d-hover="enable3DHover"
        class="h-full shrink-0 slide-item"
        :style="{ width: slideWidth > 0 ? `${slideWidth}px` : '100%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import type { SlideCard } from "@/data/types";
import SlideCardComponent from "./SlideCard.vue";

// Register Observer plugin
gsap.registerPlugin(Observer);

const props = defineProps<{
  slides: SlideCard[];
  initialIndex?: number;
  enable3DHover?: boolean;
}>();

const emit = defineEmits<{
  "slide-change": [index: number];
}>();

const containerRef = ref<HTMLElement | null>(null);
const slidesWrapperRef = ref<HTMLElement | null>(null);
// Store references to slide elements to get their actual width
const slideRefs = ref<(HTMLElement | null)[]>(Array.from({ length: props.slides.length }, () => null));
// Use array index (0-based) as single source of truth
const currentIndex = ref(props.initialIndex ?? 0);
const isInitialized = ref(false);
// Container width for slide sizing
const containerWidth = ref(0);

// Computed slide width (container width minus padding: p-5 = 20px each side = 40px total)
const slideWidth = computed(() => {
  if (containerWidth.value > 0) {
    return containerWidth.value - 40; // Account for p-5 padding (20px * 2)
  }
  return 0;
});
// GSAP Observer instance
let observer: Observer | null = null;
// Debounce timer for touch gestures to prevent rapid slide changes
let touchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Set slide element reference
 */
const setSlideRef = (el: unknown, index: number) => {
  if (!el) return;

  // Handle Vue component instance
  if (typeof el === "object" && "$el" in el) {
    slideRefs.value[index] = (el as { $el: HTMLElement }).$el;
  }
  // Handle direct HTMLElement
  else if (el instanceof HTMLElement) {
    slideRefs.value[index] = el;
  }
};

/**
 * Get the actual width of a slide element
 * Falls back to container width if slide width not available
 */
const getSlideWidth = (): number => {
  // Try to get width from first slide element (most accurate)
  const firstSlide = slideRefs.value[0];
  if (firstSlide instanceof HTMLElement) {
    const slideWidth = Number(firstSlide.offsetWidth) || 0;
    if (slideWidth > 0) {
      return slideWidth;
    }
  }

  // Fallback: use container's clientWidth (accounting for padding)
  // Since we're using GSAP transforms, we need the visible container width
  if (containerRef.value) {
    const containerWidth = Number(containerRef.value.clientWidth) || 0;
    // Account for padding: p-5 = 20px on each side = 40px total
    return Math.max(0, containerWidth - 40);
  }

  return 0;
};

/**
 * Scroll to a specific slide index using instant positioning
 * Provides instant slide transitions without animation
 */
const scrollToIndex = (index: number) => {
  if (!slidesWrapperRef.value) return;

  // Force numeric conversion and clamp index to valid range
  const numIndex = Number(index);
  if (!Number.isFinite(numIndex)) {
    return;
  }
  const clampedIndex = Math.max(0, Math.min(Math.floor(numIndex), props.slides.length - 1));

  // Get actual slide width
  const slideWidth = getSlideWidth();

  if (slideWidth > 0 && Number.isFinite(slideWidth)) {
    // Calculate target position (negative for left movement)
    const targetX = -(clampedIndex * slideWidth);

    // Set position instantly without animation
    gsap.set(slidesWrapperRef.value, { x: targetX });

    // Update current index and emit event immediately
    currentIndex.value = clampedIndex;
    emit("slide-change", clampedIndex);
  }
};

/**
 * Handle keyboard navigation
 * Provides instant slide transitions when user presses keys
 */
const handleKeyDown = (e: KeyboardEvent) => {
  // Don't handle if user is typing in an input/textarea
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (!containerRef.value) return;

  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    e.stopPropagation();
    const maxIndex = props.slides.length - 1;
    const nextIndex = Math.min(currentIndex.value + 1, maxIndex);
    if (nextIndex !== currentIndex.value) {
      scrollToIndex(nextIndex);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    e.stopPropagation();
    const prevIndex = Math.max(currentIndex.value - 1, 0);
    if (prevIndex !== currentIndex.value) {
      scrollToIndex(prevIndex);
    }
  }
};

/**
 * Watch for changes to initialIndex prop (e.g., from GridView click)
 * Navigates to the specified index without flicker
 * IMPORTANT: Only watches AFTER initialization to prevent race conditions
 */
watch(
  () => props.initialIndex,
  (newIndex) => {
    // CRITICAL: Only react if:
    // 1. Index is defined
    // 2. Different from current
    // 3. Component is fully initialized
    // 4. NOT during the initial mount phase (prevent race conditions)
    if (
      newIndex !== undefined
      && newIndex !== currentIndex.value
      && isInitialized.value
      && containerRef.value
    ) {
      const clampedIndex = Math.max(0, Math.min(newIndex, props.slides.length - 1));

      // Use nextTick to ensure DOM is ready
      nextTick(() => {
        // Use instant scroll to avoid flicker when clicking from grid view
        scrollToIndex(clampedIndex);
      });
    }
  },
  { immediate: false }
);

onMounted(() => {
  // Add window listener for keyboard events
  window.addEventListener("keydown", handleKeyDown);

  // Reset window scroll position to top
  window.scrollTo({ top: 0, behavior: "instant" });

  // Prevent browser scroll restoration
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // Determine starting index
  const startIndex = props.initialIndex !== undefined && Number.isFinite(Number(props.initialIndex))
    ? Number(props.initialIndex)
    : 0;

  const clampedStartIndex = Math.max(0, Math.min(Math.floor(startIndex), props.slides.length - 1));
  currentIndex.value = clampedStartIndex;

  // Initialize GSAP Observer and position after DOM is ready
  nextTick(() => {
    requestAnimationFrame(() => {
      if (!containerRef.value || !slidesWrapperRef.value) return;

      // Update container width
      containerWidth.value = containerRef.value.clientWidth;

      // Set initial position using GSAP
      const slideWidthValue = getSlideWidth();
      if (slideWidthValue > 0) {
        const initialX = -(clampedStartIndex * slideWidthValue);
        gsap.set(slidesWrapperRef.value, { x: initialX });
      }

      // Update container width on resize
      const updateContainerWidth = () => {
        if (containerRef.value) {
          containerWidth.value = containerRef.value.clientWidth;
        }
      };
      window.addEventListener('resize', updateContainerWidth);
      
      // Store cleanup function
      (window as any).__slidesContainerResizeHandler = updateContainerWidth;

      // Initialize GSAP Observer for touch/pointer gestures
      // Only touch and pointer (no wheel scroll)
      // Increased tolerance to prevent accidental multi-slide scrolling
      observer = Observer.create({
        target: containerRef.value,
        type: "touch,pointer",
        onUp: () => {
          if (!isInitialized.value) return;
          // Debounce to prevent rapid slide changes
          if (touchDebounceTimer) return;
          touchDebounceTimer = setTimeout(() => {
            touchDebounceTimer = null;
          }, 500); // 500ms debounce
          const prevIndex = Math.max(currentIndex.value - 1, 0);
          if (prevIndex !== currentIndex.value) {
            scrollToIndex(prevIndex);
          }
        },
        onDown: () => {
          if (!isInitialized.value) return;
          // Debounce to prevent rapid slide changes
          if (touchDebounceTimer) return;
          touchDebounceTimer = setTimeout(() => {
            touchDebounceTimer = null;
          }, 500); // 500ms debounce
          const maxIndex = props.slides.length - 1;
          const nextIndex = Math.min(currentIndex.value + 1, maxIndex);
          if (nextIndex !== currentIndex.value) {
            scrollToIndex(nextIndex);
          }
        },
        onLeft: () => {
          if (!isInitialized.value) return;
          // Debounce to prevent rapid slide changes
          if (touchDebounceTimer) return;
          touchDebounceTimer = setTimeout(() => {
            touchDebounceTimer = null;
          }, 500); // 500ms debounce
          const prevIndex = Math.max(currentIndex.value - 1, 0);
          if (prevIndex !== currentIndex.value) {
            scrollToIndex(prevIndex);
          }
        },
        onRight: () => {
          if (!isInitialized.value) return;
          // Debounce to prevent rapid slide changes
          if (touchDebounceTimer) return;
          touchDebounceTimer = setTimeout(() => {
            touchDebounceTimer = null;
          }, 500); // 500ms debounce
          const maxIndex = props.slides.length - 1;
          const nextIndex = Math.min(currentIndex.value + 1, maxIndex);
          if (nextIndex !== currentIndex.value) {
            scrollToIndex(nextIndex);
          }
        },
        tolerance: 100, // Increased from 10 to require more significant swipe (100px)
        preventDefault: true,
      });

      // Mark as initialized after Observer is created
      // Use a small delay to ensure Observer is fully set up
      setTimeout(() => {
        isInitialized.value = true;
      }, 50);

      // Focus container for keyboard events
      containerRef.value.focus();
    });
  });
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener("keydown", handleKeyDown);
  
  // Clean up resize listener
  if ((window as any).__slidesContainerResizeHandler) {
    window.removeEventListener('resize', (window as any).__slidesContainerResizeHandler);
    delete (window as any).__slidesContainerResizeHandler;
  }

  // Kill GSAP Observer
  if (observer) {
    observer.kill();
    observer = null;
  }

  // Clear touch debounce timer
  if (touchDebounceTimer) {
    clearTimeout(touchDebounceTimer);
    touchDebounceTimer = null;
  }
});

// Expose navigation methods for parent components
defineExpose({
  navigateTo: scrollToIndex,
  goNext: () => {
    const maxIndex = props.slides.length - 1;
    const nextIndex = Math.min(currentIndex.value + 1, maxIndex);
    if (nextIndex !== currentIndex.value) {
      scrollToIndex(nextIndex);
    }
  },
  goPrev: () => {
    const prevIndex = Math.max(currentIndex.value - 1, 0);
    if (prevIndex !== currentIndex.value) {
      scrollToIndex(prevIndex);
    }
  },
});
</script>

<style scoped>
.slide-item {
  flex-shrink: 0;
}

.slides-container:focus {
  outline: none;
}

.slides-container:focus-visible {
  outline: none;
}
</style>

