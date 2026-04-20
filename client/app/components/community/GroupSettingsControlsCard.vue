<template>
  <CommunitySettingsSectionCard
    eyebrow="community.settings.controls.eyebrow"
    title="community.settings.controls.title"
    description="community.settings.controls.desc"
    icon="i-ph-shield-check-bold"
  >
    <template #trailing>
      <div class="inline-flex items-center rounded-full bg-[#f8fbff] px-4 py-2 text-[12px] font-semibold text-[#243b63]">
        {{ $t(selectedPrivacyLabel) }}
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-3 lg:grid-cols-3">
        <button
          v-for="option in communityPrivacyOptions"
          :key="option.value"
          class="rounded-[22px] border px-4 py-4 text-left transition"
          :class="model.privacy === option.value
            ? 'border-[#0000ff]/22 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
            : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
          type="button"
          @click="model.privacy = option.value as CommunityPrivacy"
        >
          <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
            <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-5 w-5" />
          </div>
          <p class="mt-4 text-[14px] font-black text-[#243b63]">
            {{ $t(option.label) }}
          </p>
          <p class="mt-2 text-[12px] leading-5 text-slate-500">
            {{ $t(option.description) }}
          </p>
        </button>
      </div>

      <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4">
        <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/65">
          {{ $t('community.settings.controls.logic') }}
        </p>
        <p class="mt-2 text-[14px] leading-6 text-slate-500">
          {{ $t(selectedPrivacyDescription) }}
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <FormsToggleSwitch
          v-model="model.joinApproval"
          :label="$t('community.settings.controls.toggles.join.label')"
          :description="$t('community.settings.controls.toggles.join.desc')"
        />
        <FormsToggleSwitch
          v-model="model.postApproval"
          :label="$t('community.settings.controls.toggles.post.label')"
          :description="$t('community.settings.controls.toggles.post.desc')"
        />
        <FormsToggleSwitch
          v-model="model.allowMemberInvites"
          :label="$t('community.settings.controls.toggles.invite.label')"
          :description="$t('community.settings.controls.toggles.invite.desc')"
        />
        <FormsToggleSwitch
          v-model="model.showMemberDirectory"
          :label="$t('community.settings.controls.toggles.directory.label')"
          :description="$t('community.settings.controls.toggles.directory.desc')"
        />
        <FormsToggleSwitch
          v-model="model.welcomePostEnabled"
          :label="$t('community.settings.controls.toggles.welcome.label')"
          :description="$t('community.settings.controls.toggles.welcome.desc')"
        />
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import {
  communityPrivacyOptions,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../../types/community"
import type {
  CommunityGroupSettingsDraft,
  CommunityPrivacy,
} from "../../../types/community"

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })

const selectedPrivacyLabel = computed(() =>
  getCommunityOptionLabel(communityPrivacyOptions, model.value.privacy, "community.settings.controls.privacyFallback"),
)

const selectedPrivacyDescription = computed(() =>
  getCommunityOptionDescription(communityPrivacyOptions, model.value.privacy, "community.settings.controls.noPrivacy"),
)
</script>
