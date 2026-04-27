<template>
  <section class="surface-card p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100">
    <div class="space-y-8">
      <div class="space-y-1">
        <h2 class="text-2xl font-black tracking-tight text-secondary-900">{{ section.title }}</h2>
        <p v-if="section.description" class="text-sm font-medium text-secondary-500">{{ section.description }}</p>
      </div>

      <div v-if="section.fields" class="grid gap-6 sm:grid-cols-2">
        <UFormGroup
          v-for="field in section.fields"
          :key="field.label"
          :label="field.label"
        >
          <UInput
            v-model="field.value"
            :type="field.type"
            size="xl"
            placeholder="..."
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'bg-secondary-50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
            }"
          />
        </UFormGroup>
      </div>

      <div v-if="section.toggles" class="space-y-4">
        <div
          v-for="toggle in section.toggles"
          :key="toggle.label"
          class="flex items-center justify-between rounded-2xl border border-secondary-100 p-5 transition-all hover:bg-secondary-50/50"
        >
          <div class="space-y-1">
            <p class="text-sm font-black text-secondary-900">{{ toggle.label }}</p>
            <p class="text-xs font-semibold text-secondary-400">{{ toggle.description }}</p>
          </div>
          <UToggle v-model="toggle.value" size="lg" />
        </div>
      </div>

      <div v-if="section.actions" class="flex flex-wrap gap-4 pt-4">
        <UButton
          v-for="action in section.actions"
          :key="action.label"
          :icon="action.icon"
          :color="action.color as any"
          size="lg"
          class="rounded-xl font-black px-6 shadow-lg shadow-primary-500/10"
        >
          {{ action.label }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SettingSection } from "../../domain/types/settings.types"

defineProps<{
  section: SettingSection
}>()
</script>
