<template>
  <div class="blog-editor-page">
    <header class="blog-editor-page__header">
      <NuxtLink :to="appRoutes.blogs" class="blog-editor-page__back">
        <Icon name="i-ph-arrow-left-bold" class="h-4 w-4" />
        <span>{{ $t("pages.createBlogPage.backToBlogs") }}</span>
      </NuxtLink>
      <div>
        <h1>{{ $t(isEditing ? "pages.createBlogPage.editTitle" : "pages.createBlogPage.createTitle") }}</h1>
        <p>{{ $t(isEditing ? "pages.createBlogPage.editDescription" : "pages.createBlogPage.createDescription") }}</p>
      </div>
    </header>

    <div v-if="isLoadingArticle" class="blog-editor-page__loading" role="status">
      <Icon name="i-ph-circle-notch-bold" class="h-5 w-5 animate-spin" />
      <span>{{ $t("pages.createBlogPage.loadingArticle") }}</span>
    </div>

    <form v-else class="blog-editor-page__form" @submit.prevent="publishBlog">
      <label class="blog-editor-page__field">
        <span>{{ $t("pages.createBlogPage.titleLabel") }}</span>
        <input
          v-model="title"
          type="text"
          maxlength="120"
          required
          :placeholder="$t('pages.createBlogPage.titlePlaceholder')"
        >
      </label>

      <label class="blog-editor-page__field">
        <span>{{ $t("pages.createBlogPage.summaryLabel") }}</span>
        <textarea
          v-model="descriptionInput"
          rows="3"
          maxlength="290"
          :placeholder="$t('pages.createBlogPage.summaryPlaceholder')"
        />
        <small>{{ descriptionInput.length }}/290</small>
      </label>

      <div class="blog-editor-page__grid">
        <label class="blog-editor-page__field">
          <span>{{ $t("pages.createBlogPage.categoryLabel") }}</span>
          <select v-model="category" required>
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="blog-editor-page__field">
          <span>{{ $t("pages.createBlogPage.tagsLabel") }}</span>
          <input
            v-model="tagsInput"
            type="text"
            :placeholder="$t('pages.createBlogPage.tagsPlaceholder')"
          >
        </label>
      </div>

      <label class="blog-editor-page__field">
        <span>{{ $t("pages.createBlogPage.thumbnailLabel") }}</span>
        <span v-if="thumbnailPreviewUrl" class="blog-editor-page__thumbnail-preview">
          <img
            :src="thumbnailPreviewUrl"
            :alt="title || $t('pages.createBlogPage.imagePreview')"
            width="960"
            height="540"
          />
          <small>{{ $t("pages.createBlogPage.imagePreview") }}</small>
        </span>
        <input class="blog-editor-page__file" type="file" accept="image/png,image/jpeg,image/webp" @change="onThumbnailChange">
        <small>{{ thumbnailName || $t("pages.createBlogPage.thumbnailFormats") }}</small>
      </label>

      <label class="blog-editor-page__field">
        <span>{{ $t("pages.createBlogPage.contentLabel") }}</span>
        <textarea
          v-model="content"
          class="blog-editor-page__content"
          rows="16"
          required
          :placeholder="$t('pages.createBlogPage.contentPlaceholder')"
        />
      </label>

      <div
        v-if="submitMessage"
        class="blog-editor-page__status"
        :class="`blog-editor-page__status--${submitState}`"
        role="status"
        aria-live="polite"
      >
        <Icon :name="submitStatusIcon" class="h-5 w-5" />
        <span>{{ submitMessage }}</span>
      </div>

      <footer class="blog-editor-page__actions">
        <NuxtLink :to="appRoutes.blogs" class="blog-editor-page__cancel">
          {{ $t("pages.createBlogPage.cancel") }}
        </NuxtLink>
        <button
          v-if="!isEditing"
          class="blog-editor-page__draft"
          type="button"
          :disabled="isSubmitting"
          @click="saveDraft"
        >
          <Icon :name="submitState === 'saving' ? 'i-ph-circle-notch-bold' : 'i-ph-floppy-disk-bold'" class="h-4 w-4" />
          {{ $t("pages.createBlogPage.saveDraft") }}
        </button>
        <button class="blog-editor-page__submit" type="submit" :disabled="isSubmitting">
          <Icon :name="submitState === 'publishing' ? 'i-ph-circle-notch-bold' : isEditing ? 'i-ph-check-bold' : 'i-ph-paper-plane-tilt-fill'" class="h-4 w-4" />
          {{ $t(isEditing ? "pages.createBlogPage.update" : "pages.createBlogPage.publish") }}
        </button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useCreateBlogPageVM } from "../../application/view-models/useCreateBlogPageVM"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

const props = defineProps<{ editBlogId?: number }>()

const {
  title,
  descriptionInput,
  content,
  category,
  tagsInput,
  thumbnailName,
  thumbnailPreviewUrl,
  submitMessage,
  submitState,
  isSubmitting,
  submitStatusIcon,
  isEditing,
  isLoadingArticle,
  categoryOptions,
  onThumbnailChange,
  saveDraft,
  publishBlog,
  loadArticleForEditing,
} = useCreateBlogPageVM(undefined, props.editBlogId)

onMounted(loadArticleForEditing)
</script>

<style scoped>
.blog-editor-page {
  width: min(100%, 920px);
  margin: 0 auto;
  padding: 16px 0 44px;
}

.blog-editor-page__header {
  margin-bottom: 16px;
}

.blog-editor-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.blog-editor-page__back:hover {
  color: var(--bg-brand);
}

.blog-editor-page__header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  line-height: 1.2;
}

.blog-editor-page__header p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.blog-editor-page__form,
.blog-editor-page__loading {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.blog-editor-page__form {
  display: grid;
  gap: 20px;
  padding: 20px;
}

.blog-editor-page__loading {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
}

.blog-editor-page__grid {
  display: grid;
  gap: 16px;
}

.blog-editor-page__field {
  display: grid;
  gap: 8px;
}

.blog-editor-page__field > span {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 750;
}

.blog-editor-page__field input,
.blog-editor-page__field select,
.blog-editor-page__field textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.blog-editor-page__field input,
.blog-editor-page__field select {
  min-height: 46px;
  padding: 0 13px;
}

.blog-editor-page__field textarea {
  resize: vertical;
  padding: 12px 13px;
  line-height: 1.65;
}

.blog-editor-page__field input::placeholder,
.blog-editor-page__field textarea::placeholder {
  color: var(--text-tertiary);
  opacity: 1;
}

.blog-editor-page__field input:focus,
.blog-editor-page__field select:focus,
.blog-editor-page__field textarea:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 30%, transparent);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 7%, transparent);
}

.blog-editor-page__field small {
  justify-self: end;
  color: var(--text-secondary);
  font-size: 12px;
}

.blog-editor-page__field .blog-editor-page__file {
  height: auto;
  padding: 8px;
  cursor: pointer;
}

.blog-editor-page__thumbnail-preview {
  position: relative;
  display: block;
  width: min(100%, 520px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: var(--bg-muted);
}

.blog-editor-page__thumbnail-preview :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-editor-page__thumbnail-preview small {
  position: absolute;
  right: 9px;
  bottom: 9px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
}

.blog-editor-page__file::file-selector-button {
  margin-right: 10px;
  border: 0;
  border-radius: 8px;
  background: #eef2ff;
  color: var(--bg-brand);
  padding: 8px 11px;
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.blog-editor-page__content {
  min-height: 330px;
}

.blog-editor-page__status {
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: 11px 13px;
  font-size: 13px;
  font-weight: 700;
}

.blog-editor-page__status--error,
.blog-editor-page__status--warning {
  background: #fff7ed;
  color: #c2410c;
}

.blog-editor-page__status--published,
.blog-editor-page__status--draft,
.blog-editor-page__status--pending {
  background: #f0fdf4;
  color: #15803d;
}

.blog-editor-page__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 9px;
  border-top: 1px solid #eef2f7;
  padding-top: 18px;
}

.blog-editor-page__cancel,
.blog-editor-page__draft,
.blog-editor-page__submit {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
}

.blog-editor-page__cancel,
.blog-editor-page__draft {
  border: 1px solid #dbe3ef;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.blog-editor-page__submit {
  border: 1px solid var(--bg-brand);
  background: var(--bg-brand);
  color: #ffffff;
}

.blog-editor-page__draft:disabled,
.blog-editor-page__submit:disabled {
  cursor: wait;
  opacity: 0.65;
}

@media (min-width: 720px) {
  .blog-editor-page__form {
    padding: 24px;
  }

  .blog-editor-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
