<template>
  <div class="flex flex-col gap-5 w-full h-full overflow-hidden">
    <div class="flex flex-col gap-2 flex-shrink-0">
      <h2 class="text-2xl md:text-3xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-white dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
        {{ title }}
      </h2>
      <div v-if="subtitles.length > 0" class="flex flex-col gap-1.5">
        <h3
          v-for="(subtitle, index) in subtitles"
          :key="index"
          class="text-base md:text-lg text-gray-200 dark:text-gray-300 font-medium"
        >
          {{ subtitle }}
        </h3>
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-hidden flex flex-col min-h-0">
      <div v-if="tableData.rows.length === 0" class="flex items-center justify-center h-full">
        <p class="text-gray-400 dark:text-gray-500 text-lg">No items to display</p>
      </div>
      <DataTable
        v-else
        :value="tableData.rows"
        scrollable
        scroll-height="100%"
        class="custom-table rounded-2xl overflow-hidden"
        v-model:sortField="sortField"
        v-model:sortOrder="sortOrder"
        :pt="{
          root: { class: 'h-full flex flex-col rounded-2xl overflow-hidden' },
          wrapper: { class: 'flex-1 overflow-auto rounded-2xl' },
          table: { class: 'min-w-full' },
          thead: { class: 'sticky top-0 z-10' },
          tbody: { class: '' },
          column: {
            headerCell: { class: 'bg-white/10 dark:bg-gray-800/50 border-b border-white/20 dark:border-gray-700/50' },
            headerContent: { class: 'text-white dark:text-gray-100 font-semibold' },
            bodyCell: { class: 'border-b border-white/10 dark:border-gray-700/30' },
            sortIcon: { class: 'text-white/70 dark:text-gray-400' },
          },
          row: {
            class: 'hover:bg-white/5 dark:hover:bg-gray-800/30 transition-colors',
          },
        }"
      >
        <Column
          field="status"
          header="Status"
          sortable
          :sort-function="sortByStatusPriority"
          class="status-column"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
                :class="{
                  'bg-gradient-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20': data.status === 'done',
                  'bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20': data.status === 'in-progress',
                  'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20': data.status === 'todo',
                }"
              >
                <span
                  class="w-2 h-2 rounded-full shadow-sm"
                  :class="{
                    'bg-gradient-to-br from-green-400 to-green-600': data.status === 'done',
                    'bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse': data.status === 'in-progress',
                    'bg-gradient-to-br from-yellow-400 to-orange-500': data.status === 'todo',
                  }"
                ></span>
                {{ data.status === "in-progress" ? "In Progress" : data.status }}
              </span>
            </div>
          </template>
          <template #sorticon="{ sorted, sortOrder: so }">
            <i
              v-if="sorted"
              :class="so === 1 ? 'pi pi-sort-up' : 'pi pi-sort-down'"
              class="text-white/70 dark:text-gray-400 text-[10px]"
            ></i>
            <i v-else class="pi pi-sort text-white/50 dark:text-gray-500 text-[10px]"></i>
          </template>
        </Column>

        <Column field="title" header="Title" sortable>
          <template #body="{ data }">
            <span class="text-sm md:text-base text-white dark:text-gray-100 font-semibold">
              {{ data.title }}
            </span>
          </template>
        </Column>

        <Column field="description" header="Description" sortable>
          <template #body="{ data }">
            <span
              v-if="data.description"
              class="text-xs md:text-sm text-gray-300 dark:text-gray-400 line-clamp-2"
              :title="data.description"
            >
              {{ data.description }}
            </span>
            <span v-else class="text-gray-500 dark:text-gray-600 text-xs italic">No description</span>
          </template>
        </Column>

        <Column field="slideTitle" header="Feature/Type" sortable>
          <template #body="{ data }">
            <span class="text-xs md:text-sm text-gray-200 dark:text-gray-300">
              {{ data.slideTitle }}
            </span>
          </template>
        </Column>

        <Column v-if="hasDates" field="doneDate" header="Done Date" sortable>
          <template #body="{ data }">
            <span
              v-if="data.doneDate"
              class="text-xs md:text-sm text-gray-300 dark:text-gray-400"
            >
              {{ data.doneDate }}
            </span>
            <span v-else class="text-gray-500 dark:text-gray-600 text-xs italic">—</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { ContentTable, TableRow } from "@/data/types";

const props = defineProps<{
  title: string;
  subtitles: string[];
  tableData: ContentTable;
}>();

const sortField = ref<string>("status");
const sortOrder = ref<1 | -1>(1); // 1 for ascending, -1 for descending

const hasDates = computed(() => {
  return props.tableData.rows.some((row) => row.doneDate);
});

/**
 * Custom sort function for status column
 * Sorts by priority: done (1) → in-progress (2) → todo (3)
 */
function getStatusPriority(status: "done" | "todo" | "in-progress"): number {
  switch (status) {
    case "done":
      return 1;
    case "in-progress":
      return 2;
    case "todo":
      return 3;
    default:
      return 4;
  }
}

function sortByStatusPriority(data1: TableRow, data2: TableRow): number {
  const priority1 = getStatusPriority(data1.status);
  const priority2 = getStatusPriority(data2.status);
  if (priority1 !== priority2) {
    return priority1 - priority2;
  }
  // If same status, sort by title
  return data1.title.localeCompare(data2.title);
}
</script>

<style scoped>
:deep(.custom-table) {
  --p-datatable-header-background: rgba(255, 255, 255, 0.08);
  --p-datatable-header-text-color: rgba(255, 255, 255, 0.95);
  --p-datatable-body-background: transparent;
  --p-datatable-body-text-color: rgba(255, 255, 255, 0.9);
  --p-datatable-border-color: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

:deep(.custom-table .p-datatable-root) {
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.custom-table .p-datatable-wrapper) {
  border-radius: 1rem;
  overflow: hidden;
}

/* Modern Header Styling */
:deep(.custom-table .p-datatable-thead > tr > th) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 2px solid rgba(4, 81, 116, 0.4) !important;
  padding: 1rem 1.25rem;
  font-weight: 700;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  transition: all 0.2s ease;
}

:deep(.custom-table .p-datatable-thead > tr > th:hover) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
}

/* Modern Body Styling */
:deep(.custom-table .p-datatable-tbody > tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.custom-table .p-datatable-tbody > tr > td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.2s ease;
}

:deep(.custom-table .p-datatable-tbody > tr:hover) {
  background: linear-gradient(90deg, rgba(4, 81, 116, 0.15) 0%, rgba(4, 81, 116, 0.05) 100%) !important;
  transform: translateX(2px);
  box-shadow: -4px 0 0 0 rgba(4, 81, 116, 0.3);
}

:deep(.custom-table .p-datatable-tbody > tr:hover > td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 1) !important;
}

/* Alternating row colors for better readability */
:deep(.custom-table .p-datatable-tbody > tr:nth-child(even)) {
  background: rgba(255, 255, 255, 0.02);
}

:deep(.custom-table .p-datatable-tbody > tr:nth-child(even):hover) {
  background: linear-gradient(90deg, rgba(4, 81, 116, 0.15) 0%, rgba(4, 81, 116, 0.05) 100%) !important;
}

/* Sortable Column Icons */
:deep(.custom-table .p-sortable-column-icon) {
  color: rgba(4, 81, 116, 0.6) !important;
  transition: all 0.2s ease;
  font-size: 10px !important;
  width: 10px !important;
  height: 10px !important;
}

:deep(.custom-table .p-sortable-column-icon:hover) {
  color: rgba(4, 81, 116, 1) !important;
  transform: scale(1.1);
}

:deep(.custom-table .p-sortable-column:not(.p-highlight):hover .p-sortable-column-icon) {
  color: rgba(4, 81, 116, 0.8) !important;
}

/* Dark mode adjustments */
.dark :deep(.custom-table .p-datatable-root) {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark :deep(.custom-table .p-datatable-thead > tr > th) {
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.6) 0%, rgba(31, 41, 55, 0.4) 100%) !important;
  border-bottom: 2px solid rgba(4, 81, 116, 0.5) !important;
}

.dark :deep(.custom-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid rgba(75, 85, 99, 0.2) !important;
}

.dark :deep(.custom-table .p-datatable-tbody > tr:hover) {
  background: linear-gradient(90deg, rgba(4, 81, 116, 0.2) 0%, rgba(4, 81, 116, 0.1) 100%) !important;
  box-shadow: -4px 0 0 0 rgba(4, 81, 116, 0.4);
}

.dark :deep(.custom-table .p-datatable-tbody > tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.1);
}

/* Status column styling */
:deep(.status-column) {
  min-width: 120px;
  max-width: 140px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.custom-table .p-datatable-thead > tr > th),
  :deep(.custom-table .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
  }
  
  :deep(.custom-table .p-datatable-thead > tr > th) {
    font-size: 0.6875rem;
    padding: 0.625rem 0.875rem;
  }
}

/* Modern Scrollbar styling */
:deep(.custom-table .p-datatable-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: rgba(4, 81, 116, 0.6) rgba(255, 255, 255, 0.05);
}

:deep(.custom-table .p-datatable-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.custom-table .p-datatable-wrapper::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

:deep(.custom-table .p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, rgba(4, 81, 116, 0.8) 0%, rgba(4, 81, 116, 0.6) 100%);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.custom-table .p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, rgba(4, 81, 116, 1) 0%, rgba(4, 81, 116, 0.8) 100%);
}

/* Smooth transitions for all interactive elements */
:deep(.custom-table *) {
  transition-property: background-color, border-color, color, transform, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>

