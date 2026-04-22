  <div class="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_380px]">
    <div class="space-y-12">
      <!-- Header Info Section -->
      <section class="surface-card p-8 sm:p-10 space-y-8 ring-1 ring-secondary-100 shadow-xl bg-white group/header transition-all hover:shadow-2xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-secondary-50 pb-8 transition-colors group-hover/header:border-primary-100">
          <div class="max-w-2xl space-y-2.5">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
              {{ $t("pages.createEventPage.editorEyebrow") }}
            </p>
            <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
              {{ $t("pages.createEventPage.infoTitle") }}
            </h2>
            <p class="text-sm font-medium leading-relaxed text-secondary-500 pl-1 italic">
              "{{ $t("pages.createEventPage.infoDescription") }}"
            </p>
          </div>

          <UBadge
            variant="soft"
            size="lg"
            class="rounded-2xl px-6 font-black uppercase tracking-widest h-12 bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm flex items-center justify-center min-w-[180px]"
          >
            <template #leading>
              <Icon name="i-ph-seal-check-duotone" class="h-5 w-5 mr-3" />
            </template>
            {{ completionText }}
          </UBadge>
        </div>
      </section>

      <!-- Form Section -->
      <section class="surface-card p-8 sm:p-12 space-y-12 ring-1 ring-secondary-100 shadow-2xl bg-white group/form transition-all hover:shadow-3xl">
        <!-- Basic Info -->
        <div class="space-y-10">
          <UFormGroup :label="$t('pages.createEventPage.eventName')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
            <UInput
              v-model="title"
              :placeholder="$t('pages.createEventPage.eventNamePlaceholder')"
              size="xl"
              class="rounded-2xl"
              maxlength="120"
              :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-xl px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
            />
          </UFormGroup>

          <UFormGroup :label="$t('pages.createEventPage.descriptionLabel')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
            <UTextarea
              v-model="description"
              :placeholder="$t('pages.createEventPage.descriptionPlaceholder')"
              size="xl"
              :rows="7"
              class="rounded-3xl"
              :ui="{ rounded: 'rounded-3xl', base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8 py-6 text-lg leading-relaxed font-medium' }"
            />
          </UFormGroup>

          <div class="grid gap-6 md:grid-cols-2">
            <UFormGroup :label="$t('pages.createEventPage.locationLabel')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UInput
                v-model="location"
                :placeholder="$t('pages.createEventPage.locationPlaceholder')"
                size="xl"
                icon="i-ph-map-pin-duotone"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-xl pl-14 pr-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold', icon: { leading: { wrapper: 'left-6', base: 'h-6 w-6 text-primary-500' } } }"
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.createEventPage.categoryLabel')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <USelect
                v-model="category"
                :options="eventCategories.slice(1).map(o => ({ label: o.label, value: o.value }))"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
              />
            </UFormGroup>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <UFormGroup :label="$t('pages.createEventPage.startDate')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UInput
                v-model="startDate"
                type="date"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.createEventPage.startTime')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UInput
                v-model="startTime"
                type="time"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
              />
            </UFormGroup>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <UFormGroup :label="$t('pages.createEventPage.endDate')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UInput
                v-model="endDate"
                type="date"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.createEventPage.endTime')" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UInput
                v-model="endTime"
                type="time"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
              />
            </UFormGroup>
          </div>

          <div class="space-y-6 pt-4">
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1">{{ $t("pages.createEventPage.coverImage") }}</p>
            <div class="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
              <label
                class="group/upload flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-secondary-200 bg-secondary-50/30 p-6 text-center transition-all hover:bg-primary-50 hover:border-primary-300 hover:scale-[1.02] active:scale-95"
                for="event-cover"
              >
                <input
                  id="event-cover"
                  class="sr-only"
                  type="file"
                  accept="image/*"
                  @change="onCoverChange"
                >
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-xl shadow-primary-500/10 mb-4 transition-transform group-hover/upload:scale-110 group-hover/upload:rotate-6">
                  <Icon name="i-ph-image-square-duotone" class="h-9 w-9" />
                </div>
                <p class="text-[13px] font-black text-secondary-900 uppercase tracking-widest">
                  {{ $t("pages.createEventPage.chooseCover") }}
                </p>
                <p class="mt-2 text-[11px] font-bold text-secondary-400 italic px-4">
                  {{ coverName || $t("pages.createEventPage.imageFormats") }}
                </p>
              </label>

              <button
                class="relative min-h-[180px] overflow-hidden rounded-[32px] border border-secondary-100 text-left shadow-2xl transition-all hover:scale-[1.02] group/cover"
                type="button"
                @click="cycleCover"
              >
                <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
                <img
                  v-if="coverPreviewUrl"
                  :src="coverPreviewUrl"
                  :alt="$t('pages.createEventPage.coverPreviewAlt')"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/20 to-transparent" />
                <div class="relative flex h-full flex-col justify-end p-8 text-white">
                  <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-300">
                    {{ $t("pages.createEventPage.previewLabel") }}
                  </p>
                  <p class="mt-3 text-2xl font-black leading-none tracking-tight">
                    {{ title || $t("pages.createEventPage.previewTitleFallback") }}
                  </p>
                  <div class="mt-4 flex items-center gap-2 text-[11px] font-bold text-white/60">
                    <Icon name="i-ph-arrows-clockwise-duotone" class="h-4 w-4" />
                    {{ $t("pages.createEventPage.cycleBackground") }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Final Actions Section -->
      <section class="surface-card p-10 bg-secondary-900 ring-1 ring-white/10 shadow-3xl rounded-[32px] overflow-hidden relative group/actions">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent pointer-events-none opacity-0 group-hover/actions:opacity-100 transition-opacity duration-1000" />
        
        <div class="relative z-10 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-2">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 pl-1">
              {{ $t("pages.createEventPage.finishHint") }}
            </p>
            <p class="text-sm font-medium leading-relaxed text-white/70 max-w-sm italic">
              {{ submitMessage || $t("pages.createEventPage.submitHint") }}
            </p>
          </div>

          <div class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center">
            <UButton
              variant="soft"
              size="xl"
              class="h-14 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 px-8 border-none"
              @click="saveDraft"
            >
              <template #leading>
                <Icon name="i-ph-floppy-disk-duotone" class="h-5 w-5" />
              </template>
              {{ $t("pages.createEventPage.saveDraft") }}
            </UButton>

            <UButton
              size="xl"
              class="h-14 min-w-[200px] rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/40 transition-all hover:bg-primary-700 active:scale-95 px-10 border-none"
              @click="publishEvent"
            >
              <template #leading>
                <Icon name="i-ph-rocket-launch-duotone" class="h-6 w-6" />
              </template>
              {{ $t("pages.createEventPage.publish") }}
            </UButton>
          </div>
        </div>
      </section>
    </div>

    <!-- Sidebar Preview/Checklist -->
    <aside class="space-y-8 xl:sticky xl:top-[120px]">
      <section class="surface-card overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-white group/preview">
        <div class="relative aspect-[16/10] overflow-hidden">
          <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
          <img
            v-if="coverPreviewUrl"
            :src="coverPreviewUrl"
            :alt="$t('pages.createEventPage.coverPreviewAlt')"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/preview:scale-110"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/20 to-transparent" />
          
          <div class="absolute left-6 top-6 rounded-2xl bg-white text-center shadow-2xl shadow-secondary-900/20 overflow-hidden ring-1 ring-secondary-100">
            <p class="bg-primary-600 px-4 py-1.5 text-[10px] font-black uppercase text-white tracking-widest">
              {{ previewMonth }}
            </p>
            <p class="px-4 py-3 text-3xl font-black leading-none text-secondary-900">
              {{ previewDay }}
            </p>
          </div>

          <div class="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-300">
              {{ currentCategoryLabel }}
            </p>
            <h2 class="text-xl font-black leading-tight tracking-tight">
              {{ title || $t("pages.createEventPage.eventTitleFallback") }}
            </h2>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-4 group/info">
              <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary-50 text-primary-600 ring-1 ring-secondary-100 group-hover/info:bg-primary-50 group-hover/info:ring-primary-100 transition-all">
                <Icon name="i-ph-calendar-check-duotone" class="h-5 w-5" />
              </div>
              <span class="text-[13px] font-bold text-secondary-700 tracking-tight transition-colors group-hover/info:text-primary-700">{{ dateSummary }}</span>
            </div>
            <div class="flex items-center gap-4 group/info">
              <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary-50 text-primary-600 ring-1 ring-secondary-100 group-hover/info:bg-primary-50 group-hover/info:ring-primary-100 transition-all">
                <Icon name="i-ph-map-pin-duotone" class="h-5 w-5" />
              </div>
              <span class="text-[13px] font-bold text-secondary-700 tracking-tight transition-colors group-hover/info:text-primary-700">{{ location || $t("pages.createEventPage.locationFallback") }}</span>
            </div>
          </div>
          
          <div class="bg-secondary-50/50 p-6 rounded-2xl ring-1 ring-secondary-100 italic transition-all group-hover/preview:bg-white group-hover/preview:shadow-md">
            <p class="text-[13px] leading-relaxed text-secondary-600 line-clamp-4">
              "{{ description || $t("pages.createEventPage.descriptionFallback") }}"
            </p>
          </div>
        </div>
      </section>

      <section class="surface-card p-8 sm:p-10 space-y-8 ring-1 ring-secondary-200/50 shadow-2xl bg-white">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.createEventPage.checklist") }}
        </p>
        <div class="space-y-4">
          <div
            v-for="item in checklist"
            :key="item.label"
            class="flex items-center gap-4 group/item"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-500"
              :class="item.done
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-secondary-50 text-secondary-300 ring-1 ring-secondary-100'"
            >
              <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-circle-duotone'" class="h-5 w-5" />
            </div>
            <span class="text-[11px] font-black uppercase tracking-widest text-secondary-500 transition-colors group-hover/item:text-secondary-900" :class="{ 'line-through text-secondary-300': item.done }">
              {{ item.label }}
            </span>
          </div>
        </div>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  quickFillSeed: number
}>()

const { t } = useI18n()
const { eventCategories } = useMockEventsData()

const title = ref("")
const description = ref("")
const location = ref("")
const category = ref("community")
const startDate = ref("2026-05-14")
const startTime = ref("09:00")
const endDate = ref("2026-05-14")
const endTime = ref("17:30")
const coverName = ref("")
const coverPreviewUrl = ref("")
const coverIndex = ref(0)
const submitMessage = ref("")

const coverFallbacks = [
  "linear-gradient(135deg,#0f766e 0%,#0000ff 58%,#f59e0b 120%)",
  "linear-gradient(135deg,#0ea5e9 0%,#16a34a 60%,#f59e0b 120%)",
  "linear-gradient(135deg,#111827 0%,#0000ff 58%,#10b981 120%)",
]

const activeCoverFallback = computed(() => coverFallbacks[coverIndex.value])

const currentCategoryLabel = computed(() =>
  eventCategories.find((option) => option.value === category.value)?.label || t("pages.eventsPage.categoryCommunity"),
)

const previewDate = computed(() => {
  const date = new Date(`${startDate.value}T${startTime.value}`)
  if (Number.isNaN(date.getTime())) return null
  return date
})

const previewMonth = computed(() => {
  if (!previewDate.value) return t("pages.createEventPage.fallbackMonth")
  return t("pages.createEventPage.monthShort", { month: previewDate.value.getMonth() + 1 })
})

const previewDay = computed(() => {
  if (!previewDate.value) return "--"
  return String(previewDate.value.getDate()).padStart(2, "0")
})

const dateSummary = computed(() => {
  if (!startDate.value || !startTime.value || !endDate.value || !endTime.value) {
    return t("pages.createEventPage.dateSummaryFallback")
  }

  return `${startDate.value} ${startTime.value} - ${endDate.value} ${endTime.value}`
})

const checklist = computed(() => [
  { label: t("pages.createEventPage.eventName"), done: title.value.trim().length >= 8 },
  { label: t("pages.createEventPage.descriptionLabel"), done: description.value.trim().length >= 24 },
  { label: t("pages.createEventPage.locationLabel"), done: location.value.trim().length >= 4 },
  { label: t("pages.createEventPage.startTime"), done: Boolean(startDate.value && startTime.value) },
  { label: t("pages.createEventPage.endTime"), done: Boolean(endDate.value && endTime.value) },
  { label: t("pages.createEventPage.coverImage"), done: Boolean(coverName.value || coverPreviewUrl.value || coverIndex.value >= 0) },
])

const completedItems = computed(() => checklist.value.filter((item) => item.done).length)
const completionText = computed(() => t("pages.createEventPage.completionText", {
  completed: completedItems.value,
  total: checklist.value.length,
}))

const cycleCover = () => {
  coverIndex.value = (coverIndex.value + 1) % coverFallbacks.length
}

const onCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }

  coverName.value = file.name
  coverPreviewUrl.value = URL.createObjectURL(file)
}

const quickFillDemo = () => {
  title.value = t("pages.createEventPage.demoTitle")
  description.value = t("pages.createEventPage.demoDescription")
  location.value = t("pages.createEventPage.demoLocation")
  category.value = "community"
  startDate.value = "2026-05-14"
  startTime.value = "09:00"
  endDate.value = "2026-05-14"
  endTime.value = "17:30"
  submitMessage.value = t("pages.createEventPage.demoFilled")
}

watch(() => props.quickFillSeed, () => {
  quickFillDemo()
})

const saveDraft = () => {
  submitMessage.value = t("pages.createEventPage.draftSaved")
}

const publishEvent = () => {
  submitMessage.value = t("pages.createEventPage.publishComplete")
}

onUnmounted(() => {
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }
})
</script>
