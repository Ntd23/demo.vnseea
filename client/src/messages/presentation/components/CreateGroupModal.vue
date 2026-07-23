<!-- Description: Renders the create-group modal with phtml-style member search, selected participants, and optional avatar upload. -->
<template>
  <UModal v-model:open="openModel" :title="$t('pages.messagesPage.groupCreateTitle')" :ui="{ content: 'sm:max-w-[720px]' }">
    <template #body>
      <div class="space-y-5">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          icon="i-ph-warning-circle-bold"
          :description="errorMessage"
          class="rounded-[18px]"
        />

        <div class="space-y-2">
          <label class="text-sm font-semibold text-[var(--text-primary)]">
            {{ $t("pages.messagesPage.groupCreateNameLabel") }}
          </label>
          <UInput
            v-model="nameModel"
            :placeholder="$t('pages.messagesPage.groupNamePlaceholder')"
            size="lg"
            class="w-full"
          />
        </div>

        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <label class="text-sm font-semibold text-[var(--text-primary)]">
                {{ $t("pages.messagesPage.groupCreateParticipantsLabel") }}
              </label>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-semibold">
                {{ $t("pages.messagesPage.groupCreateSelectedCount", { count: selectedCandidates.length }) }}
              </UBadge>
            </div>

            <UInput
              v-model="queryModel"
              icon="i-ph-magnifying-glass-bold"
              size="lg"
              class="w-full"
              :placeholder="$t('pages.messagesPage.groupCreateParticipantsPlaceholder')"
            />

            <div class="rounded-[20px] border border-[var(--border-light)] bg-white">
              <div v-if="searchPending" class="space-y-2 p-3">
                <USkeleton v-for="item in 4" :key="item" class="h-[58px] rounded-[16px]" />
              </div>

              <div v-else-if="queryModel.trim().length === 0" class="p-4 text-sm text-[var(--text-secondary)]">
                {{ $t("pages.messagesPage.groupCreateSearchIdle") }}
              </div>

              <div v-else-if="candidates.length === 0" class="p-4 text-sm text-[var(--text-secondary)]">
                {{ $t("pages.messagesPage.groupCreateNoParticipantsFound") }}
              </div>

              <div v-else class="max-h-[260px] overflow-y-auto p-2">
                <button
                  v-for="candidate in candidates"
                  :key="candidate.userId"
                  type="button"
                  class="messages-group-create__candidate"
                  @click="emit('select-candidate', candidate)"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <UAvatar :src="candidate.avatarUrl" size="md" class="rounded-full" />
                    <div class="min-w-0 text-left">
                      <p class="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {{ candidate.name }}
                      </p>
                      <p v-if="candidate.username" class="truncate text-xs text-[var(--text-secondary)]">
                        @{{ candidate.username }}
                      </p>
                    </div>
                  </div>

                  <UBadge color="primary" variant="soft" class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]">
                    {{ $t("pages.messagesPage.groupCreateAddParticipant") }}
                  </UBadge>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ $t("pages.messagesPage.groupCreateSelectedLabel") }}
                </span>
                <span class="text-xs text-[var(--text-secondary)]">
                  {{ selectedCandidates.length }}
                </span>
              </div>

              <div class="messages-group-create__selected">
                <div
                  v-for="candidate in selectedCandidates"
                  :key="candidate.userId"
                  class="messages-group-create__selected-item"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <UAvatar :src="candidate.avatarUrl" size="sm" class="rounded-full" />
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {{ candidate.name }}
                      </p>
                      <p v-if="candidate.username" class="truncate text-xs text-[var(--text-secondary)]">
                        @{{ candidate.username }}
                      </p>
                    </div>
                  </div>

                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    icon="i-ph-x-bold"
                    class="rounded-full"
                    :aria-label="$t('pages.messagesPage.groupCreateRemoveParticipant')"
                    @click="emit('remove-candidate', candidate.userId)"
                  />
                </div>

                <p v-if="selectedCandidates.length === 0" class="p-4 text-sm text-[var(--text-secondary)]">
                  {{ $t("pages.messagesPage.groupCreateNoParticipantsSelected") }}
                </p>
              </div>
            </div>
          </section>

          <section class="flex flex-col items-center justify-center space-y-3 bg-[var(--bg-muted)]/30 rounded-[24px] p-5 border border-[var(--border-light)]">
            <label class="text-sm font-bold text-[var(--text-primary)]">
              {{ $t("pages.messagesPage.groupCreateAvatarLabel") }}
            </label>

            <div class="messages-group-create__avatar-container">
              <div
                class="messages-group-create__avatar-preview-circle group"
                @click="triggerFileInput"
              >
                <img
                  v-if="avatarPreviewUrl"
                  :src="avatarPreviewUrl"
                  :alt="$t('pages.messagesPage.groupCreateAvatarLabel')"
                  class="h-full w-full object-cover"
                >
                <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center text-[var(--text-secondary)]">
                  <Icon name="i-ph-camera-bold" class="h-6 w-6 text-[var(--text-tertiary)] group-hover:text-primary-500 transition-colors" />
                  <span class="text-[11px] font-bold uppercase tracking-[0.05em] select-none">{{ $t("pages.messagesPage.groupCreateAvatarUploadLabel") }}</span>
                </div>
                <!-- Hover overlay -->
                <div class="messages-group-create__avatar-overlay">
                  <Icon name="i-ph-pencil-simple-bold" class="h-6 w-6" />
                </div>
              </div>

              <!-- Hidden input file -->
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,image/gif,image/bmp"
                @change="onFileChange"
              >

              <p class="mt-4 text-center text-xs text-[var(--text-secondary)] leading-relaxed max-w-[200px]">
                {{ $t("pages.messagesPage.groupCreateAvatarDescription") }}
              </p>
            </div>
          </section>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-3">
        <UButton
          variant="soft"
          color="neutral"
          class="rounded-full px-4 font-semibold"
          @click="openModel = false"
        >
          {{ $t("pages.messagesPage.cancel") }}
        </UButton>
        <UButton
          class="rounded-full px-5 font-semibold"
          :loading="pending"
          :disabled="pending"
          @click="emit('submit')"
        >
          {{ $t("pages.messagesPage.groupCreateSubmit") }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { MessageGroupCreateCandidate } from "../../domain/types/messages.types"

const openModel = defineModel<boolean>("open", {
  required: true,
  default: false,
})

const nameModel = defineModel<string>("name", {
  required: true,
  default: "",
})

const queryModel = defineModel<string>("query", {
  required: true,
  default: "",
})

const avatarModel = defineModel<File | null>("avatar", {
  required: true,
  default: null,
})

defineProps<{
  avatarPreviewUrl: string
  candidates: MessageGroupCreateCandidate[]
  errorMessage: string
  pending: boolean
  searchPending: boolean
  selectedCandidates: MessageGroupCreateCandidate[]
}>()

const emit = defineEmits<{
  "remove-candidate": [userId: number]
  "select-candidate": [candidate: MessageGroupCreateCandidate]
  submit: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (file) {
    avatarModel.value = file
  }
}
</script>

<style scoped>
.messages-group-create__candidate {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  padding: 12px;
  transition: background-color var(--duration-fast) var(--ease-default);
}

.messages-group-create__candidate:hover {
  background: var(--bg-muted);
}

.messages-group-create__selected {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  background: var(--bg-surface);
}

.messages-group-create__selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
}

.messages-group-create__selected-item:last-child {
  border-bottom: 0;
}

.messages-group-create__avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.messages-group-create__avatar-preview-circle {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 2px dashed var(--border-default);
  background: var(--bg-muted);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.messages-group-create__avatar-preview-circle:hover {
  border-color: var(--color-primary-500);
  background: var(--bg-surface-hover);
}

.messages-group-create__avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 50%;
  transition: opacity 0.2s ease;
}

.messages-group-create__avatar-preview-circle:hover .messages-group-create__avatar-overlay {
  opacity: 1;
}
</style>
