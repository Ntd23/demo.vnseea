<!-- English description: Renders the backend-backed ads create and edit form with phtml-equivalent campaign fields. -->
<template>
  <main class="ads-form-page">
    <aside class="ads-form-page__sidebar">
      <section class="ads-form-wallet">
        <p>Số dư ví</p>
        <strong>{{ balanceLabel }}</strong>
      </section>

      <nav class="ads-form-nav" aria-label="Ads navigation">
        <NuxtLink :to="appRoutes.ads" class="ads-form-nav__item">
          <Icon name="i-ph-megaphone-fill" />
          <span>Chiến dịch của tôi</span>
        </NuxtLink>
        <NuxtLink :to="appRoutes.wallet" class="ads-form-nav__item">
          <Icon name="i-ph-wallet-fill" />
          <span>Ví của tôi</span>
        </NuxtLink>
        <NuxtLink :to="appRoutes.adsCreate" class="ads-form-nav__item ads-form-nav__item--active">
          <Icon name="i-ph-plus-circle-fill" />
          <span>Tạo quảng cáo</span>
        </NuxtLink>
      </nav>

      <section class="ads-preview">
        <p class="ads-preview__label">Ad preview</p>
        <div class="ads-preview__head">
          <div class="ads-preview__avatar">
            <Icon name="i-ph-buildings-fill" />
          </div>
          <div>
            <strong>{{ draft.name || "Company" }}</strong>
            <span>{{ draft.location || "Location" }}</span>
          </div>
        </div>
        <h2>{{ draft.headline || "Title" }}</h2>
        <p>{{ draft.description || "Description" }}</p>
        <div class="ads-preview__media">
          <img v-if="isImageMedia(mediaPreviewUrl)" :src="mediaPreviewUrl" alt="Ad preview" />
          <Icon v-else :name="mediaPreviewUrl ? 'i-ph-video-duotone' : 'i-ph-image-square-duotone'" />
        </div>
      </section>
    </aside>

    <section class="ads-form-panel">
      <div class="ads-form-panel__head">
        <div>
          <p>Advertising</p>
          <h1>{{ mode === "create" ? "Tạo quảng cáo" : "Sửa quảng cáo" }}</h1>
        </div>
        <div v-if="mode === 'create'" class="ads-steps">
          <button type="button" :class="{ active: step === 'media' }" @click="step = 'media'">1</button>
          <button type="button" :class="{ active: step === 'details' }" @click="goToDetails">2</button>
          <button type="button" :class="{ active: step === 'targeting' }" @click="goToTargeting">3</button>
        </div>
      </div>

      <UAlert
        v-if="error"
        color="warning"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        title="Không tải được dữ liệu quảng cáo"
        :description="String(error.message || error)"
      />

      <form v-else class="ads-form" @submit.prevent="submit">
        <div v-if="pending" class="ads-form__loading">
          <USkeleton v-for="item in 8" :key="item" class="h-12 rounded-[14px]" />
        </div>

        <template v-else>
          <section v-show="mode === 'edit' || step === 'media'" class="ads-form-section">
            <h2>Media</h2>
            <label class="ads-field">
              <span>Tên công ty</span>
              <input v-model.trim="draft.name" name="name" type="text" maxlength="100" required>
            </label>

            <label class="ads-field">
              <span>Hình ảnh hoặc video</span>
              <input class="sr-only" name="media" type="file" accept="image/*,video/*" @change="onMediaChange">
              <button class="ads-upload" type="button" @click="openFilePicker">
                <Icon name="i-ph-upload-simple-bold" />
                <span>{{ mediaPreviewUrl ? "Đổi media" : "Chọn media" }}</span>
              </button>
            </label>

            <div v-if="mode === 'create'" class="ads-form__footer">
              <UButton type="button" color="primary" icon="i-ph-arrow-right-bold" :disabled="!draft.name || !draft.mediaFile" @click="goToDetails">
                Tiếp
              </UButton>
            </div>
          </section>

          <section v-show="mode === 'edit' || step === 'details'" class="ads-form-section">
            <h2>Chi tiết</h2>
            <label class="ads-field">
              <span>Tiêu đề chiến dịch</span>
              <input v-model.trim="draft.headline" name="headline" type="text" maxlength="200" required>
            </label>
            <label class="ads-field">
              <span>Mô tả</span>
              <textarea v-model.trim="draft.description" name="description" rows="4" required></textarea>
              <small>Mô tả ngắn nội dung quảng cáo.</small>
            </label>
            <div class="ads-form-grid">
              <label class="ads-field">
                <span>Ngày bắt đầu</span>
                <input v-model="draft.startDate" name="start" type="date" required>
              </label>
              <label class="ads-field">
                <span>Ngày kết thúc</span>
                <input v-model="draft.endDate" name="end" type="date" required>
              </label>
            </div>
            <label class="ads-field">
              <span>Website URL</span>
              <input v-model.trim="draft.websiteUrl" name="website" type="url" required>
              <small>Chọn page hoặc nhập link website hợp lệ.</small>
            </label>
            <label v-if="options?.pages.length" class="ads-field">
              <span>Trang của tôi</span>
              <select :value="draft.page" name="page" @change="onPageChange">
                <option value="">Chọn trang</option>
                <option v-for="page in options.pages" :key="page.id" :value="page.slug">{{ page.name }}</option>
              </select>
            </label>

            <div v-if="mode === 'create'" class="ads-form__footer">
              <UButton type="button" color="neutral" variant="soft" icon="i-ph-arrow-left-bold" @click="step = 'media'">
                Quay lại
              </UButton>
              <UButton type="button" color="primary" icon="i-ph-arrow-right-bold" :disabled="!draft.headline || !draft.description || !draft.startDate || !draft.endDate || !draft.websiteUrl" @click="goToTargeting">
                Tiếp
              </UButton>
            </div>
          </section>

          <section v-show="mode === 'edit' || step === 'targeting'" class="ads-form-section">
            <h2>Targeting</h2>
            <label class="ads-field">
              <span>Vị trí</span>
              <input v-model.trim="draft.location" name="location" type="text">
            </label>
            <label class="ads-field">
              <span>Audience</span>
              <select v-model="draft.audienceIds" name="audience-list" multiple>
                <option v-for="item in options?.audience ?? []" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
            </label>
            <div class="ads-form-grid">
              <label class="ads-field">
                <span>Giới tính</span>
                <select v-model="draft.gender" name="gender">
                  <option v-for="item in options?.genders ?? []" :key="item.value" :value="item.value">{{ item.label }}</option>
                </select>
              </label>
              <label class="ads-field">
                <span>Vị trí hiển thị</span>
                <select v-model="draft.placement" name="appears">
                  <option v-for="item in options?.placements ?? []" :key="item.value" :value="item.value">
                    {{ item.label }} (image)
                  </option>
                </select>
              </label>
            </div>
            <div class="ads-form-grid">
              <label class="ads-field">
                <span>Ngân sách</span>
                <input v-model.number="draft.budget" name="budget" type="number" min="0" step="0.01">
                <small>Để trống hoặc 0 nếu không giới hạn.</small>
              </label>
              <label class="ads-field">
                <span>Bidding</span>
                <select v-model="draft.bidding" name="bidding">
                  <option value="clicks">Trả theo lượt nhấp - {{ currentBidPrice }}</option>
                  <option value="views">Trả theo lượt xem - {{ currentBidPrice }}</option>
                </select>
              </label>
            </div>

            <UAlert
              v-if="submitError"
              color="warning"
              variant="soft"
              icon="i-ph-warning-circle-fill"
              title="Không lưu được quảng cáo"
              :description="submitError"
            />

            <div class="ads-form__footer">
              <UButton v-if="mode === 'create'" type="button" color="neutral" variant="soft" icon="i-ph-arrow-left-bold" @click="step = 'details'">
                Quay lại
              </UButton>
              <UButton type="submit" color="primary" icon="i-ph-check-bold" :loading="submitting" :disabled="!canSubmit">
                {{ mode === "create" ? "Publish" : "Save" }}
              </UButton>
            </div>
          </section>
        </template>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useAdsFormPageVM } from "../../application/view-models/useAdsFormPageVM"

const props = defineProps<{
  mode: "create" | "edit"
  campaignId?: number
}>()

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

const balanceLabel = computed(() => `VND${Number(balance?.value ?? 0).toLocaleString("vi-VN")}`)

function onMediaChange(event: Event) {
  const input = event.target as HTMLInputElement
  setMediaFile(input.files?.[0] ?? null)
}

function onPageChange(event: Event) {
  selectPage((event.target as HTMLSelectElement).value)
}

function openFilePicker(event: MouseEvent) {
  const input = (event.currentTarget as HTMLElement).closest(".ads-field")?.querySelector("input[type=file]") as HTMLInputElement | null
  input?.click()
}

const isImageMedia = (value: string) => /\.(avif|gif|jpe?g|png|webp|blob:)(\?|#|$)/i.test(value) || value.startsWith("blob:")
</script>

<style scoped>
.ads-form-page {
  display: grid;
  width: min(100%, 1120px);
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  margin: 0 auto;
  padding: 18px 12px 40px;
}

.ads-form-page__sidebar,
.ads-form-panel,
.ads-preview,
.ads-form-wallet,
.ads-form-nav {
  border: 1px solid #e2e8f0;
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
  background: #eef2ff;
  color: var(--bg-brand);
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
  background: #eef2ff;
  color: var(--bg-brand);
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

.ads-steps button {
  height: 34px;
  width: 34px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-weight: 800;
}

.ads-steps button.active {
  border-color: var(--bg-brand);
  background: var(--bg-brand);
  color: #fff;
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
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.ads-field input,
.ads-field select,
.ads-field textarea {
  width: 100%;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 11px 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.ads-field select[multiple] {
  min-height: 160px;
}

.ads-field small {
  color: var(--text-secondary);
  font-weight: 500;
}

.ads-upload {
  display: inline-flex;
  width: max-content;
  align-items: center;
  gap: 8px;
  border: 1px dashed var(--color-primary-300);
  border-radius: 14px;
  background: var(--color-primary-50);
  padding: 12px 16px;
  color: var(--bg-brand);
  font-weight: 800;
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
