<!-- Description: Renders the page settings route with a settings-nav-first layout and ordered panes that mirror the legacy PHP page settings structure. -->
<template>
  <div
    v-if="page && previewPage"
    class="page-settings mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6"
  >
    <section class="page-settings__hero border-b border-slate-100 pb-8 pt-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-settings__title text-2xl font-black text-slate-900">
            {{ $t("community.pageSettings.title") }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ $t("community.pageSettings.desc") }}
          </p>
        </div>

        <NuxtLink :to="pagePath" class="page-settings__button page-settings__button--secondary">
          <Icon name="i-ph-arrow-square-out-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.pageSettings.basics.viewPage") }}
        </NuxtLink>
      </div>

      <div class="page-settings__stepper-container mb-8 mt-5">
        <nav class="page-settings__nav-horizontal">
          <div class="page-settings__nav-line-horizontal" />
          <button
            v-for="item in settingsNavItems"
            :key="item.id"
            type="button"
            class="page-settings__nav-step-item"
            :class="{ 'page-settings__nav-step-item--active': activeTab === item.id }"
            @click="activeTab = item.id"
          >
            <div
              class="page-settings__nav-step-circle"
              :class="{ 'page-settings__nav-step-circle--active': activeTab === item.id }"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
            </div>
            <div class="page-settings__nav-step-label-container">
              <span class="page-settings__nav-step-label">{{ item.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </section>

    <div class="page-settings__content-container">
      <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
        <UForm
          :state="draft"
          :validate="validateDraft"
          class="min-w-0 space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section v-if="activeTab === 'basics'" id="basics">
            <CommunityPageSettingsBasicsCard v-model="draft" :page-path="pagePath">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
            </CommunityPageSettingsBasicsCard>
          </section>

          <section v-if="activeTab === 'preview'" id="preview">
            <CommunitySettingsSectionCard
              :eyebrow="$t('community.pageSettings.preview.eyebrow')"
              :title="$t('community.pageSettings.sidebar.preview')"
              :description="$t('community.pageSettings.preview.navDesc')"
              icon="i-ph-eye-bold"
            >
              <div class="page-preview-card overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div
                  class="page-preview-banner relative h-[220px] bg-slate-100"
                  :style="{ background: previewPage.banner }"
                >
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div class="px-8 pb-8">
                  <div class="relative z-10 -mt-12 flex items-end justify-between gap-5">
                    <div class="flex items-end gap-5">
                      <div class="page-preview-avatar-wrap rounded-full bg-white p-1">
                        <div
                          class="page-preview-avatar flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-xl font-black text-white shadow-md"
                          :style="{ background: previewPage.accent }"
                        >
                          <img
                            v-if="previewPage.avatarUrl"
                            :src="previewPage.avatarUrl"
                            class="h-full w-full object-cover"
                          >
                          <span v-else>{{ initials }}</span>
                        </div>
                      </div>

                      <div class="rounded-t-[28px] bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                        <h2 class="text-2xl font-black tracking-tight text-slate-900">
                          {{ previewPage.name }}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 pl-2">
                    <p class="max-w-2xl text-[14px] font-medium leading-relaxed text-slate-500">
                      {{ previewPage.summary }}
                    </p>
                    <div class="mt-3 flex items-center gap-2 text-[13px] font-semibold text-slate-400">
                      <span>{{ followerPreview }}</span>
                      <span class="opacity-30">&bull;</span>
                      <span>{{ likePreview }}</span>
                    </div>
                  </div>

                  <!-- Upload Avatar -->
                  <input ref="avatarInput" type="file" accept="image/*" class="hidden-input"
                    @change="e => onFileChange(e, 'avatarUrl')">

                  <button type="button" class="avatar-upload-btn" @click="avatarInput?.click()">
                    <Icon name="i-ph-camera-bold" class="avatar-upload-btn__icon" />
                  </button>
                </div>
              </div>

              <!-- Spacer for overlapping avatar -->
              <div class="h-20 sm:h-28"></div>
            </CommunitySettingsSectionCard>
          </section>

          <section v-if="activeTab === 'controls'" id="controls">
            <CommunityPageSettingsControlsCard v-model="draft">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
            </CommunityPageSettingsControlsCard>
          </section>

          <section v-if="activeTab === 'admins'" id="admins">
            <CommunitySettingsSectionCard eyebrow="CÀI ĐẶT QUẢN TRỊ" title="Quản trị viên"
              description="Thêm hoặc xóa các quản trị viên cho trang của bạn để cùng quản lý nội dung và cài đặt."
              icon="i-ph-shield-checkered-bold">
              <div class="flex flex-col gap-4 py-4">
                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                  <Icon name="i-ph-users-three-duotone" class="mx-auto h-12 w-12 text-slate-300" />
                  <p class="mt-2 text-sm font-medium text-slate-500">Chức năng quản trị viên đang được cập nhật</p>
                </div>
              </div>
            </CommunitySettingsSectionCard>
          </section>

          <section v-if="activeTab === 'finish'" id="finish">
            <CommunitySettingsSectionCard
              :eyebrow="$t('community.pageSettings.finish.eyebrow')"
              :title="$t('community.pageSettings.finish.title')"
              :description="$t('community.pageSettings.finish.desc')"
              icon="i-ph-floppy-disk-back-bold"
            >
              <div class="flex flex-col gap-4">
                <div class="page-settings__finish-note">
                  <span
                    v-html="$t('community.pageSettings.finish.status', { enabled: enabledPolicies, total: totalPolicies, cta: (selectedCtaLabel || '').toLowerCase() })"
                  ></span>
                </div>

                <div
                  v-if="statusAlert"
                  class="page-settings__alert"
                  :class="`page-settings__alert--${statusAlert.color}`"
                  aria-live="polite"
                >
                  <Icon :name="statusAlert.icon" class="h-5 w-5" />
                  <div>
                    <p>{{ statusAlert.title }}</p>
                    <span>{{ statusAlert.description }}</span>
                  </div>
                </div>

                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <NuxtLink
                    :to="pagePath"
                    class="page-settings__button page-settings__button--secondary"
                    :aria-disabled="isBusy"
                  >
                    <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                    {{ $t("community.pageSettings.finish.back") }}
                  </NuxtLink>

                  <button
                    type="submit"
                    :disabled="isSaveDisabled"
                    class="page-settings__button page-settings__button--primary"
                  >
                    <Icon
                      :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'"
                      class="mr-2 h-4 w-4"
                    />
                    {{ $t("community.pageSettings.finish.save") }}
                  </button>
                </div>
              </div>
            </CommunitySettingsSectionCard>
          </section>
        </UForm>

        <CommunityPageSettingsSidebar
          v-if="activeTab === 'preview'"
          :page="previewPage"
          :category-label="selectedCategoryLabel"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
          :selected-cta-label="selectedCtaLabel"
          :enabled-policies="enabledPolicies"
          :total-policies="totalPolicies"
          :show-follower-count="draft.showFollowerCount"
          :show-like-count="draft.showLikeCount"
          :allow-messages="draft.allowMessages"
          :recommend-related-pages="draft.recommendRelatedPages"
        />
      </div>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] px-3 pb-10 pt-4 sm:px-5">
    <section
      class="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 sm:py-16"
    >
      <FoundationEmptyState
        icon="i-ph-sliders-horizontal-fill"
        :title="$t('community.pageSettings.empty.title')"
        :description="$t('community.pageSettings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          :to="appRoutes.pages"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          {{ $t("community.pageSettings.empty.back") }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageSettingsBasicsCard from "../components/PageSettingsBasicsCard.vue"
import CommunityPageSettingsControlsCard from "../components/PageSettingsControlsCard.vue"
import CommunityPageSettingsSidebar from "../components/PageSettingsSidebar.vue"
import CommunitySettingsSectionCard from "../components/SettingsSectionCard.vue"
import { useCommunityPageSettingPageVM } from "../../application/view-models/useCommunityPageSettingPageVM"

const {
  page,
  previewPage,
  draft,
  validateDraft,
  handleSave,
  handleSaveError,
  activeTab,
  pagePath,
  settingsNavItems,
  statusAlert,
  isBusy,
  isSaveDisabled,
  selectedCategoryLabel,
  followerCountLabel,
  likeCountLabel,
  selectedCtaLabel,
  enabledPolicies,
  totalPolicies,
  initials,
  followerPreview,
  likePreview,
  appRoutes,
} = useCommunityPageSettingPageVM()

const { t } = useI18n()
</script>

<style scoped>
.page-settings__hero,
.page-settings__nav-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.page-settings__hero {
  padding: 20px;
}

.page-settings__avatar {
  display: flex;
  height: 80px;
  width: 80px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
}

.page-settings__eyebrow,
.settings-section-card__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.settings-section-card__title {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.settings-section-card__desc {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13.5px;
  line-height: 1.5;
}

.page-settings__title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.page-settings__desc {
  margin: 0;
  max-width: 760px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.page-settings__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-settings__pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 6px 12px;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.settings-section-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-settings__stepper-container {
  position: relative;
  z-index: 10;
}

.page-settings__nav-horizontal {
  position: relative;
  margin: 0 auto;
  display: flex;
  max-width: 800px;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

.page-settings__nav-line-horizontal {
  position: absolute;
  top: 16px;
  left: 60px;
  right: 60px;
  z-index: -1;
  height: 2px;
  background: #f1f5f9;
}

.page-settings__nav-step-item {
  display: flex;
  min-width: 100px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  padding: 0;
}

.page-settings__nav-step-circle {
  display: flex;
  height: 34px;
  width: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #f1f5f9;
  background: #ffffff;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-settings__nav-step-circle--active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.page-settings__nav-step-label-container {
  text-align: center;
}

.page-settings__nav-step-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  transition: color 0.2s ease;
}

.page-settings__nav-step-item--active .page-settings__nav-step-label {
  color: #0f172a;
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;
  text-decoration-color: #2563eb;
}

.page-settings__nav-step-item:hover .page-settings__nav-step-circle:not(.page-settings__nav-step-circle--active) {
  border-color: #cbd5e1;
  color: #475569;
}

.page-preview-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-preview-banner {
  background-size: cover !important;
  background-position: center !important;
}

.page-preview-avatar-wrap {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.page-settings__finish-note {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  color: #64748b;
  padding: 13px 16px;
  font-size: 13px;
  line-height: 1.6;
}

.page-settings__alert {
  display: flex;
  gap: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 14px 16px;
}

.page-settings__alert p {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.page-settings__alert span {
  display: block;
  margin-top: 3px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.page-settings__alert--success {
  border-color: #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
}

.page-settings__alert--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.page-settings__button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease,
    transform 0.15s ease;
}

.page-settings__button:not(:disabled):hover {
  transform: translateY(-1px);
}

.page-settings__button--secondary {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.page-settings__button--secondary:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.page-settings__button--primary {
  border: 1px solid #2563eb;
  background: #0000ff;
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(0, 0, 255, 0.18);
}

.page-settings__button--primary:hover {
  background: #0000d8;
}

.page-settings__button:disabled,
.page-settings__button[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.55;
}

.page-settings-sidebar :deep(progress),
.page-settings-sidebar :deep([role="progressbar"]) {
  background-color: #dbeafe;
}

.page-preview {
  position: relative;
  margin-top: 16px;
}

/* =========================
   Banner
========================= */

.page-preview__banner {
  position: relative;
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-radius: 24px;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
}

.page-preview__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.3),
      transparent);
}

/* =========================
   Banner Upload
========================= */

.page-preview__banner-upload {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 2;
}

/* =========================
   Avatar
========================= */

.page-preview__avatar-wrapper {
  position: absolute;
  left: 48px;
  bottom: -80px;
  z-index: 10;
}

.page-preview__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 176px;
  height: 176px;

  overflow: hidden;

  border: 8px solid #ffffff;
  border-radius: 999px;

  background: #3b82f6;

  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);

  color: #ffffff;
  font-size: 42px;
  font-weight: 900;
}

.page-preview__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================
   Buttons
========================= */

.upload-btn,
.avatar-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 999px;

  background: #ffffff;
  color: #0f172a;

  cursor: pointer;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.upload-btn:hover,
.avatar-upload-btn:hover {
  transform: scale(1.05);
}

/* Banner button */

.upload-btn {
  width: 48px;
  height: 48px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
}

/* Avatar button */

.avatar-upload-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;

  width: 48px;
  height: 48px;

  border: 1px solid #e2e8f0;

  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
}

.upload-btn__icon,
.avatar-upload-btn__icon {
  width: 24px;
  height: 24px;
}

/* =========================
   Hidden Input
========================= */

.hidden-input {
  display: none;
}

/* =========================
   Responsive
========================= */

@media (max-width: 640px) {
  .page-preview__banner {
    height: 280px;
    border-radius: 20px;
  }

  .page-preview__banner-upload {
    right: 16px;
    bottom: 16px;
  }

  .page-preview__avatar-wrapper {
    left: 24px;
    bottom: -64px;
  }

  .page-preview__avatar {
    width: 128px;
    height: 128px;
    border-width: 6px;
    font-size: 30px;
  }

  .upload-btn,
  .avatar-upload-btn {
    width: 40px;
    height: 40px;
  }

  .upload-btn__icon,
  .avatar-upload-btn__icon {
    width: 20px;
    height: 20px;
  }
}
</style>
