<template>
  <footer class="w-full h-[50px] px-6 flex items-center justify-between backdrop-blur-md border-t border-white/10 dark:border-gray-700/30 shadow-lg" :style="footerStyle">
    <div class="flex items-center gap-2">
      <button
        v-for="report in reportConfigs"
        :key="report.jsonPath"
        :class="[
          'px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-md',
          activeReportPath === report.jsonPath
            ? 'bg-gradient-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 scale-105'
            : 'bg-white/10 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-white/20 dark:hover:border-gray-600/50 hover:scale-105'
        ]"
        @click="handleReportChange(report.jsonPath)"
      >
        {{ report.label }}
      </button>
    </div>
    <button
      class="px-5 py-2 bg-gradient-to-r from-primary to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white dark:text-gray-100 text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary-300/50 dark:border-primary-400/50 hover:scale-105"
      @click="$emit('toggle-view')"
    >
      View All
    </button>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDarkMode } from "@/composables/useDarkMode";

type ReportConfig = {
  jsonPath: string;
  label: string;
};

defineProps<{
  activeReportPath?: string;
}>();

const emit = defineEmits<{
  "toggle-view": [];
  "change-report": [jsonPath: string];
}>();

const { isDark } = useDarkMode();

const reportConfigs: ReportConfig[] = [
  { jsonPath: "@/data/octoberReport.json", label: "October" },
  { jsonPath: "@/data/novemberReport.json", label: "November" },
];

const footerStyle = computed(() => {
  const gradient = isDark.value
    ? "linear-gradient(135deg, rgba(2, 47, 64, 0.95) 0%, rgba(1, 30, 38, 0.95) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)";
  return {
    background: gradient,
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  };
});

const handleReportChange = (jsonPath: string) => {
  emit("change-report", jsonPath);
};
</script>

