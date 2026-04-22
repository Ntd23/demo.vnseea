  <aside class="space-y-6">
    <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-xl bg-white space-y-6 group/stats">
      <div class="space-y-1">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.jobsPage.sidebarQuickStats") }}
        </p>
        <h3 class="text-lg font-black tracking-tight text-secondary-900">{{ $t("pages.jobsPage.overview") }}</h3>
      </div>
      <div class="grid gap-3">
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-2xl bg-secondary-50/50 px-4 py-4 ring-1 ring-secondary-100 transition-all hover:bg-white hover:ring-primary-100 group/stat"
        >
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-secondary-400 group-hover/stat:text-primary-500 transition-colors">
            {{ item.label }}
          </p>
          <p class="mt-2 text-2xl font-black text-secondary-900 tracking-tight">
            {{ item.value }}
          </p>
        </div>
      </div>
    </section>

    <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-xl bg-white space-y-6 group/categories">
      <div class="space-y-1.5">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.jobsPage.sidebarHiringCategories") }}
        </p>
        <h3 class="text-lg font-black tracking-tight text-secondary-900">{{ $t("pages.jobsPage.popularFields") }}</h3>
      </div>
      <div class="space-y-2.5">
        <button
          v-for="category in categories"
          :key="category.value"
          class="flex w-full items-center justify-between rounded-xl border border-secondary-100 bg-secondary-50/30 px-4 py-3.5 text-left transition-all hover:bg-white hover:border-primary-100 hover:shadow-md active:scale-95 group/btn"
          type="button"
          @click="$emit('selectCategory', category.value)"
        >
          <span class="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-secondary-500 group-hover/btn:text-primary-600 transition-colors">
            <Icon :name="category.icon.replace('-fill', '-duotone')" class="h-4.5 w-4.5 text-primary-500 transition-transform group-hover/btn:scale-110" />
            <span class="truncate">{{ category.label }}</span>
          </span>
          <span class="rounded-lg bg-white px-2 py-1 text-[10px] font-black text-secondary-400 ring-1 ring-secondary-100 group-hover/btn:text-primary-500 group-hover/btn:ring-primary-100">
            {{ category.count }}
          </span>
        </button>
      </div>
    </section>
  </aside>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number }>
  categories: ReadonlyArray<{ label: string; value: string; icon: string; count: number }>
}>()

defineEmits<{
  selectCategory: [value: string]
}>()
</script>
