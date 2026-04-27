<template>
  <div class="space-y-5 pb-10">
    <BlogsPresentationCreateHero
      :stats="heroStats"
      @quick-fill="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
      <section class="space-y-5">
        <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-primary)]">
                {{ $t("pages.createBlogPage.editorEyebrow") }}
              </p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                {{ $t("pages.createBlogPage.contentTitle") }}
              </h2>
              <p class="mt-1 text-body-secondary">
                {{ $t("pages.createBlogPage.contentDescription") }}
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-2 text-[12px] font-bold text-[var(--text-primary)]">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4" />
              {{ completionText }}
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.titleLabel") }}</span>
            <input
              v-model="title"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.08rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              maxlength="120"
              :placeholder="$t('pages.createBlogPage.titlePlaceholder')"
              type="text"
            >
          </label>

          <div class="mt-7 space-y-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[1.02rem] font-black text-[var(--text-primary)]">
                {{ $t("pages.createBlogPage.contentLabel") }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="action in editorActions"
                  :key="action.label"
                  class="inline-flex h-9 items-center gap-1.5 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 text-[12px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  type="button"
                  @click="applyEditorToken(action.token)"
                >
                  <Icon :name="action.icon" class="h-3.5 w-3.5" />
                  {{ action.label }}
                </button>
              </div>
            </div>

            <textarea
              v-model="content"
              class="min-h-[280px] w-full resize-y rounded-[22px] border border-[var(--border-default)] bg-white px-5 py-5 text-[1rem] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              :placeholder="$t('pages.createBlogPage.contentPlaceholder')"
              rows="10"
            />
          </div>

          <div class="mt-7 grid gap-5 md:grid-cols-2">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.categoryLabel") }}</span>
              <select
                v-model="category"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              >
                <option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.tagsLabel") }}</span>
              <input
                v-model="tagsInput"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
                :placeholder="$t('pages.createBlogPage.tagsPlaceholder')"
                type="text"
              >
            </label>
          </div>

          <div class="mt-4 flex min-h-9 flex-wrap gap-2">
            <span
              v-for="tag in tagList"
              :key="tag"
              class="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)]"
            >
              #{{ tag }}
            </span>
            <span v-if="tagList.length === 0" class="text-caption-secondary">
              {{ $t("pages.createBlogPage.tagsHelp") }}
            </span>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.thumbnailLabel") }}</p>
            <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label
                class="group flex min-h-[170px] cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-hover)] p-4 text-center transition hover:bg-[var(--color-primary-50)]"
                for="blog-thumbnail"
              >
                <input
                  id="blog-thumbnail"
                  class="sr-only"
                  type="file"
                  accept="image/*"
                  @change="onThumbnailChange"
                >
                <span>
                  <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[var(--text-primary)] shadow-[var(--shadow-sm)]">
                    <Icon name="i-ph-image-square-fill" class="h-8 w-8" />
                  </span>
                  <span class="mt-3 block text-[13px] font-bold text-[var(--text-primary)]">
                    {{ $t("pages.createBlogPage.chooseThumbnail") }}
                  </span>
                  <span class="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                    {{ thumbnailName || $t("pages.createBlogPage.thumbnailFormats") }}
                  </span>
                </span>
              </label>

              <button
                class="relative min-h-[170px] overflow-hidden rounded-[22px] border border-[var(--border-default)] text-left shadow-[var(--shadow-sm)]"
                type="button"
                @click="cycleThumbnail"
              >
                <div class="absolute inset-0" :style="{ background: thumbnailBackground }" />
                <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.55)_100%)]" />
                <div class="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-white">
                  <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
                    {{ $t("pages.createBlogPage.previewLabel") }}
                  </p>
                  <p class="mt-2 text-[1.1rem] font-black leading-tight">
                    {{ title || $t("pages.createBlogPage.previewTitleFallback") }}
                  </p>
                  <p class="mt-2 text-[12px] text-white/78">
                    {{ $t("pages.createBlogPage.cycleBackground") }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-3 rounded-[28px] border border-[var(--border-default)] bg-white/90 p-4 shadow-[var(--shadow-md)] md:flex-row md:items-center md:justify-between">
          <p class="text-body-secondary">
            {{ submitMessage || $t("pages.createBlogPage.submitHint") }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[14px] font-bold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
              type="button"
              @click="saveDraft"
            >
              {{ $t("pages.createBlogPage.saveDraft") }}
            </button>
            <button
              class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
              type="button"
              @click="publishMock"
            >
              {{ $t("pages.createBlogPage.publish") }}
            </button>
          </div>
        </section>
      </section>

      <BlogsPresentationCreateSidebar
        :title="title"
        :thumbnail-background="thumbnailBackground"
        :selected-category-label="selectedCategoryLabel"
        :read-minutes="readMinutes"
        :tag-list="tagList"
        :preview-excerpt="previewExcerpt"
        :checklist-items="checklistItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreateBlogPage } from "../../application/composables/useCreateBlogPage"
import BlogsPresentationCreateHero from "../components/CreateBlogHero.vue"
import BlogsPresentationCreateSidebar from "../components/CreateBlogSidebar.vue"

const {
  title,
  content,
  category,
  tagsInput,
  thumbnailName,
  submitMessage,
  categoryOptions,
  editorActions,
  tagList,
  selectedCategoryLabel,
  thumbnailBackground,
  readMinutes,
  completionText,
  heroStats,
  previewExcerpt,
  checklistItems,
  applyEditorToken,
  cycleThumbnail,
  onThumbnailChange,
  saveDraft,
  publishMock,
  quickFillDemo,
} = useCreateBlogPage()
</script>
