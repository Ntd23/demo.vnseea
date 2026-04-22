<template>
  <section class="surface-card p-6 sm:p-8">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-100 pb-6 mb-8">
      <div class="space-y-1">
        <p class="text-micro font-bold uppercase tracking-[0.2em] text-primary-600">{{ kindLabel }}</p>
        <h2 class="text-2xl font-black text-secondary-900 leading-tight">{{ section.title }}</h2>
        <p class="text-body-secondary text-sm max-w-xl">{{ section.description }}</p>
      </div>
      <UButton
        v-if="section.kind === 'form'"
        color="primary"
        size="lg"
        class="rounded-full font-black px-8 shadow-lg shadow-primary-500/20"
        @click="saved = true"
      >
        {{ t("pages.settingsPage.saveChanges") }}
      </UButton>
    </div>

    <!-- Fields Grid -->
    <div v-if="section.fields?.length" class="grid gap-6 md:grid-cols-2">
      <SettingsField
        v-for="field in section.fields"
        :key="field.key"
        :field="field"
        :class="field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''"
      />
    </div>

    <!-- Toggles Grid -->
    <div v-if="section.toggles?.length" class="grid gap-4 md:grid-cols-2">
      <div
        v-for="toggle in section.toggles"
        :key="toggle.label"
        class="flex items-center justify-between gap-6 rounded-2xl bg-secondary-50/50 p-5 border border-secondary-100/30 transition hover:bg-secondary-50"
      >
        <div class="space-y-1">
          <p class="text-sm font-black text-secondary-900">{{ toggle.label }}</p>
          <p class="text-xs font-semibold leading-relaxed text-secondary-400">{{ toggle.description }}</p>
        </div>
        <USwitch
          :model-value="currentToggle(toggle.label, toggle.enabled)"
          color="primary"
          @update:model-value="toggleState[toggle.label] = $event"
        />
      </div>
    </div>

    <!-- List Items -->
    <div v-if="section.items?.length" class="space-y-4">
      <div v-for="item in section.items" :key="item.title" class="flex flex-col gap-4 rounded-2xl border border-secondary-100 bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm font-black text-secondary-900">{{ item.title }}</h3>
            <UBadge v-if="item.meta" :label="item.meta" size="xs" variant="soft" color="primary" class="rounded-full font-bold px-2" />
          </div>
          <p class="text-xs font-semibold text-secondary-500 leading-relaxed">{{ item.description }}</p>
        </div>
        <UButton
          v-if="item.action"
          color="primary"
          variant="soft"
          size="sm"
          class="rounded-full font-bold px-4"
          @click="saved = true"
        >
          {{ item.action }}
        </UButton>
      </div>
    </div>

    <!-- Danger Zone -->
    <div v-if="section.kind === 'danger'" class="mt-8 rounded-2xl border border-red-100 bg-red-50/50 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-6">
        <div class="flex-1 space-y-1">
          <p class="text-xs font-black text-red-600 uppercase tracking-widest">{{ t("pages.settingsPage.kindDanger") }}</p>
          <p class="text-sm font-semibold text-red-700 leading-relaxed">{{ t("pages.settingsPage.dangerDescription") }}</p>
        </div>
        <UButton
          color="red"
          size="lg"
          class="rounded-full font-black px-6 shadow-lg shadow-red-500/20"
          icon="i-ph-trash-fill"
          @click="saved = true"
        >
          {{ t("pages.settingsPage.deleteAccountAction") }}
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="saved"
      class="mt-8 rounded-xl"
      color="primary"
      variant="soft"
      icon="i-ph-check-circle-fill"
      :title="t('pages.settingsPage.saveSuccess')"
    />
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
