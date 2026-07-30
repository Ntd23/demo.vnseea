<!-- English description: Renders the backend-backed ads create and edit form with phtml-equivalent campaign fields. -->
<template>
  <main class="ads-form-page mt-1.5">
    <aside class="ads-form-page__sidebar">
      <section class="ads-form-wallet">
        <p>{{ $t("ads.page.walletBalance") }}</p>
        <strong>{{ balanceLabel }}</strong>
      </section>

      <nav class="ads-form-nav" aria-label="Ads navigation">
        <NuxtLink :to="appRoutes.ads" class="ads-form-nav__item">
          <Icon name="i-ph-megaphone-fill" />
          <span>{{ $t("ads.form.myCampaigns") }}</span>
        </NuxtLink>
        <NuxtLink :to="appRoutes.wallet" class="ads-form-nav__item">
          <Icon name="i-ph-wallet-fill" />
          <span>{{ $t("ads.form.myWallet") }}</span>
        </NuxtLink>
        <NuxtLink :to="appRoutes.adsCreate" class="ads-form-nav__item ads-form-nav__item--active">
          <Icon name="i-ph-plus-circle-fill" />
          <span>{{ $t("ads.form.createTitle") }}</span>
        </NuxtLink>
      </nav>

      <section class="ads-preview">
        <p class="ads-preview__label">{{ $t("ads.form.adPreview") }}</p>
        <div class="ads-preview__head">
          <div class="ads-preview__avatar">
            <Icon name="i-ph-buildings-fill" />
          </div>
          <div>
            <strong>{{ draft.name || $t("ads.form.previewCompany") }}</strong>
            <span>{{ draft.location || $t("ads.form.previewLocation") }}</span>
          </div>
        </div>
        <h2>{{ draft.headline || $t("ads.form.previewTitle") }}</h2>
        <p>{{ draft.description || $t("ads.form.previewDescription") }}</p>
        <div class="ads-preview__media">
          <img v-if="isImageMedia(mediaPreviewUrl)" :src="mediaPreviewUrl" alt="Ad preview" />
          <Icon v-else :name="mediaPreviewUrl ? 'i-ph-video-duotone' : 'i-ph-image-square-duotone'" />
        </div>
      </section>
    </aside>

    <section class="ads-form-panel">
      <div class="ads-form-panel__head">
        <div>
          <p>{{ $t("ads.form.eyebrow") }}</p>
          <h1>{{ mode === "create" ? $t("ads.form.createTitle") : $t("ads.form.editTitle") }}</h1>
        </div>
        <div v-if="mode === 'create'" class="ads-steps">
          <UButton
            type="button"
            size="sm"
            :color="step === 'media' ? 'primary' : 'neutral'"
            :variant="step === 'media' ? 'solid' : 'outline'"
            label="1"
            class="ads-steps__button"
            @click="step = 'media'"
          />
          <UButton
            type="button"
            size="sm"
            :color="step === 'details' ? 'primary' : 'neutral'"
            :variant="step === 'details' ? 'solid' : 'outline'"
            label="2"
            class="ads-steps__button"
            @click="goToDetails"
          />
          <UButton
            type="button"
            size="sm"
            :color="step === 'targeting' ? 'primary' : 'neutral'"
            :variant="step === 'targeting' ? 'solid' : 'outline'"
            label="3"
            class="ads-steps__button"
            @click="goToTargeting"
          />
        </div>
      </div>

      <UAlert
        v-if="error"
        color="warning"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        :title="$t('ads.form.loadError')"
        :description="String(error.message || error)"
      />

      <UForm v-else :state="draft" class="ads-form" @submit="submit">
        <div v-if="pending" class="ads-form__loading">
          <USkeleton v-for="item in 8" :key="item" class="h-12 rounded-[14px]" />
        </div>

        <template v-else>
          <section v-show="mode === 'edit' || step === 'media'" class="ads-form-section">
            <h2>{{ $t("ads.form.mediaSection") }}</h2>
            <UFormField name="name" :label="$t('ads.form.companyName')" required class="ads-field">
              <UInput
                v-model="draft.name"
                name="name"
                type="text"
                maxlength="100"
                required
                size="lg"
                icon="i-ph-buildings-bold"
                class="w-full"
              />
            </UFormField>

            <UFormField
              name="media"
              :label="$t('ads.form.mediaLabel')"
              :required="mode === 'create'"
              class="ads-field"
            >
              <UFileUpload
                v-model="mediaFileModel"
                name="media"
                accept="image/*,video/*"
                :required="mode === 'create'"
                highlight
                layout="list"
                icon="i-ph-upload-simple-bold"
                :label="mediaPreviewUrl ? $t('ads.form.mediaChange') : $t('ads.form.mediaSelect')"
                :description="$t('ads.form.mediaDescription')"
                class="w-full"
              />
            </UFormField>

            <div v-if="mode === 'create'" class="ads-form__footer">
              <UButton type="button" color="primary" icon="i-ph-arrow-right-bold" :disabled="!draft.name || !draft.mediaFile" @click="goToDetails">
                {{ $t("ads.form.next") }}
              </UButton>
            </div>
          </section>

          <section v-show="mode === 'edit' || step === 'details'" class="ads-form-section">
            <h2>{{ $t("ads.form.details") }}</h2>
            <UFormField name="headline" :label="$t('ads.form.campaignHeadline')" required class="ads-field">
              <UInput
                v-model="draft.headline"
                name="headline"
                type="text"
                maxlength="200"
                required
                size="lg"
                icon="i-ph-text-aa-bold"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="description"
              :label="$t('ads.form.description')"
              :help="$t('ads.form.descriptionHelp')"
              required
              class="ads-field"
            >
              <UTextarea
                v-model="draft.description"
                name="description"
                :rows="4"
                required
                autoresize
                size="lg"
                class="w-full"
              />
            </UFormField>
            <div class="ads-form-grid">
              <UFormField name="start" :label="$t('ads.form.startDate')" required class="ads-field">
                <UInputDate
                  ref="startDateInput"
                  v-model="startDateValue"
                  name="start"
                  required
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    <UPopover :reference="startDateInput?.inputsRef[3]?.$el">
                      <UButton
                        type="button"
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-ph-calendar-blank-bold"
                        :aria-label="$t('ads.form.selectStartDate')"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="startDateValue" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
              <UFormField name="end" :label="$t('ads.form.endDate')" required class="ads-field">
                <UInputDate
                  ref="endDateInput"
                  v-model="endDateValue"
                  name="end"
                  :min-value="startDateValue"
                  required
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    <UPopover :reference="endDateInput?.inputsRef[3]?.$el">
                      <UButton
                        type="button"
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-ph-calendar-blank-bold"
                        :aria-label="$t('ads.form.selectEndDate')"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar
                          v-model="endDateValue"
                          :min-value="startDateValue"
                          class="p-2"
                        />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
            </div>
            <UFormField
              name="website"
              label="Website URL"
              :help="$t('ads.form.websiteHelp')"
              required
              class="ads-field"
            >
              <UInput
                v-model="draft.websiteUrl"
                name="website"
                type="url"
                required
                size="lg"
                icon="i-ph-link-bold"
                class="w-full"
              />
            </UFormField>
            <UFormField
              v-if="pageItems.length > 1"
              name="page"
              :label="$t('ads.form.myPage')"
              class="ads-field"
            >
              <USelect
                v-model="pageModel"
                :items="pageItems"
                value-key="value"
                label-key="label"
                name="page"
                :placeholder="$t('ads.form.selectPage')"
                size="lg"
                icon="i-ph-flag-bold"
                class="w-full"
              />
            </UFormField>

            <div v-if="mode === 'create'" class="ads-form__footer">
              <UButton type="button" color="neutral" variant="soft" icon="i-ph-arrow-left-bold" @click="step = 'media'">
                {{ $t("ads.form.back") }}
              </UButton>
              <UButton type="button" color="primary" icon="i-ph-arrow-right-bold" :disabled="!draft.headline || !draft.description || !draft.startDate || !draft.endDate || !draft.websiteUrl" @click="goToTargeting">
                {{ $t("ads.form.next") }}
              </UButton>
            </div>
          </section>

          <section v-show="mode === 'edit' || step === 'targeting'" class="ads-form-section">
            <h2>{{ $t("ads.form.targeting") }}</h2>
            <UFormField name="location" :label="$t('ads.form.location')" class="ads-field">
              <UInput
                v-model="draft.location"
                name="location"
                type="text"
                size="lg"
                icon="i-ph-map-pin-bold"
                class="w-full"
              />
            </UFormField>
            <UFormField name="audience-list" label="Audience" class="ads-field">
              <USelectMenu
                v-model="draft.audienceIds"
                :items="audienceItems"
                value-key="value"
                label-key="label"
                multiple
                name="audience-list"
                size="lg"
                icon="i-ph-users-three-bold"
                :search-input="{ placeholder: t('ads.form.searchRegion') }"
                class="w-full"
              />
            </UFormField>
            <div class="ads-form-grid">
              <UFormField name="gender" :label="$t('ads.form.gender')" class="ads-field">
                <USelect
                  v-model="draft.gender"
                  :items="genderItems"
                  value-key="value"
                  label-key="label"
                  name="gender"
                  size="lg"
                  icon="i-ph-gender-intersex-bold"
                  class="w-full"
                />
              </UFormField>
              <UFormField name="appears" :label="$t('ads.form.displayPlacement')" class="ads-field">
                <USelect
                  v-model="draft.placement"
                  :items="placementItems"
                  value-key="value"
                  label-key="label"
                  name="appears"
                  size="lg"
                  icon="i-ph-layout-bold"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="ads-form-grid">
              <UFormField
                name="budget"
                :label="$t('ads.form.budget')"
                :help="$t('ads.form.budgetHelp')"
                class="ads-field"
              >
                <UInputNumber
                  v-model="draft.budget"
                  name="budget"
                  :min="0"
                  :step="0.01"
                  orientation="vertical"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
              <UFormField name="bidding" label="Bidding" class="ads-field">
                <USelect
                  v-model="draft.bidding"
                  :items="biddingItems"
                  value-key="value"
                  label-key="label"
                  name="bidding"
                  size="lg"
                  icon="i-ph-currency-circle-dollar-bold"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UAlert
              v-if="submitError"
              color="warning"
              variant="soft"
              icon="i-ph-warning-circle-fill"
              :title="$t('ads.form.saveError')"
              :description="submitError"
            />

            <div class="ads-form__footer">
              <UButton v-if="mode === 'create'" type="button" color="neutral" variant="soft" icon="i-ph-arrow-left-bold" @click="step = 'details'">
                {{ $t("ads.form.back") }}
              </UButton>
              <UButton type="submit" color="primary" icon="i-ph-check-bold" :loading="submitting" :disabled="!canSubmit">
                {{ mode === "create" ? $t("ads.form.publish") : $t("ads.form.save") }}
              </UButton>
            </div>
          </section>
        </template>
      </UForm>
    </section>
  </main>
</template>

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useAdsFormPageVM } from "../../application/view-models/useAdsFormPageVM"

const props = defineProps<{
  mode: "create" | "edit"
  campaignId?: number
}>()

const { t } = useI18n()
const {
  balance,
  canSubmit,
  currentBidPrice,
  draft,
  error,
  goToDetails,
  goToTargeting,
  mediaPreviewUrl,
  options,
  pending,
  selectPage,
  setMediaFile,
  step,
  submit,
  submitError,
  submitting,
} = useAdsFormPageVM(props.mode, props.campaignId)

const startDateInput = useTemplateRef("startDateInput")
const endDateInput = useTemplateRef("endDateInput")
const balanceLabel = computed(() => `VND${Number(balance?.value ?? 0).toLocaleString("vi-VN")}`)
const mediaFileModel = computed<File | null>({
  get: () => draft.mediaFile,
  set: file => setMediaFile(file),
})
const pageModel = computed<string | undefined>({
  get: () => draft.page || undefined,
  set: value => selectPage(value ?? ""),
})
const pageItems = computed(() =>
  (options.value?.pages ?? []).map(page => ({
    label: page.name,
    value: page.slug,
  })).filter(item => item.value.length > 0),
)
const audienceItems = computed(() =>
  (options.value?.audience ?? []).filter(item => item.value.length > 0),
)
const genderItems = computed(() =>
  (options.value?.genders ?? []).filter(item => item.value.length > 0),
)
const placementItems = computed(() =>
  (options.value?.placements ?? [])
    .filter(item => item.value.length > 0)
    .map(item => ({
      ...item,
      label: `${item.label} (image)`,
    })),
)
const biddingItems = computed(() => [
  {
    label: t("ads.form.payPerClick", { price: currentBidPrice.value }),
    value: "clicks",
  },
  {
    label: t("ads.form.payPerView", { price: currentBidPrice.value }),
    value: "views",
  },
])
const startDateValue = computed<CalendarDate | undefined>({
  get: () => parseCalendarDate(draft.startDate),
  set: value => {
    draft.startDate = value?.toString() ?? ""

    if (value && endDateValue.value && endDateValue.value.compare(value) < 0) {
      draft.endDate = value.toString()
    }
  },
})
const endDateValue = computed<CalendarDate | undefined>({
  get: () => parseCalendarDate(draft.endDate),
  set: value => {
    draft.endDate = value?.toString() ?? ""
  },
})

function parseCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined

  return new CalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

const isImageMedia = (value: string) => /\.(avif|gif|jpe?g|png|webp|blob:)(\?|#|$)/i.test(value) || value.startsWith("blob:")
</script>

<style scoped>
.ads-form-page {
  display: grid;
  width: min(100%, 1120px);
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.ads-form-page__sidebar,
.ads-form-panel,
.ads-preview,
.ads-form-wallet,
.ads-form-nav {
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
}

.ads-form-page__sidebar {
  display: flex;
  height: max-content;
  flex-direction: column;
  gap: 14px;
  border: 0;
  background: transparent;
}

.ads-form-wallet,
.ads-preview {
  padding: 18px;
}

.ads-form-wallet p,
.ads-preview__label,
.ads-form-panel__head p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.ads-form-wallet strong {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 800;
}

.ads-form-nav {
  overflow: hidden;
  padding: 8px;
}

.ads-form-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 11px 12px;
  color: var(--text-primary);
  font-weight: 700;
  text-decoration: none;
}

.ads-form-nav__item--active {
  background: var(--bg-surface-active);
  color: var(--text-brand);
}

.ads-preview__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.ads-preview__avatar {
  display: grid;
  height: 42px;
  width: 42px;
  place-items: center;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--icon-brand);
}

.ads-preview__head strong,
.ads-preview h2 {
  display: block;
  color: var(--text-primary);
  font-weight: 800;
}

.ads-preview__head span,
.ads-preview p {
  color: var(--text-secondary);
  font-size: 13px;
}

.ads-preview__media {
  display: grid;
  overflow: hidden;
  min-height: 160px;
  place-items: center;
  border-radius: 14px;
  background: var(--bg-muted);
}

.ads-preview__media img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.ads-preview__media svg {
  height: 42px;
  width: 42px;
  color: var(--text-tertiary);
}

.ads-form-panel {
  padding: 22px;
}

.ads-form-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ads-form-panel__head h1,
.ads-form-section h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 800;
}

.ads-steps {
  display: flex;
  gap: 8px;
}

.ads-steps__button {
  height: 34px;
  width: 34px;
  border-radius: 999px;
  font-weight: 800;
}

.ads-form,
.ads-form-section,
.ads-form__loading {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ads-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.ads-field {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.ads-field :deep([data-slot="root"]),
.ads-field :deep([data-slot="base"]) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.ads-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

@media (max-width: 900px) {
  .ads-form-page {
    grid-template-columns: 1fr;
  }

  .ads-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
