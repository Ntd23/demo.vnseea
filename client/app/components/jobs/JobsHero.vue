  <section class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white shadow-2xl group/hero">
    <!-- Premium Decorations -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]" />
    <div class="button-shadow-sm absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

    <div class="relative z-10 flex flex-col gap-10 px-8 py-12 sm:px-12 lg:px-16 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[780px] space-y-6">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-300/80 pl-1">
          {{ $t("pages.jobsPage.heroEyebrow") }}
        </p>
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white">
          {{ $t("pages.jobsPage.heroTitle") }}
        </h1>
        <p class="text-base font-medium leading-relaxed text-white/78 sm:text-lg pl-0.5 max-w-2xl">
          {{ $t("pages.jobsPage.heroDescription") }}
        </p>

        <div class="flex flex-wrap items-center gap-4 pt-4">
          <UButton
            size="xl"
            class="h-14 rounded-2xl bg-white text-primary-950 hover:bg-primary-50 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-white/10 transition-all active:scale-95 px-10"
            @click="$emit('openPost')"
          >
            <template #leading>
              <Icon name="i-ph-briefcase-duotone" class="h-5 w-5" />
            </template>
            {{ $t("pages.jobsPage.postJob") }}
          </UButton>

          <UButton
            variant="soft"
            size="xl"
            class="h-14 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-xl transition-all active:scale-95 px-8"
            @click="$emit('toggleSaved')"
          >
            <template #leading>
              <Icon :name="savedOnly ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple-duotone'" class="h-5 w-5" />
            </template>
            {{ $t("pages.jobsPage.savedJobs") }}
          </UButton>

          <div class="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 text-[11px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md">
            <Icon name="i-ph-list-magnifying-glass-duotone" class="h-5 w-5 text-primary-300" />
            {{ $t("pages.jobsPage.jobCount", { count: jobCount }) }}
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
        <div
          v-for="item in stats"
          :key="item.label"
          class="group/stat rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/10"
        >
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/stat:text-primary-300 transition-colors">
            {{ item.label }}
          </p>
          <p class="mt-4 text-4xl font-black text-white leading-none tracking-tight">
            {{ item.value }}
          </p>
          <p class="mt-2 text-[10px] font-bold text-white/40 group-hover/stat:text-white/60">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  jobCount: number
  savedOnly: boolean
  stats: ReadonlyArray<{
    label: string
    value: string | number
    description: string
  }>
}>()

defineEmits<{
  openPost: []
  toggleSaved: []
}>()
</script>
