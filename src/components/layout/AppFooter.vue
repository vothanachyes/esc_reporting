<template>
  <footer class="w-full h-[50px] px-6 flex items-center justify-between backdrop-blur-md border-t border-white/10 dark:border-gray-700/30 shadow-lg" :style="footerStyle">
    <div class="flex items-center gap-2">
      <button
        v-for="report in reportConfigs"
        :key="report.jsonPath"
        :class="[
          'p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center relative',
          isActiveReport(report.jsonPath)
            ? 'bg-gradient-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 scale-105'
            : 'bg-white/10 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-white/20 dark:hover:border-gray-600/50 hover:scale-105'
        ]"
        :title="report.label"
        @click="handleReportChange(report.jsonPath)"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span
          class="absolute -top-0.5 -right-0.5 text-[9px] font-bold leading-none px-1 py-0.5 rounded-full"
          :class="
            isActiveReport(report.jsonPath)
              ? 'bg-white/90 text-primary-600 dark:bg-white dark:text-primary-700'
              : 'bg-primary/80 text-white dark:bg-primary-600 dark:text-white'
          "
        >
          {{ getMonthAbbreviation(report.label) }}
        </span>
      </button>
      <!-- Detail Mode Indicator -->
      <div
        v-if="isDetailMode"
        class="relative px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold md:font-bold shadow-md shadow-amber-500/30 border border-amber-300/50 dark:border-amber-400/50 flex items-center gap-0.5 sm:gap-1 md:gap-1.5"
        title="Detail Mode - Full report view"
      >
        <svg
          class="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span class="hidden sm:inline">Detail Mode</span>
        <span class="sm:hidden">Detail</span>
        <!-- Mini Mode Badge (minus icon) -->
        <button
          @click="handleSwitchToMini"
          class="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-amber-300/50 dark:border-amber-400/50 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
          title="Switch to Mini Mode"
        >
          <svg
            class="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        class="p-2.5 bg-gradient-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white dark:text-gray-100 rounded-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 hover:scale-105 flex items-center justify-center"
        title="Search"
        @click="$emit('open-search')"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      <button
        class="p-2.5 bg-gradient-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white dark:text-gray-100 rounded-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 hover:scale-105 flex items-center justify-center"
        title="View All"
        @click="$emit('toggle-view')"
      >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useDarkMode } from "@/composables/useDarkMode";

type ReportConfig = {
  jsonPath: string;
  label: string;
};

const props = defineProps<{
  activeReportPath?: string;
  isDetailMode?: boolean;
}>();

const emit = defineEmits<{
  "toggle-view": [];
  "change-report": [jsonPath: string];
  "open-search": [];
}>();

const router = useRouter();
const { isDark } = useDarkMode();

const reportConfigs: ReportConfig[] = [
  { jsonPath: "@/data/octoberReport.json", label: "October" },
  { jsonPath: "@/data/novemberReport.json", label: "November" },
];

const footerStyle = computed(() => {
  const gradient = isDark.value
    ? "linear-gradient(135deg, rgba(2, 47, 64, 0.95) 0%, rgba(1, 30, 38, 0.95) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)";
  return {
    background: gradient,
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  };
});

const handleReportChange = (jsonPath: string) => {
  emit("change-report", jsonPath);
};

const getMonthAbbreviation = (label: string): string => {
  return label.substring(0, 3).toUpperCase();
};

/**
 * Normalize report path by removing _mini suffix for comparison
 * This allows matching base paths (octoberReport.json) with mini paths (octoberReport_mini.json)
 */
const normalizeReportPath = (path: string): string => {
  return path.replace("_mini.json", ".json");
};

/**
 * Check if a report path matches the active report path
 * Handles both base and mini versions of the same report
 */
const isActiveReport = (reportPath: string): boolean => {
  if (!props.activeReportPath) return false;
  return normalizeReportPath(props.activeReportPath) === normalizeReportPath(reportPath);
};

const handleSwitchToMini = () => {
  router.push("/");
};
</script>

