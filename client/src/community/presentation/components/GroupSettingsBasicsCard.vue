<!-- Description: Renders the general group settings form fields without media upload controls. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    :title="$t('community.groupSettings.basics.title')"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <template #trailing>
      <slot name="trailing" />
    </template>

    <div class="group-settings-basic">
      <div class="group-settings-basic__grid">
        <UFormField name="name" :label="$t('community.groupSettings.basics.nameLabel')" required>
          <UInput
            v-model="model.name"
            :placeholder="$t('community.groupSettings.basics.namePlaceholder')"
            size="xl"
            class="w-full"
          />
        </UFormField>

        <UFormField name="category" :label="$t('community.groupSettings.basics.categoryLabel')" required>
          <USelect
            v-model="model.category"
            :items="categoryItems"
            value-key="value"
            label-key="label"
            :loading="categoryLoading"
            :disabled="categoryLoading || categoryItems.length === 0"
            size="xl"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField name="slug" :label="$t('community.groupSettings.basics.slugLabel')" required>
        <div class="group-settings-basic__slug">
          <span class="group-settings-basic__slug-prefix">{{ urlPrefix }}</span>
          <input
            v-model="model.slug"
            type="text"
            placeholder="duong-dan-nhom"
            class="group-settings-basic__slug-input"
          >
        </div>

        <div class="group-settings-basic__hint">
          <span>{{ $t('community.groupSettings.basics.slugHint', { slug: suggestedSlug || "ten-nhom" }) }}</span>
          <button
            v-if="suggestedSlug && (model.slug || '').trim() !== suggestedSlug"
            type="button"
            class="group-settings-basic__hint-action"
            @click="model.slug = suggestedSlug"
          >
            {{ $t("community.groupSettings.basics.useSuggestion") }}
          </button>
        </div>
      </UFormField>

      <UFormField name="summary" :label="$t('community.groupSettings.basics.summaryLabel')" required>
        <textarea
          v-model="model.summary"
          rows="6"
          class="group-settings-basic__textarea"
          :placeholder="$t('community.groupSettings.basics.summaryPlaceholder')"
        />
      </UFormField>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import { createCommunitySlug } from "../../domain/services/community-helpers.service"
import { useBackendWebBase } from "#shared-kernel/application/utils/backend-web-url"
import type { CommunityGroupSettingsDraft, CommunityOption } from "../../domain/types/community.types"

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })
const props = withDefaults(defineProps<{
  categoryOptions?: CommunityOption[]
  categoryLoading?: boolean
}>(), {
  categoryOptions: () => [],
  categoryLoading: false,
})

const backendWebBase = useBackendWebBase()
const urlPrefix = computed(() => `${backendWebBase.replace(/\/+$/, "")}/g/`)
const categoryItems = computed(() =>
  props.categoryOptions.map(option => ({
    value: option.value,
    label: option.label,
  })),
)

const suggestedSlug = computed(() =>
  createCommunitySlug(model.value.name),
)
</script>

<style scoped>
.group-settings-basic {
  display: grid;
  gap: 26px;
}

.group-settings-basic__grid {
  display: grid;
  gap: 26px;
}

.group-settings-basic__slug {
  display: flex;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.group-settings-basic__slug:focus-within {
  border-color: var(--bg-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.group-settings-basic__slug-prefix {
  display: inline-flex;
  min-height: 48px;
  max-width: 55%;
  flex: 0 1 auto;
  overflow: hidden;
  align-items: center;
  justify-content: flex-start;
  border-right: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-settings-basic__slug-input {
  min-width: 0;
  min-height: 48px;
  flex: 1 1 auto;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  padding: 0 14px;
  font-size: 15px;
  outline: none;
}

.group-settings-basic__slug-input::placeholder {
  color: var(--text-tertiary);
}

.group-settings-basic__hint {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.group-settings-basic__hint-action {
  color: var(--bg-brand);
  font-weight: 900;
}

.group-settings-basic__textarea {
  min-height: 130px;
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.65;
  outline: none;
  padding: 14px 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.group-settings-basic__textarea:focus {
  border-color: var(--bg-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

@media (min-width: 768px) {
  .group-settings-basic__grid {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.7fr);
  }
}
</style>
