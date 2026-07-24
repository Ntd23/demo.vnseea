<!-- Description: Renders the password confirmation form for deleting a community page. -->
<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.sidebar.delete.eyebrow')"
    :title="$t('community.pageSettings.sidebar.delete.title')"
    :description="$t('community.pageSettings.sidebar.delete.desc')"
    icon="i-ph-warning-octagon-bold"
    :translate-text="false"
  >
    <div class="flex flex-col gap-6 py-4">
      <div class="rounded-xl border border-[color-mix(in_srgb,var(--color-error)_16%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] p-4">
        <div class="flex gap-3">
          <Icon name="i-ph-warning-fill" class="h-5 w-5 text-[var(--text-danger)]" />
          <div class="flex-1">
            <p class="text-sm font-bold text-[var(--text-primary)]">
              {{ $t('community.pageSettings.delete.warning') || 'Hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi tiếp tục.' }}
            </p>
            <p class="mt-1 text-[13px] text-[var(--text-secondary)]">
              Để đảm bảo an toàn, vui lòng nhập mật khẩu của bạn để xác nhận.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-[13px] font-bold text-[var(--text-primary)]">Mật khẩu xác nhận</label>
          <div class="relative">
            <Icon name="i-ph-lock-bold" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn..."
              class="password-input"
            >
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            class="delete-button"
            :disabled="isDeleting || !password"
            @click="handleDelete"
          >
            <Icon :name="isDeleting ? 'i-ph-spinner-gap-bold' : 'i-ph-trash-bold'" class="mr-2 h-4 w-4" :class="{ 'animate-spin': isDeleting }" />
            {{ $t('community.pageSettings.delete.confirm') || 'Xác nhận xóa trang' }}
          </button>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { ref } from "vue"
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"

const props = defineProps<{
  pageId: number
  slug: string
>()

const emit = defineEmits<{
  delete: [id: number, password: string]
}>()

const password = ref("")
const isDeleting = ref(false)

async function handleDelete() {
  if (!password.value) return
  
  if (!confirm("Bạn có chắc chắn muốn xóa trang này không? Hành động này không thể hoàn tác.")) {
    return
  }

  isDeleting.value = true
  try {
    emit("delete", props.pageId, password.value)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.password-input {
  width: 100%;
  height: 44px;
  padding-left: 40px;
  padding-right: 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.password-input:focus {
  background: var(--bg-surface);
  border-color: var(--color-error);
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-error) 10%, transparent);
}

.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 999px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 800;
  background: var(--color-error);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  background: var(--bg-brand);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
