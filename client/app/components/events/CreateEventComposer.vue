<template>
  <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
    <section class="space-y-5">
      <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              {{ $t("pages.createEventPage.editorEyebrow") }}
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              {{ $t("pages.createEventPage.infoTitle") }}
            </h2>
            <p class="mt-1 text-body-secondary">
              {{ $t("pages.createEventPage.infoDescription") }}
            </p>
          </div>

          <div class="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-3 py-2 text-[12px] font-bold text-[var(--color-primary-600)]">
            <Icon name="i-ph-seal-check-fill" class="h-4 w-4" />
            {{ completionText }}
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <p class="text-[12px] font-semibold text-[var(--text-secondary)]">
              {{ helperMessage }}
            </p>
          </div>

          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              {{ $t("pages.createEventPage.checklist") }}
            </p>
            <UProgress
              :model-value="completionPercent"
              color="primary"
              class="mt-3"
            />
          </div>
        </div>
      </UCard>

      <UForm
        :state="form"
        :validate="validateForm"
        class="space-y-5"
        @submit="publishEvent"
        @error="handleFormError"
      >
        <UAlert
          v-if="statusAlert"
          :color="statusAlert.color"
          variant="subtle"
          :icon="statusAlert.icon"
          :title="statusAlert.title"
          :description="statusAlert.description"
          class="rounded-[24px]"
          aria-live="polite"
        />

        <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField
              name="title"
              :label="$t('pages.createEventPage.eventName')"
              required
              size="xl"
              class="space-y-2 md:col-span-2"
            >
              <UInput
                v-model="form.title"
                :placeholder="$t('pages.createEventPage.eventNamePlaceholder')"
                color="primary"
                size="xl"
                :maxlength="120"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>

            <UFormField
              name="description"
              :label="$t('pages.createEventPage.descriptionLabel')"
              required
              size="xl"
              class="space-y-2 md:col-span-2"
            >
              <UTextarea
                v-model="form.description"
                :placeholder="$t('pages.createEventPage.descriptionPlaceholder')"
                color="primary"
                size="xl"
                autoresize
                :rows="7"
                :disabled="isBusy"
                class="w-full"
                :ui="textareaUi"
              />
            </UFormField>

            <UFormField
              name="location"
              :label="$t('pages.createEventPage.locationLabel')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.location"
                :placeholder="$t('pages.createEventPage.locationPlaceholder')"
                color="primary"
                size="xl"
                icon="i-ph-map-pin-bold"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>

            <UFormField
              name="category"
              :label="$t('pages.createEventPage.categoryLabel')"
              required
              size="xl"
              class="space-y-2"
            >
              <USelect
                v-model="form.category"
                :items="categoryItems"
                value-key="value"
                label-key="label"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="selectUi"
              />
            </UFormField>

            <UFormField
              name="startDate"
              :label="$t('pages.createEventPage.startDate')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.startDate"
                type="date"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>

            <UFormField
              name="startTime"
              :label="$t('pages.createEventPage.startTime')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.startTime"
                type="time"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>

            <UFormField
              name="endDate"
              :label="$t('pages.createEventPage.endDate')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.endDate"
                type="date"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>

            <UFormField
              name="endTime"
              :label="$t('pages.createEventPage.endTime')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.endTime"
                type="time"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="inputUi"
              />
            </UFormField>
          </div>
        </UCard>

        <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--color-primary-600)]">
                {{ $t("pages.createEventPage.coverImage") }}
              </p>
              <p class="mt-1 text-body-secondary">
                {{ $t("pages.createEventPage.imageFormats") }}
              </p>
            </div>

            <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
              {{ form.coverName || $t("pages.createEventPage.previewLabel") }}
            </UBadge>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <label
              class="group flex min-h-[170px] cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-hover)] p-4 text-center transition hover:bg-[var(--color-primary-50)]"
              for="event-cover"
            >
              <input
                id="event-cover"
                class="sr-only"
                type="file"
                accept="image/*"
                @change="onCoverChange"
              >

              <span>
                <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary-600)] shadow-[var(--shadow-sm)]">
                  <Icon name="i-ph-image-square-fill" class="h-8 w-8" />
                </span>
                <span class="mt-3 block text-[13px] font-bold text-[var(--text-primary)]">
                  {{ $t("pages.createEventPage.chooseCover") }}
                </span>
                <span class="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                  {{ form.coverName || $t("pages.createEventPage.imageFormats") }}
                </span>
              </span>
            </label>

            <button
              class="relative min-h-[170px] overflow-hidden rounded-[22px] border border-[var(--border-default)] text-left shadow-[var(--shadow-sm)]"
              type="button"
              :disabled="isBusy"
              @click="cycleCover"
            >
              <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
              <img
                v-if="coverPreviewUrl"
                :src="coverPreviewUrl"
                :alt="$t('pages.createEventPage.coverPreviewAlt')"
                class="absolute inset-0 h-full w-full object-cover"
              >
              <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.58)_100%)]" />
              <div class="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-white">
                <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
                  {{ $t("pages.createEventPage.previewLabel") }}
                </p>
                <p class="mt-2 text-[1.1rem] font-black leading-tight">
                  {{ form.title || $t("pages.createEventPage.previewTitleFallback") }}
                </p>
                <p class="mt-2 text-[12px] text-white/78">
                  {{ $t("pages.createEventPage.cycleBackground") }}
                </p>
              </div>
            </button>
          </div>
        </UCard>

        <div class="flex flex-col gap-3 rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
          <p class="text-body-secondary">
            {{ helperMessage }}
          </p>

          <div class="flex flex-wrap gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-full"
              :disabled="isBusy"
              @click="saveDraft"
            >
              {{ $t("pages.createEventPage.saveDraft") }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="lg"
              class="rounded-full"
              :loading="isBusy"
              :disabled="isBusy"
            >
              {{ $t("pages.createEventPage.publish") }}
            </UButton>
          </div>
        </div>
      </UForm>
    </section>

    <aside class="space-y-4">
      <UCard class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-0' }">
        <div class="relative aspect-[16/10] overflow-hidden">
          <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
          <img
            v-if="coverPreviewUrl"
            :src="coverPreviewUrl"
            :alt="$t('pages.createEventPage.coverPreviewAlt')"
            class="absolute inset-0 h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_18%,rgba(15,23,42,0.72)_100%)]" />
          <div class="absolute left-4 top-4 rounded-[16px] bg-white text-center shadow-[var(--shadow-md)]">
            <p class="rounded-t-[16px] bg-[var(--color-primary-500)] px-3 py-1 text-[11px] font-black uppercase text-white">
              {{ previewMonth }}
            </p>
            <p class="px-3 py-2 text-[1.35rem] font-black leading-none text-[var(--text-primary)]">
              {{ previewDay }}
            </p>
          </div>
          <div class="absolute bottom-4 left-4 right-4 text-white">
            <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
              {{ currentCategoryLabel }}
            </p>
            <h2 class="mt-2 text-[1.25rem] font-black leading-tight">
              {{ form.title || $t("pages.createEventPage.eventTitleFallback") }}
            </h2>
          </div>
        </div>

        <div class="p-4">
          <div class="space-y-3 text-[13px] font-semibold text-[var(--text-secondary)]">
            <div class="flex items-center gap-2">
              <Icon name="i-ph-calendar-check-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>{{ dateSummary }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>{{ form.location || $t("pages.createEventPage.locationFallback") }}</span>
            </div>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
            {{ form.description || $t("pages.createEventPage.descriptionFallback") }}
          </p>
        </div>
      </UCard>

      <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
        <div class="flex items-center justify-between gap-3">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ $t("pages.createEventPage.checklist") }}
          </p>
          <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
            {{ completionText }}
          </UBadge>
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="item in checklist"
            :key="item.label"
            class="flex items-center gap-3 rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full"
              :class="item.done
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--color-secondary-100)] text-[var(--text-tertiary)]'"
            >
              <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-circle'" class="h-4 w-4" />
            </span>
            <span class="text-[13px] font-semibold text-[var(--text-secondary)]">
              {{ item.label }}
            </span>
          </div>
        </div>
      </UCard>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import type { EventCategoryKey } from "~/composables/useMockEventsData"

type CreateEventForm = {
  title: string
  description: string
  location: string
  category: Exclude<EventCategoryKey, "all">
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  coverName: string
  coverIndex: number
}

type CreateEventFormError = {
  name?: keyof CreateEventForm
  message: string
}

type CreateEventStatus = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  quickFillSeed: number
}>()

const { t } = useI18n()
const toast = useToast()
const { eventCategories } = useMockEventsData()

const form = reactive<CreateEventForm>(defaultForm())
const coverPreviewUrl = ref("")
const formStatus = ref<CreateEventStatus>("idle")
const statusMessage = ref("")
const draftRestored = ref(false)
const draftStorage = useStorage<CreateEventForm | null>(
  "events:create-draft",
  null,
  undefined,
  { initOnMounted: true },
)

const coverFallbacks = [
  "linear-gradient(135deg,#0369a1 0%,#0000ff 58%,#f59e0b 120%)",
  "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#f59e0b 120%)",
  "linear-gradient(135deg,#111827 0%,#0000ff 58%,#0ea5e9 120%)",
]

const inputUi = {
  base: "h-[3.6rem] rounded-[1.25rem] px-4 text-[1rem]",
}

const textareaUi = {
  base: "rounded-[1.25rem] px-4 py-3 text-[1rem]",
}

const selectUi = {
  base: "h-[3.6rem] rounded-[1.25rem] px-4 text-[1rem]",
}

const isBusy = computed(() => formStatus.value === "loading")

const activeCoverFallback = computed(() => coverFallbacks[form.coverIndex])

const categoryItems = computed(() =>
  eventCategories.filter(category => category.value !== "all"),
)

const currentCategoryLabel = computed(() =>
  eventCategories.find(option => option.value === form.category)?.label
  || t("pages.eventsPage.categoryCommunity"),
)

const previewDate = computed(() => {
  const date = new Date(`${form.startDate}T${form.startTime}`)
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
  if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
    return t("pages.createEventPage.dateSummaryFallback")
  }

  return `${form.startDate} ${form.startTime} - ${form.endDate} ${form.endTime}`
})

const checklist = computed(() => [
  { label: t("pages.createEventPage.eventName"), done: form.title.trim().length >= 8 },
  { label: t("pages.createEventPage.descriptionLabel"), done: form.description.trim().length >= 24 },
  { label: t("pages.createEventPage.locationLabel"), done: form.location.trim().length >= 4 },
  { label: t("pages.createEventPage.startTime"), done: Boolean(form.startDate && form.startTime) },
  { label: t("pages.createEventPage.endTime"), done: Boolean(form.endDate && form.endTime) },
  { label: t("pages.createEventPage.coverImage"), done: Boolean(form.coverName || coverPreviewUrl.value) },
])

const completedItems = computed(() => checklist.value.filter(item => item.done).length)
const completionPercent = computed(() =>
  Math.round((completedItems.value / checklist.value.length) * 100),
)
const completionText = computed(() => t("pages.createEventPage.completionText", {
  completed: completedItems.value,
  total: checklist.value.length,
}))

const helperMessage = computed(() => {
  if (formStatus.value === "loading") return t("pages.createEventPage.statusLoadingDescription")
  if (formStatus.value === "success" && statusMessage.value) return statusMessage.value
  if (formStatus.value === "error" && statusMessage.value) return statusMessage.value
  return t("pages.createEventPage.submitHint")
})

const statusAlert = computed(() => {
  if (formStatus.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("pages.createEventPage.statusLoadingTitle"),
      description: t("pages.createEventPage.statusLoadingDescription"),
    }
  }

  if (formStatus.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("pages.createEventPage.statusSuccessTitle"),
      description: statusMessage.value || t("pages.createEventPage.statusSuccessDescription"),
    }
  }

  if (formStatus.value === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("pages.createEventPage.statusErrorTitle"),
      description: statusMessage.value || t("pages.createEventPage.statusErrorDescription"),
    }
  }

  if (draftRestored.value) {
    return {
      color: "neutral" as const,
      icon: "i-ph-clock-counter-clockwise-fill",
      title: t("pages.createEventPage.draftRestoredTitle"),
      description: t("pages.createEventPage.draftRestoredDescription"),
    }
  }

  return null
})

watch(() => props.quickFillSeed, () => {
  quickFillDemo()
})

onMounted(() => {
  if (!draftStorage.value) return

  applyDraft(draftStorage.value)
  draftRestored.value = true
})

watchDebounced(
  () => serializeForm(),
  (draft) => {
    draftStorage.value = draft
  },
  { debounce: 300, maxWait: 900 },
)

function defaultForm(): CreateEventForm {
  return {
    title: "",
    description: "",
    location: "",
    category: "community",
    startDate: "2026-05-14",
    startTime: "09:00",
    endDate: "2026-05-14",
    endTime: "17:30",
    coverName: "",
    coverIndex: 0,
  }
}

function serializeForm(): CreateEventForm {
  return {
    title: form.title,
    description: form.description,
    location: form.location,
    category: form.category,
    startDate: form.startDate,
    startTime: form.startTime,
    endDate: form.endDate,
    endTime: form.endTime,
    coverName: form.coverName,
    coverIndex: form.coverIndex,
  }
}

function applyDraft(draft: CreateEventForm) {
  form.title = draft.title
  form.description = draft.description
  form.location = draft.location
  form.category = draft.category
  form.startDate = draft.startDate
  form.startTime = draft.startTime
  form.endDate = draft.endDate
  form.endTime = draft.endTime
  form.coverName = draft.coverName
  form.coverIndex = draft.coverIndex
}

function validateForm(state: CreateEventForm): CreateEventFormError[] {
  const errors: CreateEventFormError[] = []

  if (state.title.trim().length < 8) {
    errors.push({ name: "title", message: t("pages.createEventPage.validationTitleRequired") })
  }

  if (state.description.trim().length < 24) {
    errors.push({ name: "description", message: t("pages.createEventPage.validationDescriptionRequired") })
  }

  if (state.location.trim().length < 4) {
    errors.push({ name: "location", message: t("pages.createEventPage.validationLocationRequired") })
  }

  if (!state.category) {
    errors.push({ name: "category", message: t("pages.createEventPage.validationCategoryRequired") })
  }

  if (!state.startDate || !state.startTime) {
    errors.push({ name: "startDate", message: t("pages.createEventPage.validationStartRequired") })
  }

  if (!state.endDate || !state.endTime) {
    errors.push({ name: "endDate", message: t("pages.createEventPage.validationEndRequired") })
  }

  if (state.startDate && state.startTime && state.endDate && state.endTime) {
    const start = new Date(`${state.startDate}T${state.startTime}`)
    const end = new Date(`${state.endDate}T${state.endTime}`)

    if (end.getTime() < start.getTime()) {
      errors.push({ name: "endDate", message: t("pages.createEventPage.validationDateOrder") })
    }
  }

  return errors
}

function setStatus(nextStatus: CreateEventStatus, message = "") {
  formStatus.value = nextStatus
  statusMessage.value = message
}

function cycleCover() {
  form.coverIndex = (form.coverIndex + 1) % coverFallbacks.length
}

function onCoverChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }

  form.coverName = file.name
  coverPreviewUrl.value = URL.createObjectURL(file)
  draftRestored.value = false
}

function quickFillDemo() {
  form.title = t("pages.createEventPage.demoTitle")
  form.description = t("pages.createEventPage.demoDescription")
  form.location = t("pages.createEventPage.demoLocation")
  form.category = "community"
  form.startDate = "2026-05-14"
  form.startTime = "09:00"
  form.endDate = "2026-05-14"
  form.endTime = "17:30"
  draftRestored.value = false
  setStatus("success", t("pages.createEventPage.demoFilled"))
}

function saveDraft() {
  draftStorage.value = serializeForm()
  draftRestored.value = false
  setStatus("success", t("pages.createEventPage.draftSaved"))
  toast.add({
    color: "success",
    icon: "i-ph-floppy-disk-back-fill",
    title: t("pages.createEventPage.statusSuccessTitle"),
    description: t("pages.createEventPage.draftSaved"),
  })
}

async function publishEvent() {
  const errors = validateForm(serializeForm())

  if (errors.length > 0) {
    setStatus("error", errors[0].message)
    return
  }

  draftRestored.value = false
  setStatus("loading")

  await new Promise(resolve => setTimeout(resolve, 700))

  draftStorage.value = null
  setStatus("success", t("pages.createEventPage.publishComplete"))

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("pages.createEventPage.statusSuccessTitle"),
    description: t("pages.createEventPage.publishComplete"),
  })
}

function handleFormError() {
  const firstError = validateForm(serializeForm())[0]
  setStatus("error", firstError?.message || t("pages.createEventPage.statusErrorDescription"))
}

onUnmounted(() => {
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }
})
</script>
