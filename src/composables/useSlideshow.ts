import { ref } from "vue";
import type { SlideCard } from "@/data/types";

export function useSlideshow(slides: SlideCard[]) {
  const currentIndex = ref(0);
  const isPlaying = ref(false);

  const next = () => {
    if (currentIndex.value < slides.length - 1) {
      currentIndex.value++;
    }
  };

  const previous = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < slides.length) {
      currentIndex.value = index;
    }
  };

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value;
  };

  return {
    currentIndex,
    isPlaying,
    next,
    previous,
    goTo,
    togglePlay,
  };
}

