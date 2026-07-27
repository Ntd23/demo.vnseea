<!-- English description: Renders the phtml-compatible create and edit form for page offers. -->
<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: 'w-[calc(100vw-24px)] max-w-[800px] overflow-hidden p-0 sm:max-w-[800px]' }"
  >
    <template #content>
      <form class="offer-form" @submit.prevent="handleSubmit">
        <header class="offer-form__header">
          <div>
            <p class="offer-form__eyebrow">{{ t("offers.form.eyebrow") }}</p>
            <h2>{{ mode === "edit" ? t("offers.form.editTitle") : t("offers.form.createTitle") }}</h2>
          </div>
          <UButton type="button" color="neutral" variant="ghost" icon="i-ph-x-bold" class="rounded-full" @click="close" />
        </header>

        <div class="offer-form__body">
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-ph-warning-circle-fill"
            :title="t('offers.form.errorTitle')"
            :description="errorMessage"
            class="rounded-[16px]"
          />

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField :label="t('offers.form.discountType')" class="min-w-0 w-full">
              <USelect v-model="draft.discountType" :items="discountTypeOptions" value-key="value" label-key="label" class="w-full" />
            </UFormField>

            <UFormField v-if="showDiscountPercent" :label="t('offers.form.discountPercent')" class="min-w-0 w-full">
              <USelect v-model="draft.discountPercent" :items="percentOptions" value-key="value" label-key="label" class="w-full" />
            </UFormField>

            <UFormField v-if="showDiscountAmount" :label="t('offers.form.discountAmount')" class="col-span-1 min-w-0 sm:col-span-2">
              <UInput v-model="draft.discountAmount" inputmode="decimal" class="w-full" />
            </UFormField>

            <template v-if="showBuyGet">
              <UFormField :label="t('offers.form.buy')" class="min-w-0 w-full">
                <UInput v-model="draft.buy" inputmode="numeric" class="w-full" />
              </UFormField>
              <UFormField :label="t('offers.form.get')" class="min-w-0 w-full">
                <UInput v-model="draft.get" inputmode="numeric" class="w-full" />
              </UFormField>
            </template>

            <template v-if="showSpendGetOff">
              <UFormField :label="t('offers.form.spend')" class="min-w-0 w-full">
                <UInput v-model="draft.spend" inputmode="decimal" class="w-full" />
              </UFormField>
              <UFormField :label="t('offers.form.amountOff')" class="min-w-0 w-full">
                <UInput v-model="draft.amountOff" inputmode="decimal" class="w-full" />
              </UFormField>
            </template>

            <UFormField :label="t('offers.form.discountedItems')" :hint="t('offers.form.discountedItemsHint')" class="min-w-0 w-full">
              <UInput v-model="draft.discountedItems" maxlength="100" class="w-full" />
            </UFormField>

            <UFormField v-if="mode === 'create'" :label="t('offers.form.currency')" class="min-w-0 w-full">
              <UInput v-model="draft.currency" class="w-full" />
            </UFormField>

            <UFormField :label="t('offers.form.description')" class="col-span-1 min-w-0 sm:col-span-2">
              <UTextarea v-model="draft.description" :rows="4" class="w-full" />
            </UFormField>

            <template v-if="mode === 'create'">
              <UFormField :label="t('offers.form.expireDate')" class="min-w-0 w-full">
                <UInput v-model="draft.expireDate" type="date" class="w-full" />
              </UFormField>
              <UFormField :label="t('offers.form.expireTime')" class="min-w-0 w-full">
                <UInput v-model="draft.expireTime" type="time" class="w-full" />
              </UFormField>
              <UFormField :label="t('offers.form.thumbnail')" class="col-span-1 min-w-0 sm:col-span-2">
                <input class="offer-form__file w-full" type="file" accept="image/*" @change="handleFileChange">
              </UFormField>
            </template>
          </div>
        </div>

        <footer class="offer-form__footer">
          <UButton type="button" color="neutral" variant="soft" class="rounded-full" @click="close">
            {{ t("offers.form.cancel") }}
          </UButton>
          <UButton type="submit" color="primary" class="rounded-full" :loading="submitting">
            {{ mode === "edit" ? t("offers.form.save") : t("offers.form.publish") }}
          </UButton>
        </footer>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useOfferFormVM } from "../../application/view-models/useOfferFormVM"
import type { Offer } from "../../domain/types/offer.types"

const props = defineProps<{
  open: boolean
  pageId: number
  mode: "create" | "edit"
  offer?: Offer | null
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const isOpen = computed({
  get: () => props.open,
  set: value => emit("update:open", value),
})

const {
  draft,
  submitting,
  errorMessage,
  discountTypeOptions,
  percentOptions,
  showDiscountPercent,
  showDiscountAmount,
  showBuyGet,
  showSpendGetOff,
  submit,
} = useOfferFormVM({
  pageId: toRef(props, "pageId"),
  mode: toRef(props, "mode"),
  offer: toRef(props, "offer"),
  onSaved: async () => {
    emit("saved")
    close()
  },
})

function close() {
  emit("update:open", false)
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  draft.thumbnailFile = input.files?.[0] ?? null
}

async function handleSubmit() {
  await submit()
}
</script>

<style scoped>
.offer-form {
  display: flex;
  width: 100%;
  max-width: 100%;
  max-height: min(calc(100dvh - 24px), 820px);
  min-width: 0;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--bg-surface);
  padding: 22px;
}

.offer-form__header,
.offer-form__footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.offer-form__body {
  display: grid;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  gap: 18px;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 2px;
}

.offer-form__header h2 {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.offer-form__eyebrow {
  margin: 0;
  color: var(--bg-brand);
  font-size: 12px;
  font-weight: 800;
}

.offer-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.offer-form__field--full {
  grid-column: 1 / -1;
}

.offer-form__file {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 10px 12px;
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .offer-form {
    max-height: calc(100dvh - 24px);
    border-radius: 18px;
    padding: 18px;
  }

  .offer-form__footer {
    align-items: stretch;
  }

  .offer-form__footer > * {
    flex: 1 1 0;
  }
}
</style>
