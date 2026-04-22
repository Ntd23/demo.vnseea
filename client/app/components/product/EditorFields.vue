  <UCard
    class="surface-card group/editor ring-1 ring-secondary-100 shadow-2xl bg-white transition-all duration-500 hover:shadow-3xl"
    :ui="{ body: { padding: 'p-8 sm:p-12' }, base: 'overflow-hidden' }"
  >
    <div class="space-y-12">
      <!-- Title & Price Section -->
      <div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.titleLabel') }}
          </template>
          <UInput
            v-model="title"
            size="xl"
            icon="i-ph-text-aa-duotone"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-xl font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all pl-16 px-8',
              icon: { leading: { wrapper: 'left-6', base: 'h-6 w-6 text-primary-500' } }
            }"
            :placeholder="$t('pages.productEditor.titleLabel')"
          />
        </UFormField>

        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.priceLabel') }}
          </template>
          <UInputNumber
            v-model="priceValue"
            size="xl"
            orientation="vertical"
            :min="0"
            :step="0.01"
            placeholder="0.00"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-xl font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8'
            }"
          />
        </UFormField>
      </div>

      <!-- Description Section -->
      <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
        <template #label>
          {{ descriptionLabel || $t('pages.productEditor.descriptionLabel') }}
        </template>
        <UTextarea
          v-model="description"
          :rows="6"
          :placeholder="$t('pages.productEditor.descriptionPlaceholder')"
          class="w-full"
          :ui="{ 
            rounded: 'rounded-[2.5rem]', 
            base: 'min-h-[220px] bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-10 py-8 text-lg font-medium leading-relaxed italic'
          }"
        />
      </UFormField>

      <!-- Category & Condition Section -->
      <div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.categoryLabel') }}
          </template>
          <USelect
            v-model="category"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-lg font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8'
            }"
          />
        </UFormField>

        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.conditionLabel') }}
          </template>
          <USelect
            v-model="condition"
            :items="conditionOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-lg font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8'
            }"
          />
        </UFormField>
      </div>

      <!-- Location & Currency Section -->
      <div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.locationLabel') }}
          </template>
          <UInput
            v-model="location"
            size="xl"
            icon="i-ph-map-pin-duotone"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-lg font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all pl-16 px-8',
              icon: { leading: { wrapper: 'left-6', base: 'h-6 w-6 text-primary-500' } }
            }"
            :placeholder="$t('pages.productEditor.locationPlaceholder')"
          />
        </UFormField>

        <UFormField class="space-y-4" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.currencyLabel') }}
          </template>
          <USelect
            v-model="currency"
            :items="currencyOptions"
            value-key="value"
            label-key="label"
            size="xl"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-lg font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8'
            }"
          />
        </UFormField>
      </div>

      <!-- Stock & Status Section -->
      <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between pt-10 border-t border-secondary-50">
        <UFormField class="space-y-4 w-full md:max-w-[280px]" :ui="{ label: { base: 'text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-3 block pl-1' } }">
          <template #label>
            {{ $t('pages.productEditor.stockLabel') }}
          </template>
          <UInputNumber
            v-model="stockValue"
            size="xl"
            orientation="vertical"
            :min="0"
            :step="1"
            class="w-full"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'h-18 lg:h-20 text-xl font-bold bg-secondary-50/30 border-none ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8'
            }"
          />
        </UFormField>

        <div class="flex items-center gap-6">
          <div class="flex flex-col items-end gap-2">
            <span class="text-[9px] font-black uppercase tracking-[0.4em] text-secondary-400 pl-1">{{ $t('pages.productEditor.mediaStatusLabel') || 'Media Files' }}</span>
            <UBadge
              variant="soft"
              size="lg"
              class="rounded-2xl px-6 font-black uppercase tracking-widest h-12 bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm flex items-center justify-center min-w-[160px]"
            >
              <template #leading>
                <Icon name="i-ph-images-duotone" class="h-5 w-5 mr-3" />
              </template>
              {{ mediaSummary }}
            </UBadge>
          </div>
        </div>
      </div>

      <UAlert
        class="rounded-[2.5rem] p-8 border border-primary-200 bg-primary-50/50 shadow-sm"
        color="primary"
        variant="soft"
        icon="i-ph-info-duotone"
        :description="$t('pages.productEditor.descriptionPlaceholder')"
        :ui="{ 
          title: 'text-sm font-black text-primary-900 uppercase tracking-widest',
          description: 'text-sm font-medium text-primary-700 leading-relaxed mt-2 italic',
          icon: 'h-7 w-7 text-primary-600'
        }"
      />

      <div class="pt-4">
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
