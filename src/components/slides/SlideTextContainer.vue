<template>
  <div class="flex flex-col gap-5 w-full" :class="widthClass" :style="widthStyle">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl md:text-3xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-white dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
        {{ title }}
      </h2>
      <div v-if="subtitles.length > 0" class="flex flex-col gap-1.5">
        <div
          v-for="(subtitle, index) in subtitles"
          :key="index"
        >
          <!-- Modern Status Badge for Status subtitles -->
          <span
            v-if="isStatusSubtitle(subtitle)"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base font-semibold shadow-lg transition-all"
            :class="getStatusBadgeClass(subtitle)"
          >
            <span
              class="w-2 h-2 rounded-full shadow-sm"
              :class="getStatusDotClass(subtitle)"
            ></span>
            {{ getStatusText(subtitle) }}
          </span>
          <!-- Regular subtitle for non-status subtitles -->
          <h3
            v-else
            class="text-base md:text-lg text-gray-200 dark:text-gray-300 font-medium"
          >
            {{ subtitle }}
          </h3>
        </div>
      </div>
    </div>
    
    <!-- Simple text content -->
    <div
      v-if="isStringContent"
      class="text-sm md:text-base text-gray-100 dark:text-gray-200 leading-relaxed"
    >
      {{ content }}
    </div>
    
    <!-- Stats content (for intro slides) -->
    <div v-else-if="isStatsContent" class="flex flex-col gap-4">
      <p v-if="statsContent.text" class="text-sm md:text-base text-gray-100 dark:text-gray-200 text-center">
        {{ statsContent.text }}
      </p>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div
          v-for="(stat, index) in statsContent.stats"
          :key="index"
          class="bg-white/5 dark:bg-gray-800/30 p-3 md:p-4 rounded-lg border border-white/10 dark:border-gray-700/30"
        >
          <div class="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">{{ stat.value }}</div>
          <div class="text-xs md:text-sm text-gray-300 dark:text-gray-400 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>
    
    <!-- Items content (for feature slides) -->
    <div v-else-if="isItemsContent" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div
        v-for="(item, index) in itemsContent"
        :key="index"
        class="p-3 md:p-4 rounded-xl bg-white/5 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30"
      >
        <div class="flex items-start gap-3 md:gap-4">
          <!-- Modern Status Badge -->
          <div class="flex-shrink-0 mt-0.5">
            <span
              v-if="item.status === 'done'"
              class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 text-white shadow-lg shadow-green-500/30 border-2 border-green-300/50 dark:border-green-400/50"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span
              v-else-if="item.status === 'todo'"
              class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 text-white shadow-lg shadow-yellow-500/30 border-2 border-yellow-300/50 dark:border-yellow-400/50"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span
              v-else
              class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-300/50 dark:border-blue-400/50 animate-pulse"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm md:text-base font-bold text-white dark:text-gray-100 mb-1 leading-tight">
              {{ item.title }}
            </h4>
            <p v-if="item.description" class="text-xs md:text-sm text-gray-300 dark:text-gray-400 mb-2 leading-relaxed">
              {{ item.description }}
            </p>
            <ul v-if="item.points && item.points.length > 0" class="ml-2 mt-2 space-y-1">
              <li
                v-for="(point, pointIndex) in item.points"
                :key="pointIndex"
                class="text-xs md:text-sm text-gray-200 dark:text-gray-300 leading-relaxed flex items-start gap-2"
              >
                <span class="text-primary-400 mt-1.5 flex-shrink-0">•</span>
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from "vue";
import type { ContentItem, ContentStats } from "@/data/types";

const props = defineProps<{
  title: string;
  subtitles: string[];
  content: string | ContentItem[] | ContentStats;
  width: string;
}>();

const widthClass = computed(() => {
  // If width is a class string (like "md:w-auto w-full"), use it directly
  // Otherwise, treat it as a style width value
  if (props.width.includes("w-") || props.width.includes("md:")) {
    return props.width;
  }
  // For percentage/px values, we'll use inline style (handled in template)
  return "";
});

const widthStyle = computed(() => {
  // If width is not a class, use it as inline style
  if (!props.width.includes("w-") && !props.width.includes("md:")) {
    return { width: props.width };
  }
  return {};
});

const isStringContent = computed(() => typeof props.content === "string");
const isStatsContent = computed(() => 
  typeof props.content === "object" && 
  props.content !== null && 
  "type" in props.content && 
  props.content.type === "stats"
);
const isItemsContent = computed(() => Array.isArray(props.content));

const statsContent = computed(() => props.content as ContentStats);
const itemsContent = computed(() => props.content as ContentItem[]);

/**
 * Check if a subtitle is a status subtitle
 */
const isStatusSubtitle = (subtitle: string): boolean => {
  return subtitle.toLowerCase().startsWith("status:");
};

/**
 * Extract status text from subtitle (e.g., "Status: Done" -> "Done")
 */
const getStatusText = (subtitle: string): string => {
  return subtitle.replace(/^status:\s*/i, "").trim();
};

/**
 * Get status badge class based on status text
 */
const getStatusBadgeClass = (subtitle: string): string => {
  const statusText = getStatusText(subtitle).toLowerCase();
  
  if (statusText === "done") {
    return "bg-gradient-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20 dark:from-green-500/40 dark:to-green-600/40 dark:text-green-200 dark:border-green-400/60";
  } else if (statusText === "todo") {
    return "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20 dark:from-yellow-500/40 dark:to-orange-500/40 dark:text-yellow-200 dark:border-yellow-400/60";
  } else if (statusText.includes("almost done") || statusText.includes("mostly done")) {
    return "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20 dark:from-blue-500/40 dark:to-cyan-500/40 dark:text-blue-200 dark:border-blue-400/60";
  } else if (statusText.includes("partially done") || statusText.includes("in progress")) {
    return "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border-2 border-purple-400/50 shadow-purple-500/20 dark:from-purple-500/40 dark:to-pink-500/40 dark:text-purple-200 dark:border-purple-400/60 animate-pulse";
  } else {
    // Default for other statuses
    return "bg-gradient-to-r from-gray-500/30 to-gray-600/30 text-gray-300 border-2 border-gray-400/50 shadow-gray-500/20 dark:from-gray-500/40 dark:to-gray-600/40 dark:text-gray-200 dark:border-gray-400/60";
  }
};

/**
 * Get status dot class based on status text
 */
const getStatusDotClass = (subtitle: string): string => {
  const statusText = getStatusText(subtitle).toLowerCase();
  
  if (statusText === "done") {
    return "bg-gradient-to-br from-green-400 to-green-600";
  } else if (statusText === "todo") {
    return "bg-gradient-to-br from-yellow-400 to-orange-500";
  } else if (statusText.includes("almost done") || statusText.includes("mostly done")) {
    return "bg-gradient-to-br from-blue-400 to-cyan-500";
  } else if (statusText.includes("partially done") || statusText.includes("in progress")) {
    return "bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse";
  } else {
    return "bg-gradient-to-br from-gray-400 to-gray-600";
  }
};
</script>

