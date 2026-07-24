<!-- English description: Blog creation and editing page using standard Nuxt UI components and design tokens. -->
<template>
  <div class="blog-editor-page max-w-[920px] mx-auto py-4 pb-11 px-4 sm:px-0">
    <header class="mb-4">
      <NuxtLink :to="appRoutes.blogs" class="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--bg-brand)] transition-colors mb-3">
        <Icon name="i-ph-arrow-left-bold" class="h-4 w-4" />
        <span>{{ $t("pages.createBlogPage.backToBlogs") }}</span>
      </NuxtLink>
    </header>

    <div v-if="isLoadingArticle" class="flex min-h-[220px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 text-sm font-bold text-[var(--text-secondary)] shadow-[var(--shadow-sm)]" role="status">
      <Icon name="i-ph-circle-notch-bold" class="h-5 w-5 animate-spin text-[var(--bg-brand)]" />
      <span>{{ $t("pages.createBlogPage.loadingArticle") }}</span>
    </div>

    <form v-else class="space-y-5 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-[var(--shadow-sm)]" @submit.prevent="publishBlog">
      <UFormField name="title" :label="$t('pages.createBlogPage.titleLabel')" required class="w-full">
        <UInput
          v-model="title"
          type="text"
          maxlength="120"
          :placeholder="$t('pages.createBlogPage.titlePlaceholder')"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField name="summary" :label="$t('pages.createBlogPage.summaryLabel')" :hint="`${descriptionInput.length}/290`" class="w-full">
        <UTextarea
          v-model="descriptionInput"
          :rows="3"
          maxlength="290"
          :placeholder="$t('pages.createBlogPage.summaryPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField name="category" :label="$t('pages.createBlogPage.categoryLabel')" required class="w-full">
          <USelect
            v-model="category"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
          />
        </UFormField>

        <UFormField name="tags" :label="$t('pages.createBlogPage.tagsLabel')" class="w-full">
          <UInput
            v-model="tagsInput"
            type="text"
            :placeholder="$t('pages.createBlogPage.tagsPlaceholder')"
            size="xl"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField name="thumbnail" :label="$t('pages.createBlogPage.thumbnailLabel')" :hint="thumbnailName || $t('pages.createBlogPage.thumbnailFormats')" class="w-full">
        <div v-if="thumbnailPreviewUrl" class="mb-3 relative block w-full max-w-[520px] aspect-video overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)]">
          <img
            :src="thumbnailPreviewUrl"
            :alt="title || $t('pages.createBlogPage.imagePreview')"
            class="h-full w-full object-cover"
          />
        </div>
        <UFileUpload
          v-model="fileUploadValue"
          accept="image/png,image/jpeg,image/webp"
          layout="list"
          highlight
          class="w-full"
        />
      </UFormField>

      <UFormField name="content" :label="$t('pages.createBlogPage.contentLabel')" required class="w-full">
        <UTextarea
          v-model="content"
          :rows="12"
          :placeholder="$t('pages.createBlogPage.contentPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UAlert
        v-if="submitMessage"
        :color="submitState === 'error' ? 'error' : 'success'"
        variant="soft"
        :icon="submitStatusIcon"
        :description="submitMessage"
        class="rounded-xl"
      />

      <footer class="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
        <UButton :to="appRoutes.blogs" color="neutral" variant="ghost" size="lg" class="rounded-full">
          {{ $t("pages.createBlogPage.cancel") }}
        </UButton>
        <UButton
          v-if="!isEditing"
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="rounded-full font-bold"
          icon="i-ph-floppy-disk-bold"
          :loading="submitState === 'saving'"
          :disabled="isSubmitting"
          @click="saveDraft"
        >
          {{ $t("pages.createBlogPage.saveDraft") }}
        </UButton>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          class="rounded-full px-6 font-bold"
          :icon="isEditing ? 'i-ph-check-bold' : 'i-ph-paper-plane-tilt-fill'"
          :loading="submitState === 'publishing'"
          :disabled="isSubmitting"
        >
          {{ $t(isEditing ? "pages.createBlogPage.update" : "pages.createBlogPage.publish") }}
        </UButton>
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
  setThumbnailFile,
  saveDraft,
  publishBlog,
  loadArticleForEditing,
} = useCreateBlogPageVM(undefined, props.editBlogId)

const fileUploadValue = ref<File | File[] | null>(null)

watch(fileUploadValue, (val) => {
  const file = Array.isArray(val) ? val[0] : val
  setThumbnailFile(file ?? null)
})

onMounted(loadArticleForEditing)
</script>


