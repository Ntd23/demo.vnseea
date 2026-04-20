<template>
  <div class="space-y-5 pb-10">
    <ProductHeroBanner
      variant="create"
      :badge="$t('pages.newProductPage.badge')"
      :title="$t('pages.newProductPage.title')"
      :description="$t('pages.newProductPage.description')"
      :secondary-action-label="$t('pages.newProductPage.quickFill')"
      :stats="heroStats"
      @secondary-action="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.06fr)_360px]">
      <section class="space-y-5">
        <div class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                {{ $t("pages.productEditor.editSectionEyebrow") }}
              </p>
              <h2 class="mt-1 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63]">
                {{ $t("pages.newProductPage.sectionTitle") }}
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                {{ $t("pages.newProductPage.sectionDescription") }}
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-600">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4 text-[#0000ff]" />
              {{ completionText }}
            </div>
          </div>
        </div>

        <ProductEditorFields
          v-model:title="title"
          v-model:price="price"
          v-model:description="description"
          v-model:category="category"
          v-model:condition="condition"
          v-model:location="location"
          v-model:currency="currency"
          v-model:stock="stock"
          :description-label="$t('pages.productEditor.descriptionLabel')"
          :category-options="categoryOptions"
          :condition-options="conditionOptions"
          :currency-options="currencyOptions"
          :media-summary="mediaSummary"
        >
          <template #media>
            <ProductCreateMediaField
              :image-tiles="imageTiles"
              :image-button-label="imageButtonLabel"
              @add-image="cycleImageCount"
            />
          </template>
        </ProductEditorFields>

        <FormsSubmitBar
          :hint="$t('pages.newProductPage.submitHint')"
          :cta="$t('pages.newProductPage.submitCta')"
        />
      </section>

      <aside class="space-y-5">
        <ProductPreviewCard
          :preview-background="previewBackground"
          :preview-icon="previewIcon"
          :category-label="previewCategoryLabel"
          :condition-label="previewConditionLabel"
          :currency-label="previewCurrencyLabel"
          :title="title"
          :empty-title="$t('pages.newProductPage.emptyTitle')"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="location"
          :image-count="imageCount"
          leading-icon="i-ph-chat-circle-text-fill"
          trailing-icon="i-ph-shopping-cart-simple-fill"
          :status-label="$t('pages.newProductPage.statusReady')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          :title="$t('pages.newProductPage.tipsTitle')"
          :items="sellingTips"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CategoryValue,
  ConditionValue,
  CurrencyValue,
  ProductChecklistItem,
  ProductHeroStat,
  ProductTipItem,
} from "~/types/product-editor"

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.newProductPage.seoTitle"),
  description: () => t("pages.newProductPage.seoDescription"),
})

const {
  categoryOptions,
  conditionOptions,
  currencyOptions,
  categoryMeta,
  conditionMap,
  currencyMeta,
  formatProductPrice,
  formatProductStockLabel,
} = useProductEditorMeta()

const title = ref("")
const price = ref("")
const description = ref("")
const category = ref<CategoryValue>("vehicles")
const condition = ref<ConditionValue>("new")
const location = ref("")
const currency = ref<CurrencyValue>("USD")
const stock = ref("")
const imageCount = ref(1)

const imageTiles = computed(() =>
  Array.from({ length: imageCount.value }, (_, index) => ({
    name: `image-${index + 1}`,
  })),
)

const completionCount = computed(() =>
  [
    title.value.trim(),
    price.value.trim(),
    description.value.trim(),
    category.value,
    condition.value,
    location.value.trim(),
    stock.value.trim(),
    imageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => t("pages.productEditor.completionText", { count: completionCount.value }))

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: t("pages.newProductPage.statFilled"),
    value: `${completionCount.value}/8`,
    description: t("pages.newProductPage.statFilledDescription"),
  },
  {
    label: t("pages.newProductPage.statImages"),
    value: String(imageCount.value),
    description: t("pages.newProductPage.statImagesDescription"),
  },
  {
    label: t("pages.newProductPage.statCurrency"),
    value: currency.value,
    description: t("pages.newProductPage.statCurrencyDescription"),
  },
])

const previewBackground = computed(() => categoryMeta.value[category.value].background)
const previewIcon = computed(() => categoryMeta.value[category.value].icon)
const previewCategoryLabel = computed(() => categoryMeta.value[category.value].label)
const previewConditionLabel = computed(() => conditionMap.value[condition.value])
const previewCurrencyLabel = computed(() => currencyMeta[currency.value].label)
const previewDescription = computed(() =>
  description.value.trim()
    || t("pages.newProductPage.previewDescription"),
)

const previewPrice = computed(() => formatProductPrice(price.value, currency.value))
const stockLabel = computed(() => formatProductStockLabel(stock.value))

const mediaSummary = computed(() =>
  imageCount.value === 1
    ? t("pages.newProductPage.oneSampleImage")
    : t("pages.newProductPage.sampleImages", { count: imageCount.value }),
)

const imageButtonLabel = computed(() =>
  imageCount.value >= 10 ? t("pages.newProductPage.maxImages") : t("pages.newProductPage.addImage"),
)

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: t("pages.newProductPage.checkNamePrice"),
    description: t("pages.newProductPage.checkNamePriceDescription"),
    done: title.value.trim().length > 0 && Number(price.value) > 0,
  },
  {
    label: t("pages.newProductPage.checkDescription"),
    description: t("pages.newProductPage.checkDescriptionDescription"),
    done: description.value.trim().length >= 20,
  },
  {
    label: t("pages.newProductPage.checkCategory"),
    description: t("pages.newProductPage.checkCategoryDescription"),
    done: Boolean(category.value && condition.value && currency.value),
  },
  {
    label: t("pages.newProductPage.checkLocation"),
    description: t("pages.newProductPage.checkLocationDescription"),
    done: location.value.trim().length > 0 && Number(stock.value) > 0 && imageCount.value > 0,
  },
])

const sellingTips = computed<ProductTipItem[]>(() => [
  {
    title: t("pages.newProductPage.tipName"),
    description: t("pages.newProductPage.tipNameDescription"),
    icon: "i-ph-text-t-fill",
  },
  {
    title: t("pages.newProductPage.tipPrice"),
    description: t("pages.newProductPage.tipPriceDescription"),
    icon: "i-ph-currency-circle-dollar-fill",
  },
  {
    title: t("pages.newProductPage.tipImage"),
    description: t("pages.newProductPage.tipImageDescription"),
    icon: "i-ph-image-square-fill",
  },
])

const cycleImageCount = () => {
  imageCount.value = imageCount.value >= 10 ? 1 : imageCount.value + 1
}

const quickFillDemo = () => {
  title.value = t("pages.newProductPage.demoTitle")
  price.value = "1250"
  description.value = t("pages.newProductPage.demoDescription")
  category.value = "vehicles"
  condition.value = "new"
  location.value = t("pages.newProductPage.demoLocation")
  currency.value = "USD"
  stock.value = "2"
  imageCount.value = 4
}
</script>
