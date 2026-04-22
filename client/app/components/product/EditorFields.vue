  <UCard
    class="surface-card ring-1 ring-secondary-100 shadow-xl"
    :ui="{ body: { padding: 'p-6 sm:p-8' } }"
  >
    <div class="space-y-10">
      <!-- Title & Price Section -->
      <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.titleLabel') }}</span>
          </template>
          <UInput
            v-model="title"
            size="xl"
            color="primary"
            variant="outline"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-lg font-bold' }"
            :placeholder="$t('pages.productEditor.titleLabel')"
          />
        </UFormField>

        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.priceLabel') }}</span>
          </template>
          <UInputNumber
            v-model="priceValue"
            size="xl"
            orientation="vertical"
            :min="0"
            :step="0.01"
            placeholder="0.00"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-lg font-bold' }"
          />
        </UFormField>
      </div>

      <!-- Description Section -->
      <UFormField size="md" class="space-y-3">
        <template #label>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ descriptionLabel || $t('pages.productEditor.descriptionLabel') }}</span>
        </template>
        <UTextarea
          v-model="description"
          autoresize
          :rows="6"
          :placeholder="$t('pages.productEditor.descriptionPlaceholder')"
          class="w-full"
          :ui="{ base: 'min-h-[180px] rounded-2xl px-6 py-5 text-base font-medium leading-relaxed' }"
        />
      </UFormField>

      <!-- Category & Condition Section -->
      <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.categoryLabel') }}</span>
          </template>
          <USelect
            v-model="category"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-base font-bold' }"
          />
        </UFormField>

        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.conditionLabel') }}</span>
          </template>
          <USelect
            v-model="condition"
            :items="conditionOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-base font-bold' }"
          />
        </UFormField>
      </div>

      <!-- Location & Currency Section -->
      <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.locationLabel') }}</span>
          </template>
          <UInput
            v-model="location"
            size="xl"
            color="primary"
            variant="outline"
            icon="i-ph-map-pin-duotone"
            :placeholder="$t('pages.productEditor.locationPlaceholder')"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-base font-bold' }"
          />
        </UFormField>

        <UFormField size="md" class="space-y-3">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.currencyLabel') }}</span>
          </template>
          <USelect
            v-model="currency"
            :items="currencyOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-base font-bold' }"
          />
        </UFormField>
      </div>

      <!-- Stock & Status Section -->
      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between pt-6 border-t border-secondary-100">
        <UFormField size="md" class="space-y-3 w-full md:max-w-[240px]">
          <template #label>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 pl-1">{{ $t('pages.productEditor.stockLabel') }}</span>
          </template>
          <UInputNumber
            v-model="stockValue"
            size="xl"
            orientation="vertical"
            :min="0"
            :step="1"
            class="w-full"
            :ui="{ base: 'h-16 rounded-2xl px-6 text-lg font-bold' }"
          />
        </UFormField>

        <div class="flex items-center gap-4">
          <div class="flex flex-col items-end gap-1">
            <span class="text-[10px] font-black uppercase tracking-widest text-secondary-400">{{ $t('pages.productEditor.mediaStatusLabel') || 'Media Files' }}</span>
            <UBadge color="primary" variant="soft" class="rounded-full px-5 py-2 text-xs font-black uppercase tracking-tighter ring-1 ring-primary-100">
              {{ mediaSummary }}
            </UBadge>
          </div>
        </div>
      </div>

      <UAlert
        class="rounded-3xl p-5 border border-primary-100"
        color="primary"
        variant="soft"
        icon="i-ph-info-duotone"
        :description="$t('pages.productEditor.descriptionPlaceholder')"
        :ui="{ 
          title: 'text-sm font-black text-primary-900',
          description: 'text-xs font-medium text-primary-700 leading-relaxed mt-1'
        }"
      />

      <div class="pt-2">
        <slot name="media" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type {
  CategoryValue,
  ConditionValue,
  CurrencyValue,
  ProductOption,
} from "../../../types/product-editor"

withDefaults(defineProps<{
  categoryOptions: ProductOption<CategoryValue>[]
  conditionOptions: ProductOption<ConditionValue>[]
  currencyOptions: ProductOption<CurrencyValue>[]
  mediaSummary: string
  descriptionLabel?: string
}>(), {
  descriptionLabel: undefined,
})

const title = defineModel<string>("title", { required: true })
const price = defineModel<string>("price", { required: true })
const description = defineModel<string>("description", { required: true })
const category = defineModel<CategoryValue>("category", { required: true })
const condition = defineModel<ConditionValue>("condition", { required: true })
const location = defineModel<string>("location", { required: true })
const currency = defineModel<CurrencyValue>("currency", { required: true })
const stock = defineModel<string>("stock", { required: true })

const priceValue = computed<number | undefined>({
  get: () => {
    const value = Number(price.value)
    return Number.isFinite(value) ? value : undefined
  },
  set: value => {
    price.value = value === undefined || value === null ? "" : String(value)
  },
})

const stockValue = computed<number | undefined>({
  get: () => {
    const value = Number(stock.value)
    return Number.isFinite(value) ? value : undefined
  },
  set: value => {
    stock.value = value === undefined || value === null ? "" : String(value)
  },
})
</script>
