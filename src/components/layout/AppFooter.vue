<template>
  <footer class="w-full h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2">
      <button
        v-for="report in reportConfigs"
        :key="report.jsonPath"
        :class="[
          'px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
          activeReportPath === report.jsonPath
            ? 'bg-primary dark:bg-primary-600 text-white dark:text-gray-100'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
        @click="handleReportChange(report.jsonPath)"
      >
        {{ report.label }}
      </button>
    </div>
    <button
      class="px-4 py-2 bg-primary dark:bg-primary-600 text-white dark:text-gray-100 text-sm font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
      @click="$emit('toggle-view')"
    >
      View All
    </button>
  </footer>
</template>

<script setup lang="ts">
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

const reportConfigs: ReportConfig[] = [
  { jsonPath: "@/data/octoberReport.json", label: "October" },
  { jsonPath: "@/data/novemberReport.json", label: "November" },
];

const handleReportChange = (jsonPath: string) => {
  emit("change-report", jsonPath);
};
</script>

