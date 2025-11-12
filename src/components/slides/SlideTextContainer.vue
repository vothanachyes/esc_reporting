<template>
  <div class="flex flex-col gap-5 w-full" :class="widthClass" :style="widthStyle">
    <div class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold text-white dark:text-gray-100 leading-tight">{{ title }}</h2>
      <div v-if="subtitles.length > 0" class="flex flex-col gap-1.5">
        <h3
          v-for="(subtitle, index) in subtitles"
          :key="index"
          class="text-lg text-gray-200 dark:text-gray-300 font-medium"
        >
          {{ subtitle }}
        </h3>
      </div>
    </div>
    <div
      class="text-base text-gray-100 dark:text-gray-200 leading-relaxed prose prose-lg max-w-none dark:prose-invert slide-content"
      v-html="content"
    />
  </div>
</template>

<style scoped>
.slide-content :deep(h4) {
  color: rgb(255 255 255);
}

.dark .slide-content :deep(h4) {
  color: rgb(243 244 246);
}

.slide-content :deep(p) {
  color: rgb(229 231 235);
}

.dark .slide-content :deep(p) {
  color: rgb(209 213 219);
}

.slide-content :deep(ul) {
  list-style: none;
}

.slide-content :deep(li) {
  color: rgb(229 231 235);
}

.dark .slide-content :deep(li) {
  color: rgb(209 213 219);
}

.slide-content :deep(.bg-white\/5) {
  backdrop-filter: blur(4px);
}

.slide-content :deep(.bg-gray-800\/30) {
  backdrop-filter: blur(4px);
}
</style>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  title: string;
  subtitles: string[];
  content: string;
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
</script>

