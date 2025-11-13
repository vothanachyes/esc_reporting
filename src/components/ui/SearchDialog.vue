<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto"
    @click.self="handleClose"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      @click="handleClose"
    ></div>

    <!-- Dialog -->
    <div
      class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
      @keydown.esc="handleClose"
      @keydown.down.prevent="navigateResults(1)"
      @keydown.up.prevent="navigateResults(-1)"
      @keydown.enter.prevent="selectResult"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <svg
          class="w-5 h-5 text-primary dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search across all reports..."
          class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg"
          @input="handleSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          title="Clear search"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Results -->
      <div class="max-h-[60vh] overflow-y-auto">
        <div v-if="isSearching && searchQuery.length >= 2" class="px-6 py-8 text-center">
          <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Searching...</p>
        </div>
        <div
          v-else-if="searchResults.length === 0 && searchQuery.length >= 2"
          class="px-6 py-8 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400">No results found</p>
        </div>
        <div v-else-if="searchQuery.length < 2" class="px-6 py-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">Type at least 2 characters to search</p>
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <button
            v-for="(result, index) in searchResults"
            :key="`${result.reportPath}-${result.pageIndex}`"
            :class="[
              'w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
              selectedIndex === index ? 'bg-primary/10 dark:bg-primary/20' : ''
            ]"
            @click="handleResultClick(result)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-300"
                  >
                    {{ result.reportLabel }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    Page {{ result.pageIndex + 1 }}
                  </span>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                  <span v-html="highlightText(result.slide.title, result.titleMatches)"></span>
                </h3>
                <p
                  v-if="result.slide.subtitle"
                  class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1"
                >
                  {{ Array.isArray(result.slide.subtitle) ? result.slide.subtitle.join(", ") : result.slide.subtitle }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                  <span v-html="highlightContentPreview(result.slide.content, result.contentMatches, result.contentText)"></span>
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="searchResults.length > 0"
        class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between"
      >
        <span>{{ searchResults.length }} result{{ searchResults.length !== 1 ? "s" : "" }}</span>
        <span>↑↓ Navigate • Enter Select • Esc Close</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import type { SearchResult, MatchIndices } from "@/composables/useGlobalSearch";
import type { SlideCard, ContentItem, ContentStats } from "@/data/types";

const props = defineProps<{
  isOpen: boolean;
  results: SearchResult[];
  isSearching?: boolean;
}>();

const emit = defineEmits<{
  "close": [];
  "select-result": [result: SearchResult];
  "search": [query: string];
}>();

const searchQuery = ref("");
const selectedIndex = ref(-1);
const searchInputRef = ref<HTMLInputElement | null>(null);

// Expose search query for parent component
defineExpose({
  searchQuery,
});

const handleSearch = () => {
  selectedIndex.value = -1;
  emit("search", searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  selectedIndex.value = -1;
  emit("search", "");
};

const handleClose = () => {
  searchQuery.value = "";
  selectedIndex.value = -1;
  emit("close");
};

const handleResultClick = (result: SearchResult) => {
  emit("select-result", result);
};

const selectResult = () => {
  if (selectedIndex.value >= 0 && selectedIndex.value < props.results.length) {
    handleResultClick(props.results[selectedIndex.value]);
  }
};

const navigateResults = (direction: number) => {
  if (props.results.length === 0) return;

  selectedIndex.value += direction;

  if (selectedIndex.value < 0) {
    selectedIndex.value = props.results.length - 1;
  } else if (selectedIndex.value >= props.results.length) {
    selectedIndex.value = 0;
  }
};

const searchResults = computed(() => props.results);

/**
 * Highlight text based on match indices
 */
function highlightText(text: string, matches?: MatchIndices): string {
  if (!matches || matches.length === 0) {
    return escapeHtml(text);
  }

  // Sort matches by start index (descending) to avoid index shifting issues
  const sortedMatches = [...matches].sort((a, b) => b[0] - a[0]);
  
  let highlighted = text;
  
  sortedMatches.forEach(([start, end]) => {
    const before = highlighted.substring(0, start);
    const match = highlighted.substring(start, end + 1);
    const after = highlighted.substring(end + 1);
    highlighted = `${before}<mark class="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 font-semibold px-0.5 rounded">${escapeHtml(match)}</mark>${after}`;
  });

  return highlighted;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get content preview text with highlighting
 */
function highlightContentPreview(content: SlideCard["content"], matches?: MatchIndices, contentText?: string): string {
  let previewText = "";
  
  // Use contentText if available (from search result), otherwise extract from content
  if (contentText) {
    previewText = contentText.substring(0, 150);
  } else {
    // Fallback to extracting from content
    if (typeof content === "string") {
      const textContent = content.replace(/<[^>]*>/g, "");
      previewText = textContent.substring(0, 150);
    } else if (Array.isArray(content)) {
      const preview = content
        .map((item: ContentItem) => {
          let text = item.title;
          if (item.description) {
            text += `: ${item.description}`;
          }
          return text;
        })
        .join(". ");
      previewText = preview.substring(0, 150);
    } else if (typeof content === "object" && content !== null && "type" in content) {
      if (content.type === "stats") {
        const stats = content as ContentStats;
        if (stats.text) {
          previewText = stats.text.substring(0, 150);
        } else {
          const statsText = stats.stats.map((stat) => `${stat.label}: ${stat.value}`).join(", ");
          previewText = statsText.substring(0, 150);
        }
      }
    }
  }

  if (!previewText) {
    return "";
  }

  // Adjust match indices if content was truncated
  if (matches && matches.length > 0) {
    // Filter matches that are within the preview length
    const adjustedMatches = matches
      .filter(([start, end]) => end < previewText.length)
      .map(([start, end]) => [start, Math.min(end, previewText.length - 1)] as [number, number]);
    
    return highlightText(previewText, adjustedMatches);
  }

  return escapeHtml(previewText);
}

// Focus input when dialog opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    } else {
      searchQuery.value = "";
      selectedIndex.value = -1;
    }
  }
);

// Prevent body scroll when dialog is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

