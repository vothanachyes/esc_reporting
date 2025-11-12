<template>
  <div
    class="relative w-full h-[92vh] flex items-center justify-center"
  >
    <!-- Card Container with rounded corners, shadow, and default bg -->
    <div
      class="relative h-full flex items-center justify-center backdrop-blur-sm"
      :class="[
        isImageTypeSlide ? 'w-full rounded-none p-0' : 'w-[92%] rounded-3xl shadow-2xl dark:shadow-gray-900/50 p-10 border border-white/10 dark:border-gray-700/30',
        cardBgClass
      ]"
      :style="cardStyle"
    >
      <!-- Inner wrapper for GSAP animations - separate from scroll snap container -->
      <div
        ref="cardRef"
        class="relative w-full h-full flex items-center justify-center"
      >
        <!-- Page Number Badge -->
        <div
          class="absolute top-5 right-5 w-14 h-14 bg-primary/90 dark:bg-primary-600/90 text-white dark:text-gray-100 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg backdrop-blur-sm border border-white/20"
        >
          {{ pageIndex }}/{{ totalPages }}
        </div>

        <!-- Content Container -->
        <div class="w-full h-full flex flex-col md:flex-row gap-8 items-center overflow-hidden">
        <!-- Image Container -->
        <SlideImageContainer
          v-if="card.images && card.images.length > 0"
          :images="card.images"
          :alignment="card.imageAlignment || 'right'"
          :container-width="isImageTypeSlide ? 100 : (card.imageContainerWidth || 40)"
          :layout="getImageLayout"
        />

          <!-- Text Container - Hide if Image type with empty content -->
          <SlideTextContainer
            v-if="!isImageTypeSlide || (card.content && card.content.trim() !== '')"
            :title="card.title"
            :subtitles="subtitles"
            :content="card.content"
            :width="textContainerWidth"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import type { SlideCard, ImageLayout } from "@/data/types";
import { gsap } from "gsap";
import SlideImageContainer from "./SlideImageContainer.vue";
import SlideTextContainer from "./SlideTextContainer.vue";
import { useGSAPAnimations } from "@/composables/useGSAPAnimations";

const props = defineProps<{
  card: SlideCard;
  pageIndex: number;
  totalPages: number;
  isActive: boolean;
}>();

const cardRef = ref<HTMLElement | null>(null);
const { animateIn, animateOut } = useGSAPAnimations();
// Track current animation timeline for proper cleanup
let currentAnimation: gsap.core.Timeline | null = null;

const cardBgClass = computed(() => {
  // Default to primary dark background if no custom background is set
  const bg = props.card.background;
  if (!bg || (!bg.bgColor && !bg.bgImg)) {
    return "bg-primary-700 dark:bg-primary-800";
  }
  return "";
});

const cardStyle = computed(() => {
  const bg = props.card.background;
  const style: Record<string, string> = {};

  // If no background is set, use default (handled by cardBgClass)
  if (!bg) {
    return {};
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
  return props.card.type === "Image" &&
         props.card.images &&
         props.card.images.length === 1 &&
         (!props.card.content || props.card.content.trim() === "");
});

const textContainerWidth = computed(() => {
  if (!props.card.images || props.card.images.length === 0) return "100%";
  // On mobile, text takes full width when images are stacked
  // On desktop, use the configured width
  return "md:w-auto w-full";
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
});
</script>

