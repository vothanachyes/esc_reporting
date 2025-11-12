import { ref, computed, onUnmounted } from "vue";
import type { ImageConfig } from "@/data/types";

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  loaded: boolean;
}

/**
 * Composable to load images and extract their natural dimensions
 * Returns aspect ratios for all images to calculate optimal container sizes
 */
export function useImageDimensions(images: ImageConfig[]) {
  const dimensions = ref<Map<string, ImageDimensions>>(new Map());
  const loadingImages = ref<Set<string>>(new Set());
  const loadPromises: Promise<void>[] = [];

  /**
   * Get image URL (handles local and remote images)
   */
  const getImageUrl = (image: ImageConfig): string => {
    if (image.local) {
      return image.url.startsWith("/") ? image.url : `/${image.url}`;
    }
    return image.url;
  };

  /**
   * Load a single image and extract its dimensions
   */
  const loadImageDimensions = (image: ImageConfig): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
      const url = getImageUrl(image);
      const cacheKey = url;

      // Return cached dimensions if available
      if (dimensions.value.has(cacheKey)) {
        const cached = dimensions.value.get(cacheKey)!;
        if (cached.loaded) {
          resolve(cached);
          return;
        }
      }

      // Mark as loading
      loadingImages.value.add(cacheKey);

      const img = new Image();
      
      img.onload = () => {
        const dims: ImageDimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          loaded: true,
        };
        
        dimensions.value.set(cacheKey, dims);
        loadingImages.value.delete(cacheKey);
        resolve(dims);
      };

      img.onerror = () => {
        // Fallback to default aspect ratio (16:9) if image fails to load
        const dims: ImageDimensions = {
          width: 1920,
          height: 1080,
          aspectRatio: 16 / 9,
          loaded: false,
        };
        
        dimensions.value.set(cacheKey, dims);
        loadingImages.value.delete(cacheKey);
        resolve(dims); // Resolve with fallback instead of rejecting
      };

      img.src = url;
    });
  };

  /**
   * Load all images and extract their dimensions
   */
  const loadAllImages = async (): Promise<void> => {
    const promises = images.map((image) => loadImageDimensions(image));
    await Promise.all(promises);
  };

  /**
   * Get dimensions for a specific image
   */
  const getImageDimensions = (image: ImageConfig): ImageDimensions | null => {
    const url = getImageUrl(image);
    return dimensions.value.get(url) || null;
  };

  /**
   * Get aspect ratio for a specific image
   */
  const getAspectRatio = (image: ImageConfig): number => {
    const dims = getImageDimensions(image);
    return dims?.aspectRatio || 16 / 9; // Default to 16:9 if not loaded
  };

  /**
   * Get the first image's aspect ratio (useful for grid/scrollable layouts)
   */
  const firstImageAspectRatio = computed(() => {
    if (images.length === 0) return 16 / 9;
    return getAspectRatio(images[0]);
  });

  /**
   * Check if all images are loaded
   */
  const allImagesLoaded = computed(() => {
    return images.every((image) => {
      const url = getImageUrl(image);
      const dims = dimensions.value.get(url);
      return dims?.loaded === true;
    });
  });

  /**
   * Check if any images are currently loading
   */
  const isLoading = computed(() => loadingImages.value.size > 0);

  // Load all images on initialization
  if (images.length > 0) {
    loadAllImages();
  }

  return {
    dimensions: computed(() => dimensions.value),
    getImageDimensions,
    getAspectRatio,
    firstImageAspectRatio,
    allImagesLoaded,
    isLoading,
    loadAllImages,
  };
}

