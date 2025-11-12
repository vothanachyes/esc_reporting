<template>
  <div class="relative h-screen flex flex-col overflow-hidden">
    <!-- Background gradient with scale animation -->
    <div 
      class="absolute inset-0 -z-10"
      :style="gradientStyle"
    ></div>
    <!-- Content -->
    <AppHeader :data="mainWrapperData" />
    <ContentTypeTag
      v-if="availableTypes.length > 0"
      :type="currentSlideType"
      :title="mainWrapperData.title"
      :available-types="availableTypes"
      @type-change="handleTypeChange"
    />
    <div class="flex-1 w-full overflow-hidden min-h-0 z-2">
      <SlidesContainer
        v-if="!isGridView"
        ref="slidesContainerRef"
        :slides="slides"
        :initial-index="currentSlideIndex"
        :enable3-d-hover="enable3DHover"
        @slide-change="handleSlideChange"
      />
      <GridView v-else :slides="slides" @card-click="handleCardClick" />
    </div>
    <!-- Navigation Buttons -->
    <div
      v-if="!isGridView"
      class="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-40"
    >
      <PrimeButton
        icon="pi pi-chevron-left"
        :disabled="currentSlideIndex === 0"
        size="small"
        rounded
        text
        severity="secondary"
        @click="goToPrevSlide"
        class="!w-8 !h-8 !min-w-[32px] shadow-md hover:shadow-lg cursor-pointer"
        aria-label="Previous slide"
      />
      <PrimeButton
        icon="pi pi-chevron-right"
        :disabled="currentSlideIndex === slides.length - 1"
        size="small"
        rounded
        text
        severity="secondary"
        @click="goToNextSlide"
        class="!w-8 !h-8 !min-w-[32px] shadow-md hover:shadow-lg cursor-pointer"
        aria-label="Next slide"
      />
    </div>
    <AppFooter :active-report-path="activeReportPath" @toggle-view="toggleView" @change-report="handleReportChange" />
    <img 
      src="/e-footer.png" 
      alt="Footer decoration" 
      class="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import type { SlideCard, MainWrapperData } from "@/data/types";
import PrimeButton from "primevue/button";
import AppHeader from "./AppHeader.vue";
import ContentTypeTag from "./ContentTypeTag.vue";
import AppFooter from "./AppFooter.vue";
import SlidesContainer from "../slides/SlidesContainer.vue";
import GridView from "../ui/GridView.vue";
import { loadReportData } from "@/data/reportData";
import { generateAppendixSlides } from "@/utils/appendixGenerator";
import octoberReportJson from "@/data/octoberReport.json?raw";
import novemberReportJson from "@/data/novemberReport.json?raw";
import { useDarkMode } from "@/composables/useDarkMode";

const isGridView = ref(false);
// Single source of truth for current slide index (0-based array index)
const currentSlideIndex = ref(0);
// Track current active report path
const activeReportPath = ref("@/data/octoberReport.json");
// Reference to SlidesContainer for navigation
const slidesContainerRef = ref<InstanceType<typeof SlidesContainer> | null>(null);
// Enable 3D hover effect on cards (set to true to enable)
const enable3DHover = ref(true);

// Dark mode state
const { isDark } = useDarkMode();

// Gradient background animation
// Using stone color palette
// Dark mode: darker stone shades
// Light mode: lighter stone shades
const darkModeColors = {
  primary: "#292524", // stone-800
  color1: "#1c1917", // stone-900
  color2: "#0c0a09", // stone-950
};

const lightModeColors = {
  primary: "#e7e5e4", // stone-200
  color1: "#d6d3d1", // stone-300
  color2: "#a8a29e", // stone-400
};

// Computed colors based on theme
const gradientColors = computed(() => {
  return isDark.value ? darkModeColors : lightModeColors;
});

const gradientAngle = ref(0);
const gradientScale = ref(1);
let gradientInterval: ReturnType<typeof setInterval> | null = null;
let scaleInterval: ReturnType<typeof setInterval> | null = null;

// Scale animation state
let scaleDirection = 1;
const scaleSpeed = 0.003; // Speed of scale animation
const scaleMin = 1.0; // Minimum scale
const scaleMax = 1.1; // Maximum scale

// Computed gradient style
const gradientStyle = computed(() => {
  const colors = gradientColors.value;
  return {
    background: `linear-gradient(${gradientAngle.value}deg, ${colors.primary}, ${colors.color1}, ${colors.color2})`,
    transform: `scale(${gradientScale.value})`,
    transition: "background 0.5s ease-in-out, transform 0.1s ease-in-out",
  };
});

// Default report data structure
const getDefaultReportData = (): { mainWrapper: MainWrapperData; slides: SlideCard[] } => ({
  mainWrapper: {
    title: "October Task Report",
    handler: { name: "Vothana CHY", avatar: "", role: "Developer" },
    teamLeader: { name: "Team Leader", avatar: "", role: "Team Leader" },
    period: "October 1-31, 2025",
    statistics: { totalTasks: 0, completedTasks: 0, features: 13, refactorings: 7 },
  },
  slides: [],
});

// Mapping of report paths to their JSON content loaders
// This allows Vite to statically analyze and bundle the imports
const reportDataMap: Record<string, string> = {
  "@/data/octoberReport.json": octoberReportJson,
  "@/data/novemberReport.json": novemberReportJson,
};

// Parse JSON from raw import (initial load)
let reportData: { mainWrapper: MainWrapperData; slides: SlideCard[] };
try {
  const parsedData = JSON.parse(octoberReportJson) as { mainWrapper: MainWrapperData; slides: SlideCard[] };
  
  // Sort slides by pageIndex
  const sortedSlides = [...parsedData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));
  
  // Generate appendix slides
  const appendixSlides = generateAppendixSlides(sortedSlides);
  
  // Append appendix slides and update page indices
  const allSlides = [...sortedSlides, ...appendixSlides];
  allSlides.forEach((slide, index) => {
    slide.pageIndex = index;
  });
  
  reportData = {
    mainWrapper: parsedData.mainWrapper,
    slides: allSlides,
  };
  loadReportData(reportData);
} catch (error) {
  console.error("Failed to parse report data:", error);
  reportData = getDefaultReportData();
}

const mainWrapperData = ref<MainWrapperData>(reportData.mainWrapper);
// Ensure slides are sorted by pageIndex to maintain correct order
// This prevents issues where slides might be out of order in the JSON
const slides = ref<SlideCard[]>(
  [...reportData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0))
);

/**
 * Load report data from a JSON file path
 * Uses static mapping to ensure Vite can properly analyze imports
 */
const loadReportFromPath = async (jsonPath: string) => {
  try {
    // Get JSON content from static mapping
    const jsonText = reportDataMap[jsonPath];

    if (!jsonText) {
      throw new Error(`Report file not found in mapping: ${jsonPath}`);
    }

    const parsedData = JSON.parse(jsonText) as { mainWrapper: MainWrapperData; slides: SlideCard[] };

    // Sort slides by pageIndex
    const sortedSlides = [...parsedData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));

    // Generate appendix slides
    const appendixSlides = generateAppendixSlides(sortedSlides);

    // Append appendix slides and update page indices
    const allSlides = [...sortedSlides, ...appendixSlides];
    allSlides.forEach((slide, index) => {
      slide.pageIndex = index;
    });

    // Update report data
    const reportDataWithAppendix = {
      mainWrapper: parsedData.mainWrapper,
      slides: allSlides,
    };
    loadReportData(reportDataWithAppendix);
    mainWrapperData.value = parsedData.mainWrapper;
    slides.value = allSlides;

    // Reset slide index to 0 when switching reports
    currentSlideIndex.value = 0;

    // Update active report path
    activeReportPath.value = jsonPath;

    console.log(`Loaded report from ${jsonPath}:`, {
      slidesCount: slides.value.length,
      title: mainWrapperData.value.title,
    });
  } catch (error) {
    console.error(`Failed to load report from ${jsonPath}:`, error);
    // Fallback to default data
    const defaultData = getDefaultReportData();
    loadReportData(defaultData);
    mainWrapperData.value = defaultData.mainWrapper;
    slides.value = defaultData.slides;
    currentSlideIndex.value = 0;
  }
};

/**
 * Handle report change from AppFooter
 */
const handleReportChange = (jsonPath: string) => {
  if (jsonPath !== activeReportPath.value) {
    loadReportFromPath(jsonPath);
  }
};

/**
 * Get current slide type for ContentTypeTag display
 */
const currentSlideType = computed(() => {
  return slides.value[currentSlideIndex.value]?.type;
});

/**
 * Get all unique types from slides
 */
const availableTypes = computed(() => {
  const types = new Set<string>();
  slides.value.forEach((slide) => {
    if (slide.type) {
      types.add(slide.type);
    }
  });
  return Array.from(types).sort();
});

/**
 * Handle type change from ContentTypeTag dropdown
 * Navigates to the first slide of the selected type
 */
const handleTypeChange = (type: string) => {
  // Find the first slide with the selected type
  const targetIndex = slides.value.findIndex((slide) => slide.type === type);
  
  if (targetIndex !== -1) {
    // Navigate to the slide
    currentSlideIndex.value = targetIndex;
    
    // If in grid view, switch to slides view
    if (isGridView.value) {
      isGridView.value = false;
    }
    
    // Use SlidesContainer's navigateTo method if available
    if (slidesContainerRef.value && !isGridView.value) {
      nextTick(() => {
        (slidesContainerRef.value as any).navigateTo(targetIndex);
      });
    }
  }
};

/**
 * Handle slide change from SlidesContainer
 * This is called when user scrolls or uses keyboard navigation
 * Index is always 0-based array index
 */
const handleSlideChange = (index: number) => {
  // Clamp index to valid range
  const clampedIndex = Math.max(0, Math.min(index, slides.value.length - 1));
  currentSlideIndex.value = clampedIndex;
};

/**
 * Handle card click from GridView
 * Navigates to the clicked slide and switches to slides view
 * Index is always 0-based array index from GridView
 */
const handleCardClick = (index: number) => {
  // Clamp index to valid range
  const clampedIndex = Math.max(0, Math.min(index, slides.value.length - 1));
  currentSlideIndex.value = clampedIndex;
  // Switch to slides view - SlidesContainer will handle navigation via initialIndex prop
  isGridView.value = false;
};

/**
 * Toggle between grid view and slides view
 * Preserves current slide index when switching views
 */
const toggleView = () => {
  isGridView.value = !isGridView.value;
};

/**
 * Navigate to next slide
 */
const goToNextSlide = () => {
  if (slidesContainerRef.value) {
    (slidesContainerRef.value as any).goNext();
  }
};

/**
 * Navigate to previous slide
 */
const goToPrevSlide = () => {
  if (slidesContainerRef.value) {
    (slidesContainerRef.value as any).goPrev();
  }
};

onMounted(() => {
  console.log("Loaded slides:", slides.value.length);
  
  // Start gradient rotation animation - smooth change every 100ms
  gradientInterval = setInterval(() => {
    gradientAngle.value = (gradientAngle.value + 1.5) % 360;
  }, 100);
  
  // Start scale animation - smooth pulse effect
  scaleInterval = setInterval(() => {
    gradientScale.value += scaleSpeed * scaleDirection;
    
    // Reverse direction at boundaries
    if (gradientScale.value >= scaleMax) {
      gradientScale.value = scaleMax;
      scaleDirection = -1;
    } else if (gradientScale.value <= scaleMin) {
      gradientScale.value = scaleMin;
      scaleDirection = 1;
    }
  }, 16); // ~60fps for smooth animation
});

onUnmounted(() => {
  // Clean up intervals on component unmount
  if (gradientInterval) {
    clearInterval(gradientInterval);
    gradientInterval = null;
  }
  if (scaleInterval) {
    clearInterval(scaleInterval);
    scaleInterval = null;
  }
});
</script>

