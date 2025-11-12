<template>
  <PrimeDialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="screen-size-warning-dialog"
    :pt="{
      root: { class: 'max-w-md mx-auto' },
      content: { class: 'p-6' },
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg
            class="w-6 h-6 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Screen Size Recommendation
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        This presentation is optimized for viewing on <strong>desktop computers, tablets, or large screens</strong> to provide the best experience.
      </p>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        You are currently viewing on a small screen. Some UI elements may not display correctly, and the layout may appear distorted or difficult to navigate.
      </p>
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Tip:</strong> For the best viewing experience, please access this presentation on a device with a larger screen (desktop, tablet, or laptop).
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <PrimeButton
          label="I Understand"
          @click="handleDismiss"
          class="px-6"
        />
      </div>
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import PrimeDialog from "primevue/dialog";
import PrimeButton from "primevue/button";
import { useScreenSize } from "@/composables/useScreenSize";

const { isSmallScreen } = useScreenSize();
const isVisible = ref(false);

const STORAGE_KEY = "screen-size-warning-dismissed";

const shouldShowDialog = computed(() => {
  // Only show if it's a small screen and user hasn't dismissed it
  if (!isSmallScreen.value) {
    return false;
  }
  // Check if user has dismissed it in this session
  return !sessionStorage.getItem(STORAGE_KEY);
});

// Watch for screen size changes and show dialog accordingly
watch(
  [shouldShowDialog, isSmallScreen],
  ([shouldShow]) => {
    if (shouldShow && isSmallScreen.value) {
      isVisible.value = true;
    } else {
      isVisible.value = false;
    }
  },
  { immediate: true },
);

// Also check on mount in case screen size detection hasn't fired yet
onMounted(() => {
  if (shouldShowDialog.value && isSmallScreen.value) {
    isVisible.value = true;
  }
});

const handleDismiss = () => {
  // Store dismissal in sessionStorage (only for this session)
  sessionStorage.setItem(STORAGE_KEY, "true");
  isVisible.value = false;
};
</script>

<style scoped>
:deep(.screen-size-warning-dialog .p-dialog-content) {
  padding: 1.5rem;
}
</style>

