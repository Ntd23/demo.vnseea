<!-- English description: Backend-backed funding creation and editing form with reliable Nuxt UI submission and cover preview. -->
<template>
  <main class="create-funding">
    <div class="create-funding__card mt-1.5">
      <USkeleton v-if="loadingCampaign" class="create-funding__skeleton" />

      <form v-else class="create-funding__form" @submit.prevent="submit">
        <!-- Tiêu đề -->
        <UFormField
          :label="t('pages.createFundingPage.formTitleLabel')"
          name="title"
          required
        >
          <UInput
            v-model="draft.title"
            class="w-full"
            :placeholder="t('pages.createFundingPage.formTitlePlaceholder')"
            :disabled="submitting"
            size="xl"
          />
        </UFormField>

        <!-- Bạn muốn nhận được bao nhiêu tiền? -->
        <UFormField
          :label="t('pages.createFundingPage.goalLabel')"
          name="amount"
          required
        >
          <UInput
            v-model.number="draft.amount"
            type="number"
            min="1"
            class="w-full"
            :placeholder="t('pages.createFundingPage.goalPlaceholder')"
            :disabled="submitting"
            size="xl"
          />
        </UFormField>

        <!-- Sự mô tả -->
        <UFormField
          :label="t('pages.createFundingPage.descriptionLabel')"
          name="description"
          required
        >
          <UTextarea
            v-model="draft.description"
            :placeholder="t('pages.createFundingPage.descriptionPlaceholder')"
            :disabled="submitting"
            size="xl"
            autoresize
            :rows="6"
            class="w-full"
          />
        </UFormField>

        <!-- Hình ảnh -->
        <UFormField
          :label="t('pages.createFundingPage.imageLabel')"
          name="image"
          :required="!isEditMode"
        >
          <div v-if="previewUrl" class="create-funding__preview">
            <img
              :src="previewUrl"
              :alt="draft.title || t('pages.createFundingPage.imageLabel')"
            />
          </div>

          <UFileUpload
            v-model="imageFile"
            accept="image/jpeg,image/png,image/bmp"
            layout="list"
            highlight
            :required="!isEditMode"
            :disabled="submitting"
            :label="t('pages.createFundingPage.selectCover')"
            class="create-funding__file-upload w-full"
          />
        </UFormField>

        <!-- Buttons -->
        <div class="create-funding__actions">
          <UButton
            to="/funding"
            variant="ghost"
            color="neutral"
            size="lg"
            class="text-link rounded-xl px-6"
          >
            {{ t("pages.createFundingPage.backButton") }}
          </UButton>

          <UButton
            type="button"
            color="primary"
            size="xl"
            :loading="submitting"
            :disabled="submitting"
            class="btn-primary rounded-xl px-12 font-bold shadow-md shadow-primary-500/20"
            @click="submit"
          >
            <Icon name="i-ph-paper-plane-tilt-duotone" class="mr-1.5 h-4 w-4" />
            {{
              isEditMode
                ? t("pages.createFundingPage.saveEditButton")
                : t("pages.createFundingPage.submitButton")
            }}
          </UButton>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCreateFundingPageVM } from "../../application/view-models/useCreateFundingPageVM"

const props = withDefaults(
  defineProps<{
    mode?: "create" | "edit"
    campaignId?: string
  }>(),
  {
    mode: "create",
    campaignId: "",
  },
)

const { t } = useI18n()
const {
  draft,
  imageFile,
  previewUrl,
  submitting,
  loadingCampaign,
  isEditMode,
  submit,
} = useCreateFundingPageVM({
  mode: computed(() => props.mode),
  campaignId: computed(() => props.campaignId),
})
</script>

<style scoped>
.create-funding {
  width: 100%;
}

.create-funding__card {
  border-radius: 24px;
  border: 1px solid var(--border-light); /* slate-200 */
  background-color: var(--bg-surface);
  padding: 24px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-sm */
}

@media (min-width: 640px) {
  .create-funding__card {
    padding: 40px;
  }
}

.create-funding__header {
  margin-bottom: 32px;
}

.create-funding__header h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

@media (min-width: 640px) {
  .create-funding__header h1 {
    font-size: 30px;
  }
}

.create-funding__description-meta {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.create-funding__skeleton {
  height: 480px;
  border-radius: 24px;
}

.create-funding__form {
  display: grid;
  gap: 24px;
}

.create-funding__preview {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-muted);
}

.create-funding__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.create-funding__file-upload {
  margin-top: 8px;
}

.create-funding__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 520px) {
  .create-funding__actions {
    gap: 12px;
  }
}
</style>
