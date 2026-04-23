<template>
  <CommunitySettingsSectionCard
    eyebrow="community.settings.controls.eyebrow"
    title="community.settings.controls.title"
    description="community.settings.controls.desc"
    icon="i-ph-shield-check-duotone"
  >
    <template #trailing>
      <UBadge
        variant="soft"
        class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100"
      >
        {{ $t(selectedPrivacyLabel) }}
      </UBadge>
    </template>

    <div class="space-y-8">
      <!-- Privacy Selection Grid -->
      <div class="grid gap-4 lg:grid-cols-3">
        <button
          v-for="option in communityPrivacyOptions"
          :key="option.value"
          class="relative flex flex-col items-start rounded-3xl border p-6 text-left transition-all duration-300 group"
          :class="model.privacy === option.value
            ? 'border-primary-200 bg-primary-50/50 ring-2 ring-primary-500 shadow-xl shadow-primary-500/10'
            : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-secondary-50/50 hover:shadow-lg'"
          type="button"
          @click="model.privacy = option.value as CommunityPrivacy"
        >
          <div 
            class="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110"
            :class="model.privacy === option.value ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-primary-600 ring-1 ring-secondary-100'"
          >
            <Icon :name="(option.icon || 'i-ph-circle-fill').replace('-bold', '-duotone')" class="h-6 w-6" />
          </div>
          
          <div class="mt-6 space-y-2">
            <p class="text-[12px] font-black uppercase tracking-widest" :class="model.privacy === option.value ? 'text-primary-600' : 'text-secondary-900'">
              {{ $t(option.label) }}
            </p>
            <p class="text-[11px] font-medium leading-relaxed" :class="model.privacy === option.value ? 'text-primary-600/70' : 'text-secondary-500'">
              {{ $t(option.description) }}
            </p>
          </div>

          <!-- Selection Indicator -->
          <div v-if="model.privacy === option.value" class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-xl ring-4 ring-white">
            <Icon name="i-ph-check-bold" class="h-3 w-3" />
          </div>
        </button>
      </div>

      <!-- Detail Box -->
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2 px-1">
          {{ $t('community.settings.controls.logic') }}
        </p>
        <p class="text-xs font-medium leading-relaxed text-secondary-600 px-1">
          {{ $t(selectedPrivacyDescription) }}
        </p>
      </div>

      <!-- Controls Toggles -->
      <div class="grid gap-6 lg:grid-cols-2">
        <div v-for="control in [
          { key: 'joinApproval', label: 'community.settings.controls.toggles.join.label', desc: 'community.settings.controls.toggles.join.desc' },
          { key: 'postApproval', label: 'community.settings.controls.toggles.post.label', desc: 'community.settings.controls.toggles.post.desc' },
          { key: 'allowMemberInvites', label: 'community.settings.controls.toggles.invite.label', desc: 'community.settings.controls.toggles.invite.desc' },
          { key: 'showMemberDirectory', label: 'community.settings.controls.toggles.directory.label', desc: 'community.settings.controls.toggles.directory.desc' },
          { key: 'welcomePostEnabled', label: 'community.settings.controls.toggles.welcome.label', desc: 'community.settings.controls.toggles.welcome.desc' }
        ]" :key="control.key" class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-secondary-50 shadow-sm hover:border-primary-100 transition-colors group">
          <div class="space-y-1">
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ $t(control.label) }}</p>
            <p class="text-[10px] font-medium text-secondary-500 leading-relaxed">{{ $t(control.desc) }}</p>
          </div>
          <UToggle
            v-model="model[control.key as keyof CommunityGroupSettingsDraft]"
            size="lg"
            :ui="{ 
              active: 'bg-primary-600',
              inactive: 'bg-secondary-200',
              container: { base: 'rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary-100' }
            }"
          />
        </div>
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
