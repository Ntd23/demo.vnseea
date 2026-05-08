<!-- Description: Renders the group settings route with a settings-nav-first layout and ordered panes that mirror the legacy PHP group settings structure. -->
<template>
  <div v-if="group && previewGroup" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)] sm:px-6">
      <div class="space-y-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {{ $t('community.settings.eyebrow') }}
        </p>
        <h1 class="text-[1.7rem] font-black tracking-[-0.04em] text-[#243b63] sm:text-[2rem]">
          {{ $t('community.settings.title', { name: translatedGroupName }) }}
        </h1>
        <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
          {{ $t('community.settings.desc') }}
        </p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ memberCountLabel }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ selectedPrivacyLabel }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ selectedCategoryLabel }}
        </span>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside class="xl:sticky xl:top-[84px] xl:self-start">
        <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {{ $t('community.settings.eyebrow') }}
          </p>
          <nav class="mt-4 space-y-2">
            <a
              v-for="item in settingsNavItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="flex items-center justify-between rounded-[16px] border border-[#e7ecf6] bg-[#fbfcff] px-4 py-3 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d4f5] hover:bg-white"
            >
              <span>{{ item.label }}</span>
              <Icon name="i-ph-caret-right-bold" class="h-3.5 w-3.5 text-slate-400" />
            </a>
          </nav>
        </section>
      </aside>

      <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
        <UForm
          :state="draft"
          :validate="validateDraft"
          class="min-w-0 space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section id="basics" class="scroll-mt-24">
            <CommunityGroupSettingsBasicsCard
              v-model="draft"
              :group-path="groupPath"
            />
          </section>

          <section id="controls" class="scroll-mt-24">
            <CommunityGroupSettingsControlsCard v-model="draft" />
          </section>

          <section id="finish" class="scroll-mt-24">
            <CommunitySettingsSectionCard
              eyebrow="community.settings.finish.eyebrow"
              title="community.settings.finish.title"
              description="community.settings.finish.desc"
              icon="i-ph-floppy-disk-back-bold"
            >
              <div class="flex flex-col gap-4">
                <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
                  {{ $t('community.settings.finish.status', { enabled: enabledPolicies, total: totalPolicies, privacy: selectedPrivacyLabel.toLowerCase() }) }}
                </div>

                <UAlert
                  v-if="statusAlert"
                  :color="statusAlert.color"
                  variant="subtle"
                  :icon="statusAlert.icon"
                  :title="statusAlert.title"
                  :description="statusAlert.description"
                  class="rounded-[20px]"
                  aria-live="polite"
                />

                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <UButton
                    :to="groupPath"
                    color="neutral"
                    variant="outline"
                    size="xl"
                    :disabled="isBusy"
                    class="justify-center rounded-full"
                  >
                    <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                    {{ $t("community.settings.finish.back") }}
                  </UButton>

                  <UButton
                    type="submit"
                    color="primary"
                    variant="solid"
                    size="xl"
                    :loading="isBusy"
                    :disabled="isSaveDisabled"
                    class="justify-center rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
                  >
                    <Icon name="i-ph-floppy-disk-bold" class="mr-2 h-4 w-4" />
                    {{ $t("community.settings.finish.save") }}
                  </UButton>
                </div>
              </div>
            </CommunitySettingsSectionCard>
          </section>
        </UForm>

        <CommunityGroupSettingsSidebar
          :group="previewGroup"
          :members="visibleMembers"
          :member-count-label="memberCountLabel"
          :privacy-label="selectedPrivacyLabel"
          :privacy-description="selectedPrivacyDescription"
          :category-label="selectedCategoryLabel"
          :enabled-policies="enabledPolicies"
          :total-policies="totalPolicies"
          :show-member-directory="draft.showMemberDirectory"
        />
      </div>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-gear-six-fill"
        :title="$t('community.settings.empty.title')"
        :description="$t('community.settings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          :to="appRoutes.groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          {{ $t("community.settings.empty.back") }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityGroupSettingsBasicsCard from "../components/GroupSettingsBasicsCard.vue"
import CommunityGroupSettingsControlsCard from "../components/GroupSettingsControlsCard.vue"
import CommunityGroupSettingsSidebar from "../components/GroupSettingsSidebar.vue"
import CommunitySettingsSectionCard from "../components/SettingsSectionCard.vue"
import { useCommunityGroupSettingPageVM } from "../../application/view-models/useCommunityGroupSettingPageVM"

const { t } = useI18n()
const {
  group,
  previewGroup,
  translatedGroupName,
  memberCountLabel,
  selectedPrivacyLabel,
  selectedPrivacyDescription,
  selectedCategoryLabel,
  settingsNavItems,
  draft,
  validateDraft,
  handleSave,
  handleSaveError,
  groupPath,
  statusAlert,
  isBusy,
  isSaveDisabled,
  enabledPolicies,
  totalPolicies,
  visibleMembers,
  appRoutes,
} = useCommunityGroupSettingPageVM()
</script>
