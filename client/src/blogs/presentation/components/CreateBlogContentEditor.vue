<template>
  <div class="create-blog-content-editor">
    <div class="create-blog-content-editor__toolbar">
      <span class="create-blog-content-editor__label">{{ $t("pages.createBlogPage.contentLabel") }}</span>
      <!-- <div class="create-blog-content-editor__actions">
        <button
          v-for="action in editorTools"
          :key="action.key"
          class="create-blog-content-editor__tool"
          :class="{ 'create-blog-content-editor__tool--active': action.isActive() }"
          type="button"
          :disabled="!isEditorReady"
          @click="action.run()"
        >
          <Icon :name="action.icon" class="h-3.5 w-3.5" />
          {{ action.label }}
        </button>
      </div> -->
    </div>

    <div class="create-blog-content-editor__surface">
      <ClientOnly>
        <TiptapEditorContent
          v-if="editor"
          :editor="editor"
        />
        <div v-else class="create-blog-content-editor__loading" />
        <template #fallback>
          <div class="create-blog-content-editor__loading" />
        </template>
      </ClientOnly>
      <span v-if="isEditorEmpty" class="create-blog-content-editor__placeholder">
        {{ $t("pages.createBlogPage.contentPlaceholder") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TiptapEditorContent } from "#components"
import { useCreateBlogEditorVM } from "../../application/view-models/useCreateBlogEditorVM"

const content = defineModel<string>({ required: true })

const {
  editor,
  editorTools,
  isEditorReady,
  isEditorEmpty,
} = useCreateBlogEditorVM(content)
</script>

<style scoped>
.create-blog-content-editor {
  display: grid;
  gap: 10px;
}

.create-blog-content-editor__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create-blog-content-editor__label {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.create-blog-content-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.create-blog-content-editor__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  padding: 8px 11px;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.15s ease;
}

.create-blog-content-editor__tool:hover,
.create-blog-content-editor__tool--active {
  border-color: rgba(0, 0, 255, 0.14);
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

.create-blog-content-editor__tool:disabled {
  cursor: wait;
  opacity: 0.6;
}

.create-blog-content-editor__surface {
  position: relative;
  min-height: 320px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fafbfe;
  color: #0f172a;
  transition: all 0.15s ease;
}

.create-blog-content-editor__surface:focus-within {
  border-color: rgba(0, 0, 255, 0.25);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.06);
}

.create-blog-content-editor__placeholder {
  pointer-events: none;
  position: absolute;
  left: 16px;
  top: 16px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 600;
}

.create-blog-content-editor__loading {
  min-height: 320px;
}

.create-blog-content-editor__surface :deep(.ProseMirror) {
  min-height: 320px;
  padding: 16px;
  outline: none;
  font-size: 15px;
  line-height: 1.8;
}

.create-blog-content-editor__surface :deep(.ProseMirror > *:first-child) {
  margin-top: 0;
}

.create-blog-content-editor__surface :deep(.ProseMirror > *:last-child) {
  margin-bottom: 0;
}

.create-blog-content-editor__surface :deep(h2),
.create-blog-content-editor__surface :deep(h3) {
  color: #0f172a;
  font-weight: 850;
  line-height: 1.25;
}

.create-blog-content-editor__surface :deep(h2) {
  font-size: 24px;
}

.create-blog-content-editor__surface :deep(h3) {
  font-size: 20px;
}

.create-blog-content-editor__surface :deep(blockquote) {
  margin-left: 0;
  border-left: 4px solid rgba(0, 0, 255, 0.24);
  color: #475569;
  padding-left: 14px;
}

.create-blog-content-editor__surface :deep(ul),
.create-blog-content-editor__surface :deep(ol) {
  padding-left: 22px;
}

@media (min-width: 768px) {
  .create-blog-content-editor__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
