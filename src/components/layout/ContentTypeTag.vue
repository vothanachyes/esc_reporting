<template>
  <div class="!h-[30px] w-full px-6 py-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-between gap-4">
    <!-- Custom Dropdown -->
    <div class="relative min-w-[120px] max-w-[200px]" ref="dropdownRef">
      <!-- Trigger Button -->
      <button
        @click="toggleDropdown"
        type="button"
        class="w-full h-full max-h-[26px] flex items-center justify-between gap-2 px-2 py-0.5 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        aria-label="Select content type"
      >
        <span
          v-if="selectedType"
          class="inline-block px-3 py-1 bg-gradient-to-r from-[#045174] to-[#0679a8] dark:from-[#045174] dark:to-[#0679a8] text-white dark:text-gray-100 text-xs font-semibold rounded-full shadow-md shadow-primary/30 border border-white/20 dark:border-gray-300/20"
        >
          {{ selectedType }}
        </span>
        <span v-else class="text-gray-500 dark:text-gray-400 text-xs">Select Type</span>
        <svg
          class="w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <ul
          v-if="isOpen"
          class="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none"
          role="listbox"
        >
          <li
            v-for="(type, index) in availableTypes"
            :key="index"
            @click="selectType(type)"
            class="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'bg-gray-100 dark:bg-gray-700': selectedType === type,
              'text-[#045174] dark:text-[#4da5b6] font-semibold': selectedType === type,
              'text-gray-700 dark:text-gray-300': selectedType !== type,
            }"
            role="option"
            :aria-selected="selectedType === type"
          >
            {{ type }}
          </li>
        </ul>
      </Transition>
    </div>

    <span
      v-if="title"
      v-tooltip="title"
      class="text-gray-700 dark:text-gray-300 text-sm font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]"
    >
      {{ title }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  type: string | undefined;
  title?: string;
  availableTypes: string[];
}>();

const emit = defineEmits<{
  "type-change": [type: string];
}>();

const selectedType = ref<string | undefined>(props.type);
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Watch for external type changes (e.g., when navigating slides)
watch(
  () => props.type,
  (newType) => {
    selectedType.value = newType;
  }
);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectType = (type: string) => {
  selectedType.value = type;
  isOpen.value = false;
  emit("type-change", type);
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Close dropdown on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
/* Custom scrollbar for dropdown */
ul::-webkit-scrollbar {
  width: 6px;
}

ul::-webkit-scrollbar-track {
  background: transparent;
}

ul::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

ul::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ul::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ul::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>

