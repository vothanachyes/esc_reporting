<template>
  <div class="relative min-h-screen flex flex-col">
    <AppHeader :data="mainWrapperData" />
    <ContentTypeTag v-if="currentSlideType" :type="currentSlideType" />
    <div class="flex-1 overflow-y-auto">
      <SlidesContainer
        v-if="!isGridView"
        :slides="slides"
        :initial-index="currentSlideIndex"
        @slide-change="handleSlideChange"
      />
      <GridView v-else :slides="slides" @card-click="handleCardClick" />
    </div>
    <div class="absolute bottom-0 left-0 right-0">
    <AppFooter :active-report-path="activeReportPath" @toggle-view="toggleView" @change-report="handleReportChange" />
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { SlideCard, MainWrapperData } from "@/data/types";
import AppHeader from "./AppHeader.vue";
import ContentTypeTag from "./ContentTypeTag.vue";
import AppFooter from "./AppFooter.vue";
import SlidesContainer from "../slides/SlidesContainer.vue";
import GridView from "../ui/GridView.vue";
import { loadReportData } from "@/data/reportData";
import octoberReportJson from "@/data/octoberReport.json?raw";
import novemberReportJson from "@/data/novemberReport.json?raw";

const isGridView = ref(false);
// Single source of truth for current slide index (0-based array index)
const currentSlideIndex = ref(0);
// Track current active report path
const activeReportPath = ref("@/data/octoberReport.json");

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
  reportData = JSON.parse(octoberReportJson);
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

    // Update report data
    loadReportData(parsedData);
    mainWrapperData.value = parsedData.mainWrapper;
    slides.value = [...parsedData.slides].sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));

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

onMounted(() => {
  console.log("Loaded slides:", slides.value.length);
});
</script>

