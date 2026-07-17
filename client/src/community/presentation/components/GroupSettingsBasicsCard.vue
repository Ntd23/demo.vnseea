<!-- Description: Renders the general group settings form fields without media upload controls. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    title="Cài đặt chung"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <template #trailing>
      <slot name="trailing" />
    </template>

    <div class="group-settings-basic">
      <div class="group-settings-basic__grid">
        <UFormField name="name" label="Tên nhóm" required>
          <UInput
            v-model="model.name"
            placeholder="Nhập tên nhóm"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>

        <UFormField name="category" label="Loại" required>
          <USelect
            v-model="model.category"
            :items="categoryItems"
            size="xl"
            class="w-full"
            :ui="selectUi"
          />
        </UFormField>
      </div>

      <UFormField name="slug" label="Đường dẫn nhóm" required>
        <div class="group-settings-basic__slug">
          <span class="group-settings-basic__slug-prefix">{{ urlPrefix }}</span>
          <UInput
            v-model="model.slug"
            placeholder="duong-dan-nhom"
            size="xl"
            class="w-full"
            :ui="slugInputUi"
          />
        </div>

        <div class="group-settings-basic__hint">
          <span>Gợi ý: {{ suggestedSlug || "ten-nhom" }}</span>
          <button
            v-if="suggestedSlug && (model.slug || '').trim() !== suggestedSlug"
            type="button"
            class="group-settings-basic__hint-action"
            @click="model.slug = suggestedSlug"
          >
            Dùng gợi ý
          </button>
        </div>
      </UFormField>

      <UFormField name="summary" label="Sự mô tả" required>
        <textarea
          v-model="model.summary"
          rows="6"
          class="group-settings-basic__textarea"
          placeholder="Nhập mô tả nhóm"
        />
      </UFormField>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import { communityCategoryOptions } from "../../domain/constants/community-options"
import { createCommunitySlug } from "../../domain/services/community-helpers.service"
import type { CommunityGroupSettingsDraft } from "../../domain/types/community.types"

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })
const { t } = useI18n()

const inputUi = {
  base: "h-14 rounded-[10px] px-4 text-[15px]",
}

const slugInputUi = {
  base: "h-14 rounded-[10px] pl-[9.25rem] pr-4 text-[15px]",
}

const selectUi = {
  base: "h-14 rounded-[10px] px-4 text-[15px]",
}

const urlPrefix = "https://vnseea.vn/"

const categoryItems = computed(() =>
  communityCategoryOptions.map(option => ({
    value: option.value,
    label: t(option.label),
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
  position: relative;
}

.group-settings-basic__slug-prefix {
  position: absolute;
  bottom: 1px;
  left: 1px;
  top: 1px;
  z-index: 1;
  display: inline-flex;
  min-width: 132px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e2e8f0;
  border-radius: 10px 0 0 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.group-settings-basic__hint {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.group-settings-basic__hint-action {
  color: #0000ff;
  font-weight: 900;
}

.group-settings-basic__textarea {
  min-height: 130px;
  width: 100%;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #000000;
  font-size: 15px;
  line-height: 1.65;
  outline: none;
  padding: 14px 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.group-settings-basic__textarea:focus {
  border-color: #0000ff;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.08);
}

@media (min-width: 768px) {
  .group-settings-basic__grid {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.7fr);
  }
}
</style>
