<!-- Description: Renders group privacy and join approval controls in the legacy two-row settings layout. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    title="Cài đặt cá nhân"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <template #trailing>
      <slot name="trailing" />
    </template>

    <div class="group-settings-controls">
      <div class="group-settings-controls__row">
        <label for="group-privacy">Loại nhóm</label>
        <USelect
          id="group-privacy"
          v-model="model.privacy"
          :items="privacyItems"
          size="xl"
          class="w-full"
          :ui="selectUi"
        />
      </div>

      <div class="group-settings-controls__row">
        <label for="group-join-approval">Xác nhận yêu cầu khi ai đó tham gia nhóm này?</label>
        <USelect
          id="group-join-approval"
          v-model="joinApprovalValue"
          :items="joinApprovalItems"
          size="xl"
          class="w-full"
          :ui="selectUi"
        />
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import type {
  CommunityGroupSettingsDraft,
  CommunityPrivacy,
} from "../../domain/types/community.types"

type GroupSettingsPrivacy = Exclude<CommunityPrivacy, "secret">

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })

const selectUi = {
  base: "h-14 rounded-[10px] px-4 text-[15px]",
}

const privacyItems: Array<{ value: GroupSettingsPrivacy; label: string }> = [
  { value: "public", label: "Công cộng" },
  { value: "private", label: "Riêng tư" },
]

const joinApprovalItems = [
  { value: "no", label: "Không" },
  { value: "yes", label: "Có" },
]

const joinApprovalValue = computed({
  get: () => model.value.joinApproval ? "yes" : "no",
  set: (value: string) => {
    model.value.joinApproval = value === "yes"
  },
})

watch(
  () => model.value.privacy,
  (value) => {
    if (value === "secret") {
      model.value.privacy = "private"
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.group-settings-controls {
  display: grid;
  gap: 26px;
}

.group-settings-controls__row {
  display: grid;
  gap: 12px;
}

.group-settings-controls__row label {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
}

@media (min-width: 768px) {
  .group-settings-controls__row {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr);
    align-items: center;
  }
}
</style>
