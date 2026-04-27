<template>
  <div class="flex flex-col gap-2">
    <UFormField
      :label="field.label"
      :help="field.description"
      class="w-full"
      :ui="{
        label: {
          base: 'text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] pl-1 mb-2'
        },
        help: 'text-[10px] font-medium text-[var(--text-primary)] pl-1 mt-1.5'
      }"
    >
      <!-- Textarea -->
      <UTextarea
        v-if="field.type === 'textarea'"
        v-model="value"
        :placeholder="field.placeholder"
        size="xl"
        :rows="4"
        :ui="{
          base: 'rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-[var(--text-primary)]',
        }"
      />

      <!-- Select Menu -->
      <USelectMenu
        v-else-if="field.type === 'select'"
        v-model="value"
        :options="field.options ?? []"
        size="xl"
        :ui="{
          trigger: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-black text-xs uppercase tracking-widest text-[var(--text-primary)]',
          icon: { base: 'text-[var(--text-primary)] h-5 w-5' }
        }"
      >
        <template #leading>
          <Icon name="i-ph-list-bullets-duotone" class="h-5 w-5 text-[var(--text-primary)]" />
        </template>
      </USelectMenu>

      <!-- Standard Input -->
      <UInput
        v-else
        v-model="value"
        :type="field.type"
        :placeholder="field.placeholder"
        size="xl"
        :ui="{
          base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-[var(--text-primary)]',
        }"
      >
        <template #leading>
          <Icon :name="field.key.includes('password') ? 'i-ph-lock-duotone' : (field.key.includes('email') ? 'i-ph-envelope-duotone' : 'i-ph-pencil-duotone')" class="h-5 w-5 text-[var(--icon-primary)]" />
        </template>
      </UInput>
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import type { SettingField } from "../../application/composables/useMockSettingsData"

const props = defineProps<{ field: SettingField }>()
const value = ref(props.field.value)

// Update internal value when the translated prop value changes
watch(() => props.field.value, (newVal) => {
  value.value = newVal
})
</script>
