<template>
  <div class="w-full px-6 py-2 bg-gray-100 dark:bg-gray-800">
    <span
      class="inline-block px-3 py-1 bg-primary dark:bg-primary-600 text-white dark:text-gray-100 text-sm font-semibold rounded-full"
    >
      {{ type }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: string;
}>();
</script>

