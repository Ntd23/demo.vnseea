<!-- Description: Renders the password confirmation form for deleting a community group. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    :title="$t('community.groupSettings.delete.title')"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <div class="group-delete">
      <label for="group-delete-password">{{ $t("community.groupSettings.delete.passwordLabel") }}</label>
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
          {{ $t('community.groupSettings.delete.deleteBtn') }}
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

const { t } = useI18n()
const password = ref("")
const isDeleting = ref(false)

async function handleDelete() {
  if (!password.value) {
    return
  }

  if (!window.confirm(t("community.groupSettings.delete.confirmDialog"))) {
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
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.group-delete__input {
  border: 1px solid var(--border-light); background: var(--bg-surface);
  border-radius: 10px;
  color: var(--text-primary);
  height: 56px;
  outline: none;
  padding: 0 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}

.group-delete__input:focus {
  border-color: var(--bg-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.group-delete__actions {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.group-delete__button {
  border-radius: 8px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--bg-brand) 24%, transparent);
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
