<!-- English description: Provides the reusable message contact tag assignment and management modal. -->
<template>
  <UModal
    v-model:open="open"
    :title="$t('pages.messagesPage.tagModalTitle')"
    :ui="{ content: 'sm:max-w-[640px]', body: 'overflow-hidden' }"
  >
    <template #body>
      <div class="messages-tag-modal">
        <div class="messages-tag-modal__tabs">
          <button
            type="button"
            class="messages-tag-modal__tab"
            :class="{ 'messages-tag-modal__tab--active': activeTab === 'assign' }"
            @click="activeTab = 'assign'"
          >
            {{ $t("pages.messagesPage.tagAssignTab") }}
          </button>
          <button
            type="button"
            class="messages-tag-modal__tab"
            :class="{ 'messages-tag-modal__tab--active': activeTab === 'manage' }"
            @click="activeTab = 'manage'"
          >
            {{ $t("pages.messagesPage.tagManageTab") }}
          </button>
        </div>

        <section v-if="activeTab === 'assign'" class="messages-tag-modal__panel">
          <h3 class="messages-tag-modal__title">{{ $t("pages.messagesPage.tagListTitle") }}</h3>
          <UListbox
            :model-value="selectedIds"
            :items="labels"
            value-key="id"
            label-key="name"
            multiple
            size="lg"
            :disabled="pending"
            :ui="assignListboxUi"
            @update:model-value="handleSelectionUpdate"
          >
            <template #item-leading="{ item }">
              <span class="messages-tag-modal__dot" :style="{ backgroundColor: item.color }" />
            </template>
            <template #item-trailing="{ item }">
              <UButton
                :color="isTagSelected(item.id) ? 'neutral' : 'primary'"
                :variant="isTagSelected(item.id) ? 'soft' : 'solid'"
                size="sm"
                class="messages-tag-modal__assign"
                :disabled="pending"
                @pointerdown.stop
                @click.stop="toggleTag(item.id)"
              >
                {{ $t(isTagSelected(item.id) ? "pages.messagesPage.remove" : "pages.messagesPage.attach") }}
              </UButton>
            </template>
            <template #empty>
              <p class="messages-tag-modal__empty">{{ $t("pages.messagesPage.tagEmpty") }}</p>
            </template>
          </UListbox>
          <p class="messages-tag-modal__hint">{{ $t("pages.messagesPage.tagApplyHint") }}</p>
        </section>

        <section v-else class="messages-tag-modal__panel">
          <h3 class="messages-tag-modal__title">{{ $t("pages.messagesPage.tagListTitle") }}</h3>
          <UListbox
            :model-value="null"
            :items="labels"
            value-key="id"
            label-key="name"
            size="lg"
            :ui="manageListboxUi"
          >
            <template #item-leading="{ item }">
              <span class="messages-tag-modal__dot" :style="{ backgroundColor: item.color }" />
            </template>
            <template #item-trailing="{ item }">
              <UButton
                color="error"
                variant="soft"
                size="sm"
                class="messages-tag-modal__delete"
                :disabled="pending"
                @pointerdown.stop
                @click.stop="deleteTag(item.id)"
              >
                {{ $t("pages.messagesPage.delete") }}
              </UButton>
            </template>
            <template #empty>
              <p class="messages-tag-modal__empty">{{ $t("pages.messagesPage.tagEmpty") }}</p>
            </template>
          </UListbox>

          <div class="messages-tag-modal__create-section">
            <h3 class="messages-tag-modal__title">{{ $t("pages.messagesPage.tagCreateTitle") }}</h3>
            <UInput
              v-model="newTagName"
              class="w-full"
              :placeholder="$t('pages.messagesPage.tagCreatePlaceholder')"
              size="lg"
              :ui="{ base: 'rounded-lg' }"
              @keyup.enter="submitCreateTag"
            />
            <div class="messages-tag-modal__create-actions">
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="messages-tag-modal__color-trigger"
                  :aria-label="$t('pages.messagesPage.tagColorLabel')"
                  :title="$t('pages.messagesPage.tagColorLabel')"
                >
                  <span class="messages-tag-modal__color-swatch" :style="{ backgroundColor: newTagColor }" />
                </UButton>

                <template #content>
                  <div class="messages-tag-modal__color-picker">
                    <UColorPicker
                      v-model="newTagColor"
                      format="hex"
                      size="xl"
                      :ui="{
                        picker: 'gap-5',
                        selector: 'h-52 w-52',
                        selectorThumb: 'size-7 ring-[3px] shadow-md',
                        track: 'h-52 w-4',
                        trackThumb: 'size-7 -translate-x-[6px] ring-[3px] shadow-md',
                      }"
                    />
                    <output class="messages-tag-modal__color-value">{{ newTagColor }}</output>
                  </div>
                </template>
              </UPopover>
              <UButton
                size="lg"
                :loading="pending"
                :disabled="newTagName.trim().length === 0"
                @click="submitCreateTag"
              >
                {{ $t("pages.messagesPage.create") }}
              </UButton>
            </div>
            <p class="messages-tag-modal__hint">{{ $t("pages.messagesPage.tagManageHint") }}</p>
          </div>
        </section>

        <div class="messages-tag-modal__footer">
          <UButton color="neutral" variant="soft" size="lg" @click="open = false">
            {{ $t("pages.messagesPage.close") }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import UListbox from "@nuxt/ui/components/Listbox.vue"
import type { MessageUserTag } from "../../domain/types/messages.types"

const defaultTagColor = "#3b82f6"
const open = defineModel<boolean>("open", { default: false })
const props = defineProps<{
  labels: MessageUserTag[]
  selectedIds: number[]
  pending: boolean
  updateSelection: (value: number[]) => Promise<void> | void
  createTag: (input: { name: string, color: string }) => Promise<boolean>
  deleteTag: (tagId: number) => Promise<boolean>
}>()

const activeTab = ref<"assign" | "manage">("assign")
const newTagName = ref("")
const newTagColor = ref(defaultTagColor)
const assignListboxUi = {
  root: "rounded-xl border border-slate-200 ring-0 shadow-sm",
  content: "max-h-[min(20rem,45dvh)]",
  item: "min-h-12 px-3 py-2.5",
  itemLabel: "overflow-visible text-clip whitespace-normal break-words font-semibold",
  itemTrailingIcon: "hidden",
  empty: "p-0",
}
const manageListboxUi = {
  ...assignListboxUi,
  content: "max-h-[min(13rem,28dvh)]",
}

watch(open, (isOpen) => {
  if (isOpen) {
    activeTab.value = "assign"
  }
})

function handleSelectionUpdate(value: number[] | undefined) {
  return props.updateSelection(Array.isArray(value) ? value : [])
}

function isTagSelected(tagId: number) {
  return props.selectedIds.includes(tagId)
}

function toggleTag(tagId: number) {
  const nextSelection = isTagSelected(tagId)
    ? props.selectedIds.filter(id => id !== tagId)
    : [...props.selectedIds, tagId]

  return props.updateSelection(nextSelection)
}

async function submitCreateTag() {
  const name = newTagName.value.trim()

  if (!name) {
    return
  }

  const created = await props.createTag({ name, color: newTagColor.value })

  if (created) {
    newTagName.value = ""
    activeTab.value = "assign"
  }
}
</script>

<style scoped>
.messages-tag-modal {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.messages-tag-modal__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 3px solid #e5e7eb;
  margin: 0 0 20px;
}

.messages-tag-modal__tab {
  height: 44px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  border-bottom: 3px solid transparent;
  margin-bottom: -3px;
}

.messages-tag-modal__tab--active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.messages-tag-modal__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messages-tag-modal__title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 800;
}

.messages-tag-modal__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.messages-tag-modal__delete {
  min-width: 82px;
  justify-content: center;
}

.messages-tag-modal__assign {
  min-width: 68px;
  justify-content: center;
}

.messages-tag-modal__hint,
.messages-tag-modal__empty {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.messages-tag-modal__empty {
  padding: 8px 12px;
}

.messages-tag-modal__create-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
}

.messages-tag-modal__create-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.messages-tag-modal__color-trigger {
  width: 58px;
  height: 40px;
  justify-content: center;
}

.messages-tag-modal__color-swatch {
  display: block;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 6px;
}

.messages-tag-modal__color-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.messages-tag-modal__color-value {
  width: 100%;
  color: var(--text-secondary);
  font-size: var(--text-caption);
  text-align: center;
}

.messages-tag-modal__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 767.98px) {
  .messages-tag-modal__tab {
    font-size: 13px;
  }
}
</style>
