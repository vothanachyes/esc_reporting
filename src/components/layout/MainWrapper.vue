<template>
  <div class="relative h-screen flex flex-col overflow-hidden" :class="{ 'print-mode': isPrintMode }">
    <!-- Background gradient with scale animation -->
    <div 
      class="absolute inset-0 -z-10"
      :style="gradientStyle"
    ></div>
    <!-- Background Pattern -->
    <div class="absolute inset-0 -z-10 opacity-5 dark:opacity-10">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>
    <!-- Content -->
    <AppHeader :data="mainWrapperData" />
    <ContentTypeTag
      v-if="availableTypes.length > 0 && !isPrintMode"
      :type="currentSlideType"
      :title="mainWrapperData.title"
      :available-types="availableTypes"
      @type-change="handleTypeChange"
    />
    <div v-if="isPrintMode" class="flex-1 w-full overflow-y-auto min-h-0 z-2 print-mode-container">
      <PrintSlidesContainer :slides="slides" />
    </div>
    <div v-else class="flex-1 w-full overflow-hidden min-h-0 z-2 relative">
      <!-- Loading Overlay -->
      <div
        v-if="isLoadingReport"
        class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white dark:text-gray-100 text-lg font-semibold">Loading report...</p>
        </div>
      </div>
      <SlidesContainer
        v-if="!isGridView"
        :key="slidesKey"
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
      v-if="!isGridView && !isPrintMode"
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
    <AppFooter v-if="!isPrintMode" :active-report-path="activeReportPath" :is-detail-mode="!isMiniView" @toggle-view="toggleView" @change-report="handleReportChange" @open-search="handleOpenSearch" />
    <img 
      v-if="!isPrintMode"
      src="/e-footer.png" 
      alt="Footer decoration" 
      class="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none"
    />
    <!-- Search Dialog -->
    <SearchDialog
      :is-open="isSearchDialogOpen"
      :results="searchResults"
      :is-searching="isSearching"
      @close="handleCloseSearch"
      @select-result="handleSelectSearchResult"
      @search="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import type { SlideCard, MainWrapperData } from "@/data/types";
import PrimeButton from "primevue/button";
import AppHeader from "./AppHeader.vue";
import ContentTypeTag from "./ContentTypeTag.vue";
import AppFooter from "./AppFooter.vue";
import SlidesContainer from "../slides/SlidesContainer.vue";
import GridView from "../ui/GridView.vue";
import PrintSlidesContainer from "../print/PrintSlidesContainer.vue";
import SearchDialog from "../ui/SearchDialog.vue";
import { loadReportData } from "@/data/reportData";
import { generateAppendixSlides } from "@/utils/appendixGenerator";
import octoberReportJson from "@/data/octoberReport.json?raw";
import octoberReportMiniJson from "@/data/octoberReport_mini.json?raw";
import novemberReportJson from "@/data/novemberReport.json?raw";
import novemberReportMiniJson from "@/data/novemberReport_mini.json?raw";
import { useDarkMode } from "@/composables/useDarkMode";
import { usePrintMode } from "@/composables/usePrintMode";
import { useRoute } from "vue-router";
import { useGlobalSearch, type SearchResult } from "@/composables/useGlobalSearch";

const isGridView = ref(false);
// Single source of truth for current slide index (0-based array index)
const currentSlideIndex = ref(0);
// Track current active report path
const activeReportPath = ref("@/data/octoberReport.json");
// Reference to SlidesContainer for navigation
const slidesContainerRef = ref<InstanceType<typeof SlidesContainer> | null>(null);
// Enable 3D hover effect on cards (set to true to enable)
const enable3DHover = ref(true);
// Loading state for report switching
const isLoadingReport = ref(false);
// Key to force SlidesContainer re-render when slides change
const slidesKey = ref(0);

// Search dialog state
const isSearchDialogOpen = ref(false);
const searchResults = ref<SearchResult[]>([]);
const isSearching = ref(false);
const searchQuery = ref("");

// Dark mode state
const { isDark } = useDarkMode();

// Print mode state
const { isPrintMode } = usePrintMode();

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
  "@/data/octoberReport_mini.json": octoberReportMiniJson,
  "@/data/novemberReport.json": novemberReportJson,
  "@/data/novemberReport_mini.json": novemberReportMiniJson,
};

// Get route to determine which report to load
const route = useRoute();
const isMiniView = computed(() => route.meta.viewType === "mini" || route.path === "/");

// Determine initial report based on route
// Defaults to October, but will be updated when user selects a different report
const getInitialReportPath = (): string => {
  if (isMiniView.value) {
    return "@/data/octoberReport_mini.json";
  }
  return "@/data/octoberReport.json";
};

// Parse JSON from raw import (initial load)
let reportData: { mainWrapper: MainWrapperData; slides: SlideCard[] };
try {
  const initialReportPath = getInitialReportPath();
  const jsonText = reportDataMap[initialReportPath] || octoberReportJson;
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
  
  reportData = {
    mainWrapper: parsedData.mainWrapper,
    slides: allSlides,
  };
  loadReportData(reportData);
  activeReportPath.value = initialReportPath;
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
  isLoadingReport.value = true;
  
  try {
    // Small delay to show loading indicator (better UX)
    await new Promise((resolve) => setTimeout(resolve, 300));

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
    
    // Force re-render by updating key
    slidesKey.value++;
    
    // Update slides - use nextTick to ensure DOM updates
    await nextTick();
    slides.value = allSlides;

    // Reset slide index to 0 when switching reports
    currentSlideIndex.value = 0;

    // Update active report path
    activeReportPath.value = jsonPath;

    // Wait a bit more for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 200));

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
    slidesKey.value++;
  } finally {
    isLoadingReport.value = false;
  }
};

/**
 * Handle report change from AppFooter
 * Automatically switches between mini/detail based on current route
 */
const handleReportChange = async (jsonPath: string) => {
  const isMini = route.path === "/" || route.meta.viewType === "mini";
  const reportPath = getReportPathForView(jsonPath, isMini);
  
  if (reportPath !== activeReportPath.value) {
    await loadReportFromPath(reportPath);
  }
};

/**
 * Get current slide type for ContentTypeTag display
 */
const currentSlideType = computed(() => {
  return slides.value[currentSlideIndex.value]?.type;
});

/**
 * Get all unique types from slides in slide order (first appearance)
 */
const availableTypes = computed(() => {
  const types: string[] = [];
  const seen = new Set<string>();
  slides.value.forEach((slide) => {
    if (slide.type && !seen.has(slide.type)) {
      types.push(slide.type);
      seen.add(slide.type);
    }
  });
  return types;
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

// Helper to get the appropriate report path based on current report and view type
const getReportPathForView = (baseReportPath: string, isMini: boolean): string => {
  if (baseReportPath.includes("october")) {
    return isMini ? "@/data/octoberReport_mini.json" : "@/data/octoberReport.json";
  } else if (baseReportPath.includes("november")) {
    return isMini ? "@/data/novemberReport_mini.json" : "@/data/novemberReport.json";
  }
  return baseReportPath;
};

// Watch for route changes to reload appropriate report
watch(
  () => route.path,
  async (newPath) => {
    const isMini = newPath === "/" || route.meta.viewType === "mini";
    // Extract base path (remove _mini.json or .json)
    let currentBasePath = activeReportPath.value;
    if (currentBasePath.includes("_mini.json")) {
      currentBasePath = currentBasePath.replace("_mini.json", ".json");
    }
    // Ensure we have the base path without _mini
    currentBasePath = currentBasePath.replace("_mini", "");
    
    const reportPath = getReportPathForView(currentBasePath, isMini);
    
    if (reportPath !== activeReportPath.value) {
      await loadReportFromPath(reportPath);
    }
  },
  { immediate: false }
);

/**
 * Load all reports for search
 */
const loadAllReportsForSearch = (): Array<{ slides: SlideCard[]; reportLabel: string; reportPath: string }> => {
  const reports: Array<{ slides: SlideCard[]; reportLabel: string; reportPath: string }> = [];

  // Load October reports
  try {
    const octoberData = JSON.parse(octoberReportJson) as { mainWrapper: MainWrapperData; slides: SlideCard[] };
    const octoberSorted = [...octoberData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));
    const octoberAppendix = generateAppendixSlides(octoberSorted);
    const octoberAll = [...octoberSorted, ...octoberAppendix];
    octoberAll.forEach((slide, index) => {
      slide.pageIndex = index;
    });
    reports.push({
      slides: octoberAll,
      reportLabel: "October",
      reportPath: "@/data/octoberReport.json",
    });
  } catch (error) {
    console.error("Failed to load October report for search:", error);
  }

  try {
    const octoberMiniData = JSON.parse(octoberReportMiniJson) as { mainWrapper: MainWrapperData; slides: SlideCard[] };
    const octoberMiniSorted = [...octoberMiniData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));
    const octoberMiniAppendix = generateAppendixSlides(octoberMiniSorted);
    const octoberMiniAll = [...octoberMiniSorted, ...octoberMiniAppendix];
    octoberMiniAll.forEach((slide, index) => {
      slide.pageIndex = index;
    });
    reports.push({
      slides: octoberMiniAll,
      reportLabel: "October",
      reportPath: "@/data/octoberReport_mini.json",
    });
  } catch (error) {
    console.error("Failed to load October mini report for search:", error);
  }

  // Load November reports
  try {
    const novemberData = JSON.parse(novemberReportJson) as { mainWrapper: MainWrapperData; slides: SlideCard[] };
    const novemberSorted = [...novemberData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));
    const novemberAppendix = generateAppendixSlides(novemberSorted);
    const novemberAll = [...novemberSorted, ...novemberAppendix];
    novemberAll.forEach((slide, index) => {
      slide.pageIndex = index;
    });
    reports.push({
      slides: novemberAll,
      reportLabel: "November",
      reportPath: "@/data/novemberReport.json",
    });
  } catch (error) {
    console.error("Failed to load November report for search:", error);
  }

  try {
    const novemberMiniData = JSON.parse(novemberReportMiniJson) as { mainWrapper: MainWrapperData; slides: SlideCard[] };
    const novemberMiniSorted = [...novemberMiniData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));
    const novemberMiniAppendix = generateAppendixSlides(novemberMiniSorted);
    const novemberMiniAll = [...novemberMiniSorted, ...novemberMiniAppendix];
    novemberMiniAll.forEach((slide, index) => {
      slide.pageIndex = index;
    });
    reports.push({
      slides: novemberMiniAll,
      reportLabel: "November",
      reportPath: "@/data/novemberReport_mini.json",
    });
  } catch (error) {
    console.error("Failed to load November mini report for search:", error);
  }

  return reports;
};

// Initialize search with all reports
const allReportsForSearch = loadAllReportsForSearch();
const currentMode = computed<"mini" | "detail">(() => (isMiniView.value ? "mini" : "detail"));
const { search: performSearch } = useGlobalSearch(allReportsForSearch, () => currentMode.value);

/**
 * Handle opening search dialog
 */
const handleOpenSearch = () => {
  isSearchDialogOpen.value = true;
  searchQuery.value = "";
  searchResults.value = [];
};

/**
 * Handle closing search dialog
 */
const handleCloseSearch = () => {
  isSearchDialogOpen.value = false;
  searchQuery.value = "";
  searchResults.value = [];
};

// Expose search function to SearchDialog via a method
const handleSearch = (query: string) => {
  if (!query || query.trim().length < 2) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  
  // Use setTimeout to debounce and allow UI to update
  setTimeout(() => {
    try {
      const results = performSearch(query.trim(), 50);
      searchResults.value = results;
    } catch (error) {
      console.error("Search error:", error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 100);
};

/**
 * Handle selecting a search result
 */
const handleSelectSearchResult = async (result: SearchResult) => {
  // Close search dialog
  isSearchDialogOpen.value = false;

  // Check if we need to switch reports
  if (result.reportPath !== activeReportPath.value) {
    await loadReportFromPath(result.reportPath);
    // Wait for report to load
    await nextTick();
  }

  // Find the slide index in current slides
  const targetIndex = slides.value.findIndex(
    (slide) => slide.pageIndex === result.pageIndex && slide.title === result.slide.title
  );

  if (targetIndex !== -1) {
    // Navigate to the slide
    currentSlideIndex.value = targetIndex;

    // If in grid view, switch to slides view
    if (isGridView.value) {
      isGridView.value = false;
    }

    // Use SlidesContainer's navigateTo method if available
    if (slidesContainerRef.value && !isGridView.value) {
      await nextTick();
      (slidesContainerRef.value as any).navigateTo(targetIndex);
    }
  } else {
    // If slide not found, try to find by pageIndex only
    const fallbackIndex = slides.value.findIndex((slide) => slide.pageIndex === result.pageIndex);
    if (fallbackIndex !== -1) {
      currentSlideIndex.value = fallbackIndex;
      if (isGridView.value) {
        isGridView.value = false;
      }
      if (slidesContainerRef.value && !isGridView.value) {
        await nextTick();
        (slidesContainerRef.value as any).navigateTo(fallbackIndex);
      }
    }
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

