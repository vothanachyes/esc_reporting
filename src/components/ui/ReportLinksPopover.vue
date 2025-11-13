<template>
  <div
    v-if="isOpen && links && links.length > 0"
    ref="popoverRef"
    data-popover="report-links"
      class="w-64 bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2"
      style="min-width: 256px;"
  >
      <!-- Header -->
      <div class="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Resources</h3>
      </div>

      <!-- Links List -->
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
            <svg
              v-if="link.type === 'gitlab'"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path d="M12 0L8.5 9.5h-7L0 12l1.5 2.5h7L12 24l3.5-9.5h7L24 12l-1.5-2.5h-7L12 0z"/>
            </svg>
            <svg
              v-else-if="link.type === 'github'"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <svg
              v-else-if="link.type === 'bitbucket'"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.132.685.698 1.23a11.97 11.97 0 006.577 3.044h6.676a.768.768 0 00.623-.333L23.52 2.18a.768.768 0 00-.623-1.135L.778 1.213zM14.72 15.89H9.522l-1.4-7.38h8.367l-1.77 7.38z"/>
            </svg>
            <svg
              v-else-if="link.type === 'googleSheet'"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path d="M14.17 2.5l-9.34 9.34v7.66h7.66l9.34-9.34V2.5h-7.66zm.84 1.16h5.84v5.84l-5.84-5.84zm-9.34 9.34l5.84-5.84h-5.84v5.84zm0 6.84v-5.84l5.84 5.84h-5.84zm6.84-5.84l5.84-5.84v5.84h-5.84zm0 1.16h5.84v5.84l-5.84-5.84z"/>
            </svg>
            <svg
              v-else-if="link.type === 'demo'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            <svg
              v-else-if="link.type === 'videoDemo'"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="['w-5 h-5', getIconColor(link.type)]"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ReportLink, LinkType } from "@/data/types";

defineProps<{
  isOpen: boolean;
  links?: ReportLink[];
  triggerElement?: HTMLElement | null;
}>();

const popoverRef = ref<HTMLElement | null>(null);

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

const getIconColor = (type: LinkType): string => {
  switch (type) {
    case "gitlab":
      return "text-orange-500";
    case "github":
      return "text-gray-900 dark:text-white";
    case "bitbucket":
      return "text-blue-500";
    case "googleSheet":
      return "text-green-600";
    case "demo":
      return "text-primary";
    case "videoDemo":
      return "text-red-600";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};
</script>

<style scoped>
/* Custom scrollbar if needed */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

