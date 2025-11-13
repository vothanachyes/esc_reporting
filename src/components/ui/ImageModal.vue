<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- Close Button -->
        <button
          @click="handleClose"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close image modal"
        >
          <i class="pi pi-times text-lg"></i>
        </button>

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          @click.stop="handlePrev"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Previous image"
        >
          <i class="pi pi-chevron-left text-xl"></i>
        </button>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          @click.stop="handleNext"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Next image"
        >
          <i class="pi pi-chevron-right text-xl"></i>
        </button>

        <!-- Image Container -->
        <div class="relative w-full h-full flex items-center justify-center p-4">
          <Transition name="image-fade" mode="out-in">
            <img
              :key="currentIndex"
              :src="getImageUrl(currentImage)"
              :alt="currentImage.alt || `Image ${currentIndex + 1}`"
              class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              @load="handleImageLoad"
            />
          </Transition>
        </div>

        <!-- Image Counter -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 text-white dark:text-gray-100 text-sm font-medium"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Teleport } from "vue";
import type { ImageConfig } from "@/data/types";

const props = defineProps<{
  visible: boolean;
  images: ImageConfig[];
  initialIndex?: number;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
}>();

const currentIndex = ref(props.initialIndex ?? 0);
const imageLoaded = ref(false);

const currentImage = computed(() => {
  if (props.images.length === 0) {
    return { url: "", alt: "" };
  }
  return props.images[currentIndex.value] || props.images[0];
});

const getImageUrl = (image: ImageConfig): string => {
  if (image.local) {
    return image.url.startsWith("/") ? image.url : `/${image.url}`;
  }
  return image.url;
};

const handleClose = () => {
  emit("update:visible", false);
  emit("close");
};

const handleNext = () => {
  if (props.images.length <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
  imageLoaded.value = false;
};

const handlePrev = () => {
  if (props.images.length <= 1) return;
  currentIndex.value =
    currentIndex.value === 0
      ? props.images.length - 1
      : currentIndex.value - 1;
  imageLoaded.value = false;
};

const handleImageLoad = () => {
  imageLoaded.value = true;
};

// Watch for initialIndex changes
watch(
  () => props.initialIndex,
  (newIndex) => {
    if (newIndex !== undefined && newIndex >= 0 && newIndex < props.images.length) {
      currentIndex.value = newIndex;
    }
  }
);

// Watch for visible changes - reset index when opening
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && props.initialIndex !== undefined) {
      currentIndex.value = props.initialIndex;
    }
  }
);

// Keyboard event handler
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.visible) return;
  
  switch (event.key) {
    case "Escape":
      handleClose();
      break;
    case "ArrowLeft":
      handlePrev();
      break;
    case "ArrowRight":
      handleNext();
      break;
  }
};

// Prevent body scroll when modal is open
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }
  }
);

onMounted(() => {
  if (props.visible) {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Image fade transition */
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.3s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}
</style>

