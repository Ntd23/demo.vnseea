<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">{{ kindLabel }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ section.title }}</h2>
        <p class="mt-1 max-w-2xl text-body-secondary">{{ section.description }}</p>
      </div>
      <button
        v-if="section.kind === 'form'"
        class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]"
        type="button"
        @click="saved = true"
      >
        {{ t("pages.settingsPage.saveChanges") }}
      </button>
    </div>

    <div v-if="section.fields?.length" class="mt-5 grid gap-4 md:grid-cols-2">
      <SettingsSettingsField
        v-for="field in section.fields"
        :key="field.key"
        :field="field"
        :class="field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''"
      />
    </div>

    <div v-if="section.toggles?.length" class="mt-5 grid gap-3 md:grid-cols-2">
      <button
        v-for="toggle in section.toggles"
        :key="toggle.label"
        class="flex items-center justify-between gap-4 rounded-[22px] bg-[var(--bg-surface-hover)] p-4 text-left"
        type="button"
        @click="toggleState[toggle.label] = !currentToggle(toggle.label, toggle.enabled)"
      >
        <span>
          <span class="block text-[14px] font-extrabold text-[var(--text-primary)]">{{ toggle.label }}</span>
          <span class="mt-1 block text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">{{ toggle.description }}</span>
        </span>
        <span
          class="relative h-7 w-12 shrink-0 rounded-full transition"
          :class="currentToggle(toggle.label, toggle.enabled) ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-secondary-200)]'"
        >
          <span
            class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)] transition"
            :class="currentToggle(toggle.label, toggle.enabled) ? 'left-6' : 'left-1'"
          />
        </span>
      </button>
    </div>

    <div v-if="section.items?.length" class="mt-5 space-y-3">
      <div v-for="item in section.items" :key="item.title" class="flex flex-col gap-3 rounded-[22px] bg-[var(--bg-surface-hover)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-[14px] font-extrabold text-[var(--text-primary)]">{{ item.title }}</h3>
            <span v-if="item.meta" class="rounded-[var(--radius-full)] bg-white px-2.5 py-1 text-[11px] font-black text-[var(--color-primary-600)]">{{ item.meta }}</span>
          </div>
          <p class="mt-1 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">{{ item.description }}</p>
        </div>
        <button
          v-if="item.action"
          class="inline-flex h-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-4 text-[12px] font-extrabold text-[var(--color-primary-600)]"
          type="button"
          @click="saved = true"
        >
          {{ item.action }}
        </button>
      </div>
    </div>

    <div v-if="section.kind === 'danger'" class="mt-5 rounded-[22px] border border-[var(--color-error)]/20 bg-[var(--color-error)]/5 p-4">
      <p class="text-[13px] font-bold leading-6 text-[var(--color-error)]">{{ t("pages.settingsPage.dangerDescription") }}</p>
      <button
        class="mt-4 inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-error)] px-5 text-[13px] font-extrabold text-white"
        type="button"
        @click="saved = true"
      >
        <Icon name="i-ph-trash-fill" class="h-4 w-4" />
        {{ t("pages.settingsPage.deleteAccountAction") }}
      </button>
    </div>

    <div v-if="saved" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
      {{ t("pages.settingsPage.saveSuccess") }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SettingSection } from "~/composables/useMockSettingsData"

const props = defineProps<{ section: SettingSection }>()
const { t } = useI18n()

const saved = ref(false)
const toggleState = reactive<Record<string, boolean>>({})

const currentToggle = (label: string, fallback: boolean) => toggleState[label] ?? fallback

const kindLabel = computed(() => {
  switch (props.section.kind) {
    case "form":
      return t("pages.settingsPage.kindForm")
    case "toggles":
      return t("pages.settingsPage.kindToggles")
    case "list":
      return t("pages.settingsPage.kindList")
    case "danger":
      return t("pages.settingsPage.kindDanger")
    case "summary":
      return t("pages.settingsPage.kindSummary")
    default:
      return props.section.kind
  }
})
</script>
