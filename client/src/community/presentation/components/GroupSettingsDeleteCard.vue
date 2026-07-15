<!-- Description: Renders the password confirmation form for deleting a community group. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    title="Xóa nhóm"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <div class="group-delete">
      <label for="group-delete-password">Mật khẩu</label>
      <input
        id="group-delete-password"
        v-model="password"
        type="password"
        class="group-delete__input"
        autocomplete="current-password"
      >

      <div class="group-delete__actions">
        <UButton
          type="button"
          color="warning"
          variant="solid"
          size="lg"
          class="btn-danger"
          :loading="isDeleting"
          :disabled="isDeleting || !password"
          @click="handleDelete"
        >
          <template #leading>
            <Icon name="i-ph-trash-bold" class="h-4 w-4" />
          </template>
          Xóa bỏ
        </UButton>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"

const emit = defineEmits<{
  delete: [password: string]
}>()

const password = ref("")
const isDeleting = ref(false)

async function handleDelete() {
  if (!password.value) {
    return
  }

  if (!window.confirm("Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác.")) {
    return
  }

  isDeleting.value = true
  try {
    emit("delete", password.value)
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.group-delete {
  display: grid;
  gap: 18px;
}

.group-delete label {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.group-delete__input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #334155;
  height: 56px;
  outline: none;
  padding: 0 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}

.group-delete__input:focus {
  border-color: #0000ff;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.08);
}

.group-delete__actions {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.group-delete__button {
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 255, 0.24);
  font-size: 15px;
  font-weight: 800;
  height: 38px;
  min-width: 150px;
  padding: 0 24px;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.group-delete__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.group-delete__button:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}
</style>
