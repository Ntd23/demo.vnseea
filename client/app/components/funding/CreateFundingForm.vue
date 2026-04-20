<template>
  <form class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-lg)]" @submit.prevent="submit">
    <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.createFundingPage.formEyebrow") }}</p>
    <h1 class="mt-1 text-heading text-[var(--text-primary)]">{{ $t("pages.createFundingPage.formTitle") }}</h1>
    <p class="mt-1 text-body-secondary">{{ $t("pages.createFundingPage.formDescription") }}</p>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <label class="block sm:col-span-2">
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.createFundingPage.formTitleLabel") }}</span>
        <input v-model="form.title" required class="funding-input mt-2" :placeholder="$t('pages.createFundingPage.formTitlePlaceholder')">
      </label>
      <label class="block">
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.fundingPage.category") }}</span>
        <select v-model="form.category" class="funding-input mt-2">
          <option v-for="category in categories.filter(item => item.value !== 'all')" :key="category.value" :value="category.value">{{ category.label }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.createFundingPage.goalLabel") }}</span>
        <input v-model.number="form.goalAmount" required class="funding-input mt-2" min="1000000" type="number">
      </label>
      <label class="block sm:col-span-2">
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.createFundingPage.imageLabel") }}</span>
        <input class="funding-input mt-2 file:mr-3 file:rounded-[12px] file:border-0 file:bg-[var(--color-primary-50)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-[var(--color-primary-600)]" type="file" accept="image/*" @change="setImageName">
      </label>
      <label class="block sm:col-span-2">
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.createFundingPage.descriptionLabel") }}</span>
        <textarea v-model="form.description" required class="funding-input mt-2 min-h-[160px] resize-y py-3" :placeholder="$t('pages.createFundingPage.descriptionPlaceholder')" />
      </label>
    </div>

    <div v-if="created" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
      {{ $t("pages.createFundingPage.successMessage") }}
    </div>

    <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <NuxtLink to="/funding" class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)]">{{ $t("pages.createFundingPage.backButton") }}</NuxtLink>
      <button class="inline-flex h-11 items-center justify-center rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="submit">{{ $t("pages.createFundingPage.submitButton") }}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { FundingCategoryKey, FundingCreatePayload, FundingOption } from "~/composables/useMockFundingData"

defineProps<{ categories: ReadonlyArray<FundingOption<"all" | FundingCategoryKey>> }>()
const emit = defineEmits<{ create: [payload: FundingCreatePayload] }>()

const created = ref(false)
const form = reactive<FundingCreatePayload>({
  title: "",
  category: "community",
  goalAmount: 50000000,
  imageName: "",
  description: "",
})

const setImageName = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.imageName = input.files?.[0]?.name ?? ""
}

const submit = () => {
  created.value = true
  emit("create", { ...form })
}
</script>

<style scoped>
.funding-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--color-secondary-100);
  padding: 0 14px;
  color: var(--text-primary);
  outline: none;
}
</style>
