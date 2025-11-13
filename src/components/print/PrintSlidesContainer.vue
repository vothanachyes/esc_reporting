<template>
  <div class="w-full print-slides-container">
    <SlideCardComponent
      v-for="(slide, index) in slides"
      :id="`print-slide-${index}`"
      :key="index"
      :card="slide"
      :page-index="index + 1"
      :total-pages="slides.length"
      :is-active="true"
      :is-print-mode="true"
      class="print-slide-item"
    />
  </div>
</template>

<script setup lang="ts">
import type { SlideCard } from "@/data/types";
import SlideCardComponent from "../slides/SlideCard.vue";

const props = defineProps<{
  slides: SlideCard[];
}>();
</script>

<style scoped>
.print-slides-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  background: white;
}

.print-slide-item {
  width: 100%;
  min-height: auto;
  page-break-after: always;
  page-break-inside: avoid;
  break-after: page;
  break-inside: avoid;
  margin: 0;
  padding: 0;
}

/* Ensure last slide doesn't have page break */
.print-slide-item:last-child {
  page-break-after: auto;
  break-after: auto;
}

/* Print-specific styles */
@media print {
  .print-slides-container {
    background: white;
  }

  .print-slide-item {
    min-height: auto;
    height: auto;
    overflow: visible;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>

