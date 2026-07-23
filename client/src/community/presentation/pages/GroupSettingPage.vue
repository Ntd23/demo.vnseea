<!-- Description: Renders the group settings route with a settings-nav-first layout and ordered panes that match page-setting layout. -->
<template>
  <div v-if="(group && previewGroup) || status === 'pending'" class="group-settings mt-1.5 max-w-[1120px] space-y-4" :class="{ 'opacity-50 pointer-events-none': status === 'pending' && !group }">
    <section class="group-settings__hero border-b border-slate-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="group-settings__title text-2xl font-black text-slate-900">
            {{ $t('community.settings.title', { name: translatedGroupName }) }}
          </h1>
        </div>

        <NuxtLink :to="groupPath" class="group-settings__button group-settings__button--secondary">
          <Icon name="i-ph-arrow-square-out-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.settings.basics.viewGroup") }}
        </NuxtLink>
      </div>

      <div class="group-settings__stepper-container mb-8 mt-5">
        <nav class="group-settings__nav-horizontal">
          <button v-for="item in settingsNavItems" :key="item.id" type="button"
            class="group-settings__nav-step-item"
            :class="{ 'group-settings__nav-step-item--active': activeTab === item.id }" @click="onTabClick(item.id)">
            <div class="group-settings__nav-step-circle"
              :class="{ 'group-settings__nav-step-circle--active': activeTab === item.id }">
              <Icon :name="item.icon" class="h-5 w-5" />
            </div>
            <div class="group-settings__nav-step-label-container">
              <span class="group-settings__nav-step-label">{{ item.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </section>

    <div class="group-settings__content-container">
      <div class="min-w-0 space-y-4">
        <!-- Status alert -->
        <div v-if="statusAlert" class="group-settings__alert mb-5"
          :class="`group-settings__alert--${statusAlert.color}`" aria-live="polite">
          <Icon :name="statusAlert.icon" class="h-5 w-5 mt-0.5" />
          <div>
            <p class="font-bold">{{ statusAlert.title }}</p>
            <span>{{ statusAlert.description }}</span>
          </div>
        </div>

        <UForm
          v-if="activeTab === 'basics'"
          :state="draft"
          :validate="validateDraft"
          class="space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section id="basics">
            <CommunityGroupSettingsBasicsCard v-model="draft" />
            <!-- Save Button at the bottom -->
            <div class="flex justify-end pt-2">
              <UButton
                type="submit"
                color="primary"
                variant="soft"
                size="lg"
                :loading="isBusy"
                :disabled="isSaveDisabled"
                class="btn-primary rounded-full px-8 text-[14px] font-extrabold"
              >
                <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                {{ $t("community.settings.finish.save") }}
              </UButton>
            </div>
          </section>

        </UForm>

        <UForm
          v-else-if="activeTab === 'controls'"
          :state="draft"
          :validate="validateDraft"
          class="space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section id="controls">
            <CommunityGroupSettingsControlsCard v-model="draft" />
          </section>

          <!-- Save Button at the bottom -->
          <div class="flex justify-end pt-2">
            <UButton
              type="submit"
              color="primary"
              variant="soft"
              size="lg"
              :loading="isBusy"
              :disabled="isSaveDisabled"
              class="btn-primary rounded-full px-8 text-[14px] font-extrabold"
            >
              <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
              {{ $t("community.settings.finish.save") }}
            </UButton>
          </div>
        </UForm>

        <UForm
          v-else-if="activeTab === 'media'"
          :state="draft"
          :validate="validateDraft"
          class="space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section id="media">
            <CommunityGroupSettingsMediaCard v-model="draft" :preview-group="previewGroup" />
          </section>

          <!-- Save Button at the bottom -->
          <div class="flex justify-end pt-2">
            <UButton
              type="submit"
              color="primary"
              variant="soft"
              size="lg"
              :loading="isBusy"
              :disabled="isSaveDisabled"
              class="btn-primary rounded-full px-8 text-[14px] font-extrabold"
            >
              <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
              {{ $t("community.settings.finish.save") }}
            </UButton>
          </div>
        </UForm>

        <!-- Group Members Management Card -->
        <section v-else-if="activeTab === 'members'" id="members">
          <CommunityGroupSettingsMembersCard
            :members="groupMembers"
            :loading="loadingMembers"
            @kick="handleKickMember"
          />
        </section>

        <section v-else-if="activeTab === 'analytics'" id="analytics">
          <CommunityGroupSettingsAnalyticCard
            :analytics="groupAnalytics"
            :period="analyticsPeriod"
            :loading="analyticsLoading"
            :error-message="analyticsError"
            @update:period="setAnalyticsPeriod"
          />
        </section>

        <section v-else-if="activeTab === 'delete'" id="delete">
          <CommunityGroupSettingsDeleteCard @delete="handleDeleteGroup" />
        </section>
      </div>
    </div>
  </div>

  <div v-else-if="status === 'error' || (status === 'success' && !group)" class="mx-auto max-w-[960px] px-3 pb-10 pt-4 sm:px-5">
    <section class="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-gear-six-fill"
        :title="$t('community.settings.empty.title')"
        :description="$t('community.settings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          :to="appRoutes.groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[var(--bg-brand)] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_color-mix(in srgb, var(--bg-brand) 24%, transparent)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
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
import CommunityGroupSettingsMediaCard from "../components/GroupSettingsMediaCard.vue"
import CommunityGroupSettingsMembersCard from "../components/GroupSettingsMembersCard.vue"
import CommunityGroupSettingsAnalyticCard from "../components/GroupSettingsAnalyticCard.vue"
import CommunityGroupSettingsDeleteCard from "../components/GroupSettingsDeleteCard.vue"
import { useCommunityGroupSettingPageVM } from "../../application/view-models/useCommunityGroupSettingPageVM"

const {
  group,
  previewGroup,
  translatedGroupName,
  draft,
  activeTab,
  settingsNavItems,
  validateDraft,
  handleSave,
  handleSaveError,
  handleDeleteGroup,
  groupPath,
  statusAlert,
  isBusy,
  isSaveDisabled,
  groupMembers,
  loadingMembers,
  handleKickMember,
  groupAnalytics,
  analyticsPeriod,
  analyticsLoading,
  analyticsError,
  setAnalyticsPeriod,
  appRoutes,
  status,
} = useCommunityGroupSettingPageVM()

function onTabClick(tabId: string) {
  activeTab.value = tabId
  if (import.meta.client && window.innerWidth < 768) {
    nextTick(() => {
      const contentEl = document.querySelector(".group-settings__content-container")
      if (contentEl) {
        const yOffset = -70 // Sticky header height offset
        const y = contentEl.getBoundingClientRect().top + window.scrollY + yOffset
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    })
  }
}
</script>

<style scoped>
.group-settings__hero,
.group-settings__nav-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.group-settings__hero {
  padding: 20px;
}

.group-settings__title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.group-settings__desc {
  margin: 0;
  max-width: 760px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.group-settings__stepper-container {
  position: relative;
  z-index: 10;
}

.group-settings__nav-horizontal {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.group-settings__nav-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
}

.group-settings__nav-step-circle {
  display: flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;
  border: 2px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-settings__nav-step-circle--active {
  background: var(--bg-brand);
  color: #ffffff;
  border-color: var(--bg-brand);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.group-settings__nav-step-label-container {
  min-width: 0;
  text-align: left;
}

.group-settings__nav-step-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  transition: color 0.2s ease;
}

.group-settings__nav-step-item--active {
  border-color: color-mix(in srgb, var(--bg-brand) 16%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.group-settings__nav-step-item--active .group-settings__nav-step-label {
  color: var(--bg-brand);
  font-weight: 800;
}

.group-settings__nav-step-item:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
}

.group-settings__nav-step-item:hover .group-settings__nav-step-circle:not(.group-settings__nav-step-circle--active) {
  border-color: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  color: var(--bg-brand);
}

@media (min-width: 768px) {
  .group-settings__nav-horizontal {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
  }

  .group-settings__nav-step-item {
    flex: 0 1 auto;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: auto;
    min-width: 100px;
    border: none;
    border-radius: 0;
    background: transparent;
    padding: 0;
    text-align: center;
  }

  .group-settings__nav-step-item--active {
    background: transparent;
  }

  .group-settings__nav-step-circle {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 50%;
    background: #ffffff;
  }

  .group-settings__nav-step-circle--active {
    background: #ffffff;
    color: var(--bg-brand);
    border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 14%, transparent);
  }

  .group-settings__nav-step-label-container {
    text-align: center;
  }

  .group-settings__nav-step-item--active .group-settings__nav-step-label {
    color: #0f172a;
    text-decoration: underline;
    text-underline-offset: 6px;
    text-decoration-thickness: 2px;
    text-decoration-color: var(--bg-brand);
  }

  .group-settings__nav-step-item:hover {
    background: transparent;
    border-color: transparent;
  }

  .group-settings__nav-step-item:hover .group-settings__nav-step-circle:not(.group-settings__nav-step-circle--active) {
    border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
    color: var(--bg-brand);
    background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  }
}

.group-settings__alert {
  display: flex;
  gap: 12px;
  border: 1px solid var(--color-primary-200);
  border-radius: 16px;
  background: var(--color-primary-50);
  color: var(--bg-brand-hover);
  padding: 14px 16px;
}

.group-settings__alert p {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.group-settings__alert span {
  display: block;
  margin-top: 3px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.group-settings__alert--success {
  border-color: #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
}

.group-settings__alert--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.group-settings__button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
}

.group-settings__button:not(:disabled):hover {
  transform: translateY(-1px);
}

.group-settings__button--secondary {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #000000;
}

.group-settings__button--secondary:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
  color: var(--bg-brand-hover);
}

.group-settings__button--primary {
  border: 1px solid var(--bg-brand);
  background: var(--bg-brand);
  color: #ffffff;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--bg-brand) 18%, transparent);
}

.group-settings__button--primary:hover {
  background: var(--bg-brand-hover);
}

.group-settings__button:disabled,
.group-settings__button[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
