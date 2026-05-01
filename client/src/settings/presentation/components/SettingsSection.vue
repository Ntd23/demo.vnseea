<template>
  <section class="surface-card p-8 sm:p-10 space-y-10 ring-1 ring-secondary-100 shadow-xl overflow-hidden relative">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

    <!-- Header Section -->
    <div class="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-100 pb-8">
      <div class="space-y-3">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">{{ kindLabel }}</p>
        <h2 class="text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none">{{ section.title }}</h2>
        <p class="text-base font-medium text-[var(--text-primary)] max-w-xl leading-relaxed">{{ section.description }}</p>
      </div>
      
      <UButton
        v-if="section.kind === 'form' || section.kind === 'toggles'"
        size="xl"
        class="h-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98] px-10"
        @click="saved = true"
      >
        <template #leading>
          <Icon name="i-ph-floppy-disk-duotone" class="h-5 w-5" />
        </template>
        {{ t("pages.settingsPage.saveChanges") }}
      </UButton>
    </div>

    <!-- Fields Grid -->
    <div v-if="section.fields?.length" class="grid gap-8 md:grid-cols-2">
      <SettingsField
        v-for="field in section.fields"
        :key="field.key"
        :field="field"
        :class="field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''"
      />
    </div>

    <!-- Toggles Grid -->
    <div v-if="section.toggles?.length" class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="toggle in section.toggles"
        :key="toggle.label"
        class="flex items-center justify-between gap-6 rounded-2xl bg-secondary-50/30 p-6 border border-secondary-100/50 transition-all duration-300 hover:bg-white hover:ring-2 hover:ring-primary-500/20 group"
      >
        <div class="space-y-1.5">
          <p class="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] group-hover:text-secondary-900 transition-colors">{{ toggle.label }}</p>
          <p class="text-[11px] font-medium leading-relaxed text-[var(--text-primary)] max-w-[200px]">{{ toggle.description }}</p>
        </div>
        <USwitch
          :model-value="currentToggle(toggle.label, toggle.enabled)"
          size="lg"
          :ui="{
            active: 'bg-primary-600',
            inactive: 'bg-secondary-200'
          }"
          @update:model-value="toggleState[toggle.label] = $event"
        />
      </div>
    </div>

    <!-- List Items -->
    <div v-if="section.items?.length" class="space-y-4">
      <div v-for="item in section.items" :key="item.title" class="flex flex-col gap-6 rounded-2xl border border-secondary-100 bg-secondary-50/20 p-6 transition-all duration-300 hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-primary-500/10 sm:flex-row sm:items-center sm:justify-between group">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] group-hover:text-secondary-900 transition-colors">{{ item.title }}</h3>
            <UBadge 
              v-if="item.meta" 
              variant="soft" 
              class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5 bg-primary-100 text-[var(--text-primary)] ring-1 ring-primary-200"
            >
              {{ item.meta }}
            </UBadge>
          </div>
          <p class="text-xs font-medium text-[var(--text-primary)] leading-relaxed max-w-lg">{{ item.description }}</p>
        </div>
        <UButton
          v-if="item.action"
          size="md"
          variant="soft"
          class="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 bg-primary-50 text-[var(--text-primary)] ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
          @click="saved = true"
        >
          {{ item.action }}
        </UButton>
      </div>
    </div>

    <!-- Danger Zone -->
    <div v-if="section.kind === 'danger'" class="relative overflow-hidden rounded-3xl border border-rose-100 bg-rose-50/30 p-8 sm:p-10">
      <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-8 justify-between">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-lg shadow-rose-500/30">
              <Icon name="i-ph-warning-octagon-fill" class="h-5 w-5" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">{{ t("pages.settingsPage.kindDanger") }}</p>
          </div>
          <p class="text-sm font-black text-rose-900 sm:text-base">{{ t("pages.settingsPage.dangerTitle") || 'Extreme Actions' }}</p>
          <p class="text-xs font-semibold text-rose-500 leading-relaxed max-w-lg">{{ t("pages.settingsPage.dangerDescription") }}</p>
        </div>
        <UButton
          color="rose"
          size="xl"
          class="h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/30 transition-all active:scale-[0.98] px-10 ring-1 ring-rose-300"
          @click="saved = true"
        >
          <template #leading>
            <Icon name="i-ph-trash-duotone" class="h-5 w-5" />
          </template>
          {{ t("pages.settingsPage.deleteAccountAction") }}
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="saved"
      class="rounded-2xl border-none ring-1 ring-primary-100 bg-primary-50 text-primary-900 animate-in fade-in slide-in-from-bottom-4 duration-500"
      :ui="{
        title: 'text-[11px] font-black uppercase tracking-widest',
        icon: 'text-[var(--text-primary)]'
      }"
      icon="i-ph-check-circle-duotone"
      :title="t('pages.settingsPage.saveSuccess')"
    />
  </section>
</template>

<script setup lang="ts">
import type { SettingSection } from "../../application/composables/useSettingsData"
import SettingsField from "./SettingsField.vue"

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
