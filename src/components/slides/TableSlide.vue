<template>
  <div 
    class="flex flex-col gap-5 w-full"
    :class="props.isPrintMode ? 'min-h-0 overflow-visible print-table-container' : 'h-full overflow-hidden'"
  >
    <div class="flex flex-col gap-2 shrink-0 relative">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <h2 class="text-2xl md:text-3xl font-bold leading-tight bg-linear-to-r from-white via-gray-100 to-white dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
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
        <!-- Maximize Button - Positioned to avoid page number badge -->
        <button
          v-if="!props.isPrintMode && !props.isMaximized"
          @click="handleMaximize"
          class="absolute top-0 right-[50px] sm:right-[55px] md:right-[60px] w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-105 active:scale-95 z-20"
          aria-label="Maximize table"
        >
          <i class="pi pi-window-maximize text-sm"></i>
        </button>
      </div>
      
      <!-- Grouping Control -->
      <div v-if="!props.isPrintMode && tableData.rows.length > 0" class="flex items-center gap-3 mt-2">
        <label class="text-sm text-gray-300 dark:text-gray-400 font-medium whitespace-nowrap">Group by:</label>
        <div class="relative min-w-[120px] max-w-[180px]" ref="groupDropdownRef">
          <!-- Trigger Button -->
          <button
            @click="toggleGroupDropdown"
            type="button"
            class="w-full h-full max-h-[26px] flex items-center justify-between gap-2 px-2 py-0.5 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors"
            :aria-expanded="isGroupDropdownOpen"
            aria-haspopup="listbox"
            aria-label="Select group by option"
          >
            <span
              v-if="selectedGroupByLabel"
              class="inline-block px-3 py-1 bg-linear-to-r from-[#045174] to-[#0679a8] dark:from-[#045174] dark:to-[#0679a8] text-white dark:text-gray-100 text-xs font-semibold rounded-full shadow-md shadow-primary/30 border border-white/20 dark:border-gray-300/20"
            >
              {{ selectedGroupByLabel }}
            </span>
            <span v-else class="text-gray-500 dark:text-gray-400 text-xs">None</span>
            <svg
              class="w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform"
              :class="{ 'rotate-180': isGroupDropdownOpen }"
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
              v-if="isGroupDropdownOpen"
              class="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none"
              role="listbox"
            >
              <li
                v-for="(option, index) in groupByOptions"
                :key="index"
                @click="selectGroupBy(option.value as GroupByOption)"
                class="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :class="{
                  'bg-gray-100 dark:bg-gray-700': groupBy === option.value,
                  'text-[#045174] dark:text-[#4da5b6] font-semibold': groupBy === option.value,
                  'text-gray-700 dark:text-gray-300': groupBy !== option.value,
                }"
                role="option"
                :aria-selected="groupBy === option.value"
              >
                {{ option.label }}
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div 
      class="flex flex-col relative"
      :class="props.isPrintMode 
        ? 'min-h-0 overflow-visible print-table-wrapper' 
        : 'flex-1 overflow-hidden min-h-0'"
    >
      <div v-if="tableData.rows.length === 0" class="flex items-center justify-center h-full">
        <p class="text-gray-400 dark:text-gray-500 text-lg">No items to display</p>
      </div>
      
      <!-- Grouped View -->
      <div v-else-if="groupBy !== 'none'" class="flex flex-col gap-4 h-full overflow-auto">
        <div
          v-for="group in groupedData"
          :key="group.key"
          class="flex flex-col"
        >
          <!-- Group Header -->
          <button
            @click="toggleGroup(group.key)"
            class="flex items-center justify-between gap-3 px-4 py-3 bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-t-lg hover:bg-white/15 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <i
                :class="isGroupExpanded(group.key) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                class="text-white dark:text-gray-300 transition-transform"
              ></i>
              <span class="text-base font-semibold text-white dark:text-gray-100">
                {{ group.label }}
              </span>
              <span class="px-2 py-0.5 bg-white/20 dark:bg-gray-700/50 rounded-full text-xs text-white dark:text-gray-200">
                {{ group.rows.length }}
              </span>
            </div>
          </button>
          
          <!-- Group Content -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[5000px]"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 max-h-[5000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="isGroupExpanded(group.key)" class="overflow-hidden">
              <DataTable
                :value="group.rows"
                :scrollable="false"
                class="custom-table grouped-table rounded-b-lg overflow-hidden"
                :pt="{
                  root: { class: 'flex flex-col grouped-table-root rounded-b-lg overflow-hidden' },
                  wrapper: { class: 'overflow-visible grouped-table-wrapper rounded-b-lg' },
                  table: { class: 'min-w-full' },
                  thead: { class: 'sticky top-0 z-10' },
                  tbody: { class: '' },
                  column: {
                    headerCell: { class: 'bg-white/10 dark:bg-gray-800/50 border-b border-white/20 dark:border-gray-700/50 grouped-table-header' },
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
                  <template #sorticon="{ sorted, sortOrder: so }">
                    <i
                      v-if="sorted"
                      :class="so === 1 ? 'pi pi-sort-up' : 'pi pi-sort-down'"
                      class="text-white/70 dark:text-gray-400 text-[10px]"
                    ></i>
                    <i v-else class="pi pi-sort text-white/50 dark:text-gray-500 text-[10px]"></i>
                  </template>
                  <template #body="{ data }">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
                        :class="{
                          'bg-linear-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20': data.status === 'done',
                          'bg-linear-to-r from-blue-500/30 to-blue-600/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20': data.status === 'in-progress',
                          'bg-linear-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20': data.status === 'todo',
                        }"
                      >
                        <span
                          class="w-2 h-2 rounded-full shadow-sm"
                          :class="{
                            'bg-linear-to-br from-green-400 to-green-600': data.status === 'done',
                            'bg-linear-to-br from-blue-400 to-blue-600 animate-pulse': data.status === 'in-progress',
                            'bg-linear-to-br from-yellow-400 to-orange-500': data.status === 'todo',
                          }"
                        ></span>
                        {{ data.status === "in-progress" ? "In Progress" : data.status }}
                      </span>
                    </div>
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
          </Transition>
        </div>
      </div>
      
      <!-- Ungrouped View (Standard Table) -->
      <DataTable
        v-else
        :value="displayRows"
        :scrollable="!props.isPrintMode"
        :scroll-height="props.isPrintMode ? undefined : '100%'"
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
                  'bg-linear-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20': data.status === 'done',
                  'bg-linear-to-r from-blue-500/30 to-blue-600/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20': data.status === 'in-progress',
                  'bg-linear-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20': data.status === 'todo',
                }"
              >
                <span
                  class="w-2 h-2 rounded-full shadow-sm"
                  :class="{
                    'bg-linear-to-br from-green-400 to-green-600': data.status === 'done',
                    'bg-linear-to-br from-blue-400 to-blue-600 animate-pulse': data.status === 'in-progress',
                    'bg-linear-to-br from-yellow-400 to-orange-500': data.status === 'todo',
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
    
    <!-- Maximize Dialog -->
    <Teleport to="body">
      <PrimeDialog
        v-model:visible="isMaximizedDialogVisible"
        modal
        :closable="true"
        :draggable="false"
        :maximizable="false"
        class="table-maximize-dialog"
        :pt="{
          root: { class: 'w-full h-full max-w-full max-h-full m-0' },
          content: { class: 'p-6 h-full flex flex-col' },
          header: { class: 'shrink-0' },
        }"
        @hide="handleMinimize"
      >
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col gap-1">
              <h3 class="text-xl font-bold text-white dark:text-gray-100">{{ title }}</h3>
              <div v-if="subtitles.length > 0" class="flex flex-col gap-0.5">
                <span
                  v-for="(subtitle, index) in subtitles"
                  :key="index"
                  class="text-sm text-gray-300 dark:text-gray-400"
                >
                  {{ subtitle }}
                </span>
              </div>
            </div>
            <button
              @click="handleMinimize"
              class="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 border border-white/20 dark:border-gray-700/50 transition-all duration-200 text-white dark:text-gray-100 hover:scale-105 active:scale-95"
              aria-label="Minimize table"
            >
              <i class="pi pi-window-minimize text-sm"></i>
            </button>
          </div>
        </template>
        
        <div class="flex-1 overflow-hidden min-h-0">
          <!-- Render table content directly to avoid recursion -->
          <div class="flex flex-col gap-5 w-full h-full overflow-hidden">
            <!-- Grouping Control -->
            <div v-if="tableData.rows.length > 0" class="flex items-center gap-3">
              <label class="text-sm text-gray-300 dark:text-gray-400 font-medium whitespace-nowrap">Group by:</label>
              <div class="relative min-w-[120px] max-w-[180px]" ref="groupDropdownRefMaximized">
                <!-- Trigger Button -->
                <button
                  @click="toggleGroupDropdownMaximized"
                  type="button"
                  class="w-full h-full max-h-[26px] flex items-center justify-between gap-2 px-2 py-0.5 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors"
                  :aria-expanded="isGroupDropdownOpenMaximized"
                  aria-haspopup="listbox"
                  aria-label="Select group by option"
                >
                  <span
                    v-if="selectedGroupByLabel"
                    class="inline-block px-3 py-1 bg-linear-to-r from-[#045174] to-[#0679a8] dark:from-[#045174] dark:to-[#0679a8] text-white dark:text-gray-100 text-xs font-semibold rounded-full shadow-md shadow-primary/30 border border-white/20 dark:border-gray-300/20"
                  >
                    {{ selectedGroupByLabel }}
                  </span>
                  <span v-else class="text-gray-500 dark:text-gray-400 text-xs">None</span>
                  <svg
                    class="w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': isGroupDropdownOpenMaximized }"
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
                    v-if="isGroupDropdownOpenMaximized"
                    class="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none"
                    role="listbox"
                  >
                    <li
                      v-for="(option, index) in groupByOptions"
                      :key="index"
                      @click="selectGroupBy(option.value as GroupByOption)"
                      class="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      :class="{
                        'bg-gray-100 dark:bg-gray-700': groupBy === option.value,
                        'text-[#045174] dark:text-[#4da5b6] font-semibold': groupBy === option.value,
                        'text-gray-700 dark:text-gray-300': groupBy !== option.value,
                      }"
                      role="option"
                      :aria-selected="groupBy === option.value"
                    >
                      {{ option.label }}
                    </li>
                  </ul>
                </Transition>
              </div>
            </div>
            
            <!-- Table Container (same as main view) -->
            <div class="flex flex-col relative flex-1 overflow-hidden min-h-0">
              <div v-if="tableData.rows.length === 0" class="flex items-center justify-center h-full">
                <p class="text-gray-400 dark:text-gray-500 text-lg">No items to display</p>
              </div>
              
              <!-- Grouped View -->
              <div v-else-if="groupBy !== 'none'" class="flex flex-col gap-4 h-full overflow-auto">
                <div
                  v-for="group in groupedData"
                  :key="group.key"
                  class="flex flex-col"
                >
                  <!-- Group Header -->
                  <button
                    @click="toggleGroup(group.key)"
                    class="flex items-center justify-between gap-3 px-4 py-3 bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-t-lg hover:bg-white/15 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <i
                        :class="isGroupExpanded(group.key) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                        class="text-white dark:text-gray-300 transition-transform"
                      ></i>
                      <span class="text-base font-semibold text-white dark:text-gray-100">
                        {{ group.label }}
                      </span>
                      <span class="px-2 py-0.5 bg-white/20 dark:bg-gray-700/50 rounded-full text-xs text-white dark:text-gray-200">
                        {{ group.rows.length }}
                      </span>
                    </div>
                  </button>
                  
                  <!-- Group Content -->
                  <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[5000px]"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 max-h-[5000px]"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="isGroupExpanded(group.key)" class="overflow-hidden">
                      <DataTable
                        :value="group.rows"
                        :scrollable="false"
                        class="custom-table grouped-table rounded-b-lg overflow-hidden"
                        :pt="{
                          root: { class: 'flex flex-col grouped-table-root rounded-b-lg overflow-hidden' },
                          wrapper: { class: 'overflow-visible grouped-table-wrapper rounded-b-lg' },
                          table: { class: 'min-w-full' },
                          thead: { class: 'sticky top-0 z-10' },
                          tbody: { class: '' },
                          column: {
                            headerCell: { class: 'bg-white/10 dark:bg-gray-800/50 border-b border-white/20 dark:border-gray-700/50 grouped-table-header' },
                            headerContent: { class: 'text-white dark:text-gray-100 font-semibold' },
                            bodyCell: { class: 'border-b border-white/10 dark:border-gray-700/30' },
                            sortIcon: { class: 'text-white/70 dark:text-gray-400' },
                          },
                          row: {
                            class: 'hover:bg-white/5 dark:hover:bg-gray-800/30 transition-colors',
                          },
                        }"
                      >
                        <Column field="status" header="Status" sortable :sort-function="sortByStatusPriority" class="status-column">
                          <template #sorticon="{ sorted, sortOrder: so }">
                            <i
                              v-if="sorted"
                              :class="so === 1 ? 'pi pi-sort-up' : 'pi pi-sort-down'"
                              class="text-white/70 dark:text-gray-400 text-[10px]"
                            ></i>
                            <i v-else class="pi pi-sort text-white/50 dark:text-gray-500 text-[10px]"></i>
                          </template>
                          <template #body="{ data }">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
                                :class="{
                                  'bg-linear-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20': data.status === 'done',
                                  'bg-linear-to-r from-blue-500/30 to-blue-600/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20': data.status === 'in-progress',
                                  'bg-linear-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20': data.status === 'todo',
                                }"
                              >
                                <span
                                  class="w-2 h-2 rounded-full shadow-sm"
                                  :class="{
                                    'bg-linear-to-br from-green-400 to-green-600': data.status === 'done',
                                    'bg-linear-to-br from-blue-400 to-blue-600 animate-pulse': data.status === 'in-progress',
                                    'bg-linear-to-br from-yellow-400 to-orange-500': data.status === 'todo',
                                  }"
                                ></span>
                                {{ data.status === "in-progress" ? "In Progress" : data.status }}
                              </span>
                            </div>
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
                  </Transition>
                </div>
              </div>
              
              <!-- Ungrouped View -->
              <DataTable
                v-else
                :value="displayRows"
                :scrollable="true"
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
                <Column field="status" header="Status" sortable :sort-function="sortByStatusPriority" class="status-column">
                  <template #body="{ data }">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
                        :class="{
                          'bg-linear-to-r from-green-500/30 to-green-600/30 text-green-300 border-2 border-green-400/50 shadow-green-500/20': data.status === 'done',
                          'bg-linear-to-r from-blue-500/30 to-blue-600/30 text-blue-300 border-2 border-blue-400/50 shadow-blue-500/20': data.status === 'in-progress',
                          'bg-linear-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-2 border-yellow-400/50 shadow-yellow-500/20': data.status === 'todo',
                        }"
                      >
                        <span
                          class="w-2 h-2 rounded-full shadow-sm"
                          :class="{
                            'bg-linear-to-br from-green-400 to-green-600': data.status === 'done',
                            'bg-linear-to-br from-blue-400 to-blue-600 animate-pulse': data.status === 'in-progress',
                            'bg-linear-to-br from-yellow-400 to-orange-500': data.status === 'todo',
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
        </div>
      </PrimeDialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import PrimeDialog from "primevue/dialog";
import type { ContentTable, TableRow } from "@/data/types";
import { useMaximizeMode } from "@/composables/useMaximizeMode";

type GroupByOption = "none" | "status" | "feature";

const props = defineProps<{
  title: string;
  subtitles: string[];
  tableData: ContentTable;
  isPrintMode?: boolean;
  isMaximized?: boolean;
}>();

const emit = defineEmits<{
  "maximize": [];
  "minimize": [];
}>();

const sortField = ref<string>("status");
const sortOrder = ref<1 | -1>(1); // 1 for ascending, -1 for descending
const groupBy = ref<GroupByOption>("none");
const expandedGroups = ref<Set<string>>(new Set());
const isMaximizedDialogVisible = ref(false);
const { isMaximized: isGlobalMaximized, setMaximized, clearMaximized } = useMaximizeMode();
const slideId = `table-${props.title}-${props.subtitles.join("-")}`;

// Dropdown state
const isGroupDropdownOpen = ref(false);
const isGroupDropdownOpenMaximized = ref(false);
const groupDropdownRef = ref<HTMLElement | null>(null);
const groupDropdownRefMaximized = ref<HTMLElement | null>(null);

const groupByOptions = [
  { label: "None", value: "none" },
  { label: "Group by Status", value: "status" },
  { label: "Group by Feature/Type", value: "feature" },
];

const selectedGroupByLabel = computed(() => {
  const option = groupByOptions.find(opt => opt.value === groupBy.value);
  return option ? option.label : null;
});

const toggleGroupDropdown = () => {
  isGroupDropdownOpen.value = !isGroupDropdownOpen.value;
};

const toggleGroupDropdownMaximized = () => {
  isGroupDropdownOpenMaximized.value = !isGroupDropdownOpenMaximized.value;
};

const selectGroupBy = (value: GroupByOption) => {
  groupBy.value = value;
  isGroupDropdownOpen.value = false;
  isGroupDropdownOpenMaximized.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (groupDropdownRef.value && !groupDropdownRef.value.contains(event.target as Node)) {
    isGroupDropdownOpen.value = false;
  }
  if (groupDropdownRefMaximized.value && !groupDropdownRefMaximized.value.contains(event.target as Node)) {
    isGroupDropdownOpenMaximized.value = false;
  }
};

// Close dropdown on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    if (isGroupDropdownOpen.value) {
      isGroupDropdownOpen.value = false;
    }
    if (isGroupDropdownOpenMaximized.value) {
      isGroupDropdownOpenMaximized.value = false;
    }
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

const hasDates = computed(() => {
  return props.tableData.rows.some((row) => row.doneDate);
});

// Initialize all groups as expanded when grouping changes
watch(groupBy, (newGroupBy) => {
  if (newGroupBy !== "none") {
    const groups = getGroupKeys(newGroupBy);
    expandedGroups.value = new Set(groups);
  } else {
    expandedGroups.value.clear();
  }
}, { immediate: true });

function getGroupKeys(groupByValue: GroupByOption): string[] {
  if (groupByValue === "none") return [];
  
  const uniqueKeys = new Set<string>();
  props.tableData.rows.forEach((row) => {
    if (groupByValue === "status") {
      uniqueKeys.add(row.status);
    } else if (groupByValue === "feature") {
      uniqueKeys.add(row.slideTitle);
    }
  });
  
  return Array.from(uniqueKeys);
}

function toggleGroup(groupKey: string) {
  if (expandedGroups.value.has(groupKey)) {
    expandedGroups.value.delete(groupKey);
  } else {
    expandedGroups.value.add(groupKey);
  }
}

function isGroupExpanded(groupKey: string): boolean {
  return expandedGroups.value.has(groupKey);
}

function handleMaximize() {
  isMaximizedDialogVisible.value = true;
  setMaximized(slideId);
  emit("maximize");
}

function handleMinimize() {
  isMaximizedDialogVisible.value = false;
  clearMaximized();
  emit("minimize");
}

// Watch for external maximize state changes
watch(() => isGlobalMaximized.value, (maximized) => {
  if (!maximized && isMaximizedDialogVisible.value) {
    isMaximizedDialogVisible.value = false;
  }
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

/**
 * Sort rows based on current sortField and sortOrder
 */
function sortRows(rows: TableRow[]): TableRow[] {
  const sorted = [...rows];
  
  if (sortField.value === "status") {
    sorted.sort((a, b) => {
      const result = sortByStatusPriority(a, b);
      return sortOrder.value === 1 ? result : -result;
    });
  } else {
    sorted.sort((a, b) => {
      const aValue = (a as any)[sortField.value] || "";
      const bValue = (b as any)[sortField.value] || "";
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder.value === 1 ? comparison : -comparison;
    });
  }
  
  return sorted;
}

/**
 * Group rows by selected field
 */
type GroupedData = {
  key: string;
  label: string;
  rows: TableRow[];
};

const groupedData = computed<GroupedData[]>(() => {
  if (groupBy.value === "none") {
    return [];
  }
  
  const groups = new Map<string, TableRow[]>();
  
  // Group rows
  props.tableData.rows.forEach((row) => {
    let key: string;
    if (groupBy.value === "status") {
      key = row.status;
    } else {
      key = row.slideTitle;
    }
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });
  
  // Convert to array and sort within each group
  const result: GroupedData[] = [];
  groups.forEach((rows, key) => {
    const sortedRows = sortRows(rows);
    result.push({
      key,
      label: groupBy.value === "status" 
        ? (key === "in-progress" ? "In Progress" : key.charAt(0).toUpperCase() + key.slice(1))
        : key,
      rows: sortedRows,
    });
  });
  
  // Sort groups
  if (groupBy.value === "status") {
    result.sort((a, b) => {
      const priorityA = getStatusPriority(a.key as "done" | "todo" | "in-progress");
      const priorityB = getStatusPriority(b.key as "done" | "todo" | "in-progress");
      return priorityA - priorityB;
    });
  } else {
    result.sort((a, b) => a.label.localeCompare(b.label));
  }
  
  return result;
});

/**
 * Get rows to display (either grouped or ungrouped)
 */
const displayRows = computed<TableRow[]>(() => {
  if (groupBy.value === "none") {
    return sortRows(props.tableData.rows);
  }
  // When grouped, return empty array - we'll render groups separately
  return [];
});
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

/* Print mode styles */
.print-table-container {
  height: auto;
  min-height: 0;
}

.print-table-wrapper {
  height: auto;
  min-height: 0;
}

@media print {
  .print-table-container,
  .print-table-wrapper {
    height: auto;
    overflow: visible;
  }
  
  :deep(.custom-table .p-datatable-wrapper) {
    overflow: visible !important;
    max-height: none !important;
  }
}

/* Maximize Dialog Styles */
:deep(.table-maximize-dialog .p-dialog) {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

:deep(.table-maximize-dialog .p-dialog-content) {
  height: calc(100vh - 120px) !important;
  padding: 1.5rem !important;
  background: linear-gradient(135deg, #022f40 0%, #011e26 100%);
}

:deep(.table-maximize-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #022f40 0%, #011e26 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem !important;
}

:deep(.table-maximize-dialog .p-dialog-mask) {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

/* Custom Dropdown Scrollbar */
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

/* Remove rounded corners from grouped table headers and containers */
:deep(.grouped-table.custom-table) {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

:deep(.grouped-table.custom-table .p-datatable-root) {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

:deep(.grouped-table.custom-table .p-datatable-wrapper) {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

:deep(.grouped-table-header) {
  border-radius: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

:deep(.grouped-table-header:first-child) {
  border-top-left-radius: 0 !important;
}

:deep(.grouped-table-header:last-child) {
  border-top-right-radius: 0 !important;
}
</style>

