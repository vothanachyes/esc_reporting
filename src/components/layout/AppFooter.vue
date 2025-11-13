<template>
  <footer class="w-full h-[50px] px-6 flex items-center justify-between backdrop-blur-md border-t border-white/10 dark:border-gray-700/30 shadow-lg" :style="footerStyle">
    <div class="flex items-center gap-2">
      <div
        v-for="report in reportConfigs"
        :key="report.jsonPath"
        class="relative"
      >
        <button
          :ref="(el) => setButtonRef(report.jsonPath, el)"
          :class="[
            'p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center relative',
            isActiveReport(report.jsonPath)
              ? 'bg-linear-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 scale-105'
              : 'bg-white/10 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-white/20 dark:hover:border-gray-600/50 hover:scale-105'
          ]"
          :title="report.label"
          @click="(e) => handleReportClick(e, report.jsonPath)"
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
        <!-- Links Popover -->
        <Popover
          v-if="isActiveReport(report.jsonPath) && links && links.length > 0"
          :ref="(el) => setPopoverRef(report.jsonPath, el)"
        >
          <div class="flex flex-col gap-1 w-64">
            <div class="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Resources</h3>
            </div>
            <div class="py-1">
              <a
                v-for="(link, index) in links"
                :key="index"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-linear-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 flex items-center gap-3 cursor-pointer transition-all duration-200 group"
              >
                <!-- Icon -->
                <div class="shrink-0 w-5 h-5 flex items-center justify-center">
                  <IconProvider :size="20">
                    <!-- GitLab - Orange #FC6D26 -->
                    <MdiGitlab
                      v-if="link.type === 'gitlab'"
                      color="#FC6D26"
                    />
                    <!-- GitHub - Black #181717 (white in dark mode) -->
                    <MdiGithub
                      v-else-if="link.type === 'github'"
                      :color="isDark ? '#FFFFFF' : '#181717'"
                    />
                    <!-- Bitbucket - Blue #0052CC -->
                    <MdiBitbucket
                      v-else-if="link.type === 'bitbucket'"
                      color="#0052CC"
                    />
                    <!-- Google Sheets - Green #0F9D58 -->
                    <MdiGoogleSpreadsheet
                      v-else-if="link.type === 'googleSheet'"
                      color="#0F9D58"
                    />
                    <!-- Demo Link - Primary color -->
                    <svg
                      v-else-if="link.type === 'demo'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="w-5 h-5 text-primary"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    <!-- Video Demo - Red -->
                    <svg
                      v-else-if="link.type === 'videoDemo'"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-5 h-5 text-red-600"
                    >
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <!-- Default - Gray -->
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="w-5 h-5 text-gray-600 dark:text-gray-400"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </IconProvider>
                </div>
                
                <!-- Link Text -->
                <div class="flex-1 min-w-0">
                  <span class="group-hover:text-primary transition-colors block truncate">
                    {{ link.label || getDefaultLabel(link.type) }}
                  </span>
                </div>

                <!-- External Link Indicator -->
                <svg
                  class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </Popover>
      </div>
      <!-- Detail Mode Indicator -->
      <div
        v-if="isDetailMode"
        class="relative px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold md:font-bold shadow-md shadow-amber-500/30 border border-amber-300/50 dark:border-amber-400/50 flex items-center gap-0.5 sm:gap-1 md:gap-1.5"
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
        class="p-2.5 bg-linear-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white dark:text-gray-100 rounded-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 hover:scale-105 flex items-center justify-center"
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
        class="p-2.5 bg-linear-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white dark:text-gray-100 rounded-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 hover:scale-105 flex items-center justify-center"
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useDarkMode } from "@/composables/useDarkMode";
import type { ReportLink, LinkType } from "@/data/types";
import Popover from "primevue/popover";
import { IconProvider } from "@twistify/vue3-icons";
import { MdiGitlab, MdiGithub, MdiBitbucket, MdiGoogleSpreadsheet } from "@twistify/vue3-icons/mdi";

type ReportConfig = {
  jsonPath: string;
  label: string;
};

const props = defineProps<{
  activeReportPath?: string;
  isDetailMode?: boolean;
  links?: ReportLink[];
}>();

const emit = defineEmits<{
  "toggle-view": [];
  "change-report": [jsonPath: string];
  "open-search": [];
}>();

const router = useRouter();
const { isDark } = useDarkMode();

// Popover state
const popoverRefs = ref<Record<string, any>>({});
const buttonRefs = ref<Record<string, HTMLElement | null>>({});

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

const setButtonRef = (jsonPath: string, el: any) => {
  if (el && el instanceof HTMLElement) {
    buttonRefs.value[jsonPath] = el;
  } else if (el && '$el' in el && el.$el instanceof HTMLElement) {
    buttonRefs.value[jsonPath] = el.$el;
  }
};

const setPopoverRef = (jsonPath: string, el: any) => {
  if (el) {
    popoverRefs.value[jsonPath] = el;
  }
};

const handleReportClick = (event: MouseEvent, jsonPath: string) => {
  // If clicking the already active report, toggle popover
  if (isActiveReport(jsonPath)) {
    // Only show popover if there are links
    if (props.links && props.links.length > 0) {
      const popover = popoverRefs.value[jsonPath];
      if (popover) {
        popover.toggle(event);
      }
    }
  } else {
    // If clicking a different report, close any open popovers and change report
    // Close all popovers
    Object.values(popoverRefs.value).forEach((popover) => {
      if (popover && typeof popover.hide === 'function') {
        popover.hide();
      }
    });
    emit("change-report", jsonPath);
  }
};

const getDefaultLabel = (type: LinkType): string => {
  switch (type) {
    case "gitlab":
      return "GitLab Repository";
    case "github":
      return "GitHub Repository";
    case "bitbucket":
      return "Bitbucket Repository";
    case "googleSheet":
      return "Google Sheet";
    case "demo":
      return "Demo Link";
    case "videoDemo":
      return "Video Demo";
    default:
      return "External Link";
  }
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

