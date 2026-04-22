<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/42 px-3 py-4 backdrop-blur-[2px] sm:items-center" @click.self="$emit('close')">
      <form class="w-full max-w-[620px] rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">{{ t("pages.forumPage.modalEyebrow") }}</p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.forumPage.modalTitle") }}</h2>
            <p class="mt-1 text-body-secondary">{{ t("pages.forumPage.modalDescription") }}</p>
          </div>
          <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]" type="button" @click="$emit('close')">
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 grid gap-4">
          <label>
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.forumPage.modalTitleLabel") }}</span>
            <input v-model="form.title" required class="forum-input mt-2" :placeholder="t('pages.forumPage.modalTitlePlaceholder')">
          </label>
          <label>
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.forumPage.modalSectionLabel") }}</span>
            <select v-model="form.section" class="forum-input mt-2">
              <option v-for="section in sections.filter(item => item.value !== 'all')" :key="section.value" :value="section.value">{{ section.label }}</option>
            </select>
          </label>
          <label>
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.forumPage.modalMessageLabel") }}</span>
            <textarea v-model="form.message" required class="forum-input mt-2 min-h-[150px] resize-y py-3" :placeholder="t('pages.forumPage.modalMessagePlaceholder')" />
          </label>
        </div>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button class="h-11 rounded-[18px] border border-[var(--border-default)] bg-white px-5 text-[13px] font-bold text-[var(--text-secondary)]" type="button" @click="$emit('close')">{{ t("pages.forumPage.modalClose") }}</button>
          <button class="h-11 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="submit">{{ t("pages.forumPage.modalSubmit") }}</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ForumSection, ForumThreadPayload } from "~/composables/useMockForumData"

const props = defineProps<{
  open: boolean
  sections: ReadonlyArray<ForumSection>
}>()

const { t } = useI18n()
const emit = defineEmits<{ close: []; create: [payload: ForumThreadPayload] }>()

const form = reactive<ForumThreadPayload>({
  title: "",
  section: "support",
  message: "",
})

watch(() => props.open, (open) => {
  if (!open) return
  form.title = ""
  form.section = "support"
  form.message = ""
})

const submit = () => {
  emit("create", { ...form })
}
</script>

<style scoped>
.forum-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-hover);
  padding-left: 14px;
  padding-right: 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  outline: none;
}
</style>
