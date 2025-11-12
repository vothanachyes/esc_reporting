<template>
  <div
    class="flex items-center justify-center w-full h-full video-container"
    ref="containerRef"
  >
    <video
      ref="videoRef"
      :src="videoUrl"
      class="w-full h-auto max-h-full max-w-full object-contain rounded-md"
      controls
      :volume="0.15"
      @loadedmetadata="handleVideoLoaded"
    >
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { VideoConfig } from "@/data/types";

const props = defineProps<{
  video: VideoConfig;
}>();

const containerRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const videoUrl = computed(() => {
  // Handle local videos
  if (props.video.local) {
    // If URL already starts with /, use it as-is (e.g., "/assets/video/file.mp4")
    if (props.video.url.startsWith("/")) {
      return props.video.url;
    }
    
    // Handle paths like "assets/video/file.mp4" or "src/assets/video/file.mp4"
    // For Vite/Vercel: files in public folder are served at root
    // So "assets/video/file.mp4" should become "/assets/video/file.mp4"
    let cleanPath = props.video.url;
    
    // Remove "src/" prefix if present (shouldn't be in public folder, but handle it)
    if (cleanPath.startsWith("src/")) {
      cleanPath = cleanPath.replace(/^src\//, "");
    }
    
    // Ensure path starts with / for absolute path from root
    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }
    
    return cleanPath;
  }
  
  // Handle external URLs (no modification needed)
  return props.video.url;
});

const handleVideoLoaded = () => {
  if (videoRef.value) {
    // Set default volume to 15%
    videoRef.value.volume = 0.15;
  }
};

onMounted(() => {
  if (videoRef.value) {
    // Ensure volume is set to 15% on mount
    videoRef.value.volume = 0.15;
  }
});
</script>

<style scoped>
.video-container {
  min-height: 0;
}

video {
  max-width: 100%;
  height: auto;
}
</style>

