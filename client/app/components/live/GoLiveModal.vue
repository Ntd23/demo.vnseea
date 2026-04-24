<template>
  <UModal v-model="isOpen" :ui="{ rounded: 'rounded-[32px]', width: 'max-w-xl' }">
    <div class="surface-card p-6 sm:p-8 overflow-hidden relative border-none ring-0">
      <!-- Background Glow -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-500),0.08),transparent_40%)]" />

      <div class="relative space-y-8">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
              {{ $t("pages.livePage.modalEyebrow") }}
            </p>
            <h2 class="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none">
              {{ $t("pages.livePage.modalTitle") }}
            </h2>
            <p class="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
              {{ $t("pages.livePage.modalDescription") }}
            </p>
          </div>
          <UButton
            color="white"
            variant="soft"
            icon="i-ph-x-bold"
            class="rounded-xl shadow-none ring-0 h-10 w-10 justify-center bg-secondary-50 text-[var(--text-primary)] hover:text-secondary-900"
            @click="isOpen = false"
          />
        </div>

        <UForm :state="form" class="space-y-6" @submit="submit">
          <div class="grid gap-6 sm:grid-cols-2">
            <UFormGroup :label="$t('pages.livePage.modalTitleLabel')" class="sm:col-span-2">
              <UInput
                v-model="form.title"
                size="xl"
                color="white"
                :placeholder="$t('pages.livePage.modalTitlePlaceholder')"
                class="rounded-2xl"
                :ui="{ base: 'bg-secondary-50/50 font-black tracking-wider uppercase text-[11px] h-12 shadow-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500' }"
                required
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.livePage.modalCategoryLabel')">
              <USelectMenu
                v-model="form.category"
                size="xl"
                :options="categories"
                class="rounded-2xl"
                :ui="{ trigger: 'bg-secondary-50/50 font-black tracking-wider uppercase text-[11px] h-12 shadow-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500' }"
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.livePage.modalPrivacyLabel')">
              <USelectMenu
                v-model="form.privacy"
                value-attribute="value"
                option-attribute="label"
                :options="[
                  { label: $t('pages.livePage.privacyPublic'), value: 'public' },
                  { label: $t('pages.livePage.privacyMembers'), value: 'members' },
                  { label: $t('pages.livePage.privacyPrivate'), value: 'private' }
                ]"
                size="xl"
                class="rounded-2xl"
                :ui="{ trigger: 'bg-secondary-50/50 font-black tracking-wider uppercase text-[11px] h-12 shadow-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500' }"
              />
            </UFormGroup>

            <UFormGroup :label="$t('pages.livePage.modalDescriptionLabel')" class="sm:col-span-2">
              <UTextarea
                v-model="form.description"
                size="xl"
                :rows="4"
                :placeholder="$t('pages.livePage.modalDescriptionPlaceholder')"
                class="rounded-2xl"
                :ui="{ base: 'bg-secondary-50/50 font-semibold text-[13px] shadow-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 resize-none' }"
              />
            </UFormGroup>
          </div>

          <UAlert
            v-if="submitted"
            icon="i-ph-check-circle-duotone"
            color="primary"
            variant="subtle"
            class="rounded-2xl border-none ring-1 ring-primary-100 font-extrabold text-[11px] uppercase tracking-widest py-4 px-6"
            :title="$t('pages.livePage.modalSuccess')"
          />

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
            <UButton
              variant="soft"
              color="white"
              size="xl"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-8 h-12 bg-white text-[var(--text-primary)] ring-1 ring-secondary-200 hover:ring-primary-500 transition-all shadow-sm"
              @click="isOpen = false"
            >
              {{ $t("pages.livePage.close") }}
            </UButton>
            <UButton
              type="submit"
              size="xl"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-10 h-12 shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 transition-all active:scale-95"
            >
              {{ $t("pages.livePage.startLive") }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { GoLivePayload } from "~/composables/useMockLiveData"

const isOpen = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  categories: ReadonlyArray<string>
}>()

const emit = defineEmits<{ create: [payload: GoLivePayload] }>()
const { t } = useI18n()

const submitted = ref(false)
const form = reactive<GoLivePayload>({
  title: "",
  category: props.categories[0] ?? t("pages.livePage.categoryCommunity"),
  privacy: "public",
  description: "",
})

const submit = () => {
  submitted.value = true
  emit("create", { ...form })
  // Auto close could be handled here or by parent
}

watch(isOpen, (val) => {
  if (val) submitted.value = false
})
</script>
