<template>
  <div class="space-y-5 pb-10">
    <ProductHeroBanner
      variant="edit"
      :badge="$t('pages.editProductPage.badge')"
      :title="$t('pages.editProductPage.title', { id: productId })"
      :description="$t('pages.editProductPage.description')"
      :secondary-action-label="$t('pages.editProductPage.restore')"
      :stats="heroStats"
      @secondary-action="restoreOriginal"
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
                {{ $t("pages.editProductPage.sectionTitle") }}
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                {{ $t("pages.editProductPage.sectionDescription") }}
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
          :category-options="categoryOptions"
          :condition-options="conditionOptions"
          :currency-options="currencyOptions"
          :media-summary="mediaSummary"
        >
          <template #media>
            <ProductEditMediaManager
              :current-images="currentImages"
              :removed-count="removedImages.length"
              :new-image-tiles="newImageTiles"
              :image-button-label="imageButtonLabel"
              @add-new-image="addNewImage"
              @remove-current-image="removeCurrentImage"
              @remove-new-image="removeNewImage"
            />
          </template>
        </ProductEditorFields>

        <FormsSubmitBar
          :hint="$t('pages.editProductPage.submitHint')"
          :cta="$t('pages.editProductPage.submitCta')"
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
          :empty-title="$t('pages.editProductPage.emptyTitle')"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="location"
          :image-count="totalImageCount"
          leading-icon="i-ph-pencil-simple-fill"
          trailing-icon="i-ph-floppy-disk-back-fill"
          :status-label="$t('pages.editProductPage.statusUpdated')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          :title="$t('pages.editProductPage.tipsTitle')"
          :items="editingTips"
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
  ProductCurrentImage,
  ProductHeroStat,
  ProductImageTile,
  ProductTipItem,
} from "~/types/product-editor"

type MockProduct = {
  title: string
  price: string
  description: string
  category: CategoryValue
  condition: ConditionValue
  location: string
  currency: CurrencyValue
  stock: string
  oldImages: ProductCurrentImage[]
  updatedAt: string
}

const props = defineProps<{
  productId: string
}>()

const { t } = useI18n()

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

const mockProducts: Record<string, MockProduct> = {
  "101": {
    title: t("pages.editProductPage.product101Title"),
    price: "1250",
    description: t("pages.editProductPage.product101Description"),
    category: "vehicles",
    condition: "like-new",
    location: t("pages.editProductPage.product101Location"),
    currency: "USD",
    stock: "2",
    oldImages: [{ id: "old-1" }, { id: "old-2" }, { id: "old-3" }],
    updatedAt: t("pages.editProductPage.updatedTwoHoursAgo"),
  },
  "202": {
    title: t("pages.editProductPage.product202Title"),
    price: "185",
    description: t("pages.editProductPage.product202Description"),
    category: "home",
    condition: "used",
    location: t("pages.editProductPage.product202Location"),
    currency: "USD",
    stock: "5",
    oldImages: [{ id: "old-1" }, { id: "old-2" }],
    updatedAt: t("pages.editProductPage.updatedYesterday"),
  },
}

const fallbackProduct: MockProduct = {
  title: t("pages.editProductPage.demoTitle"),
  price: "89",
  description: t("pages.editProductPage.demoDescription"),
  category: "tech",
  condition: "new",
  location: t("pages.editProductPage.demoLocation"),
  currency: "USD",
  stock: "3",
  oldImages: [{ id: "old-1" }, { id: "old-2" }],
  updatedAt: t("pages.editProductPage.updatedRecently"),
}

const title = ref("")
const price = ref("")
const description = ref("")
const category = ref<CategoryValue>("vehicles")
const condition = ref<ConditionValue>("new")
const location = ref("")
const currency = ref<CurrencyValue>("USD")
const stock = ref("")
const currentImages = ref<ProductCurrentImage[]>([])
const removedImages = ref<string[]>([])
const newImages = ref<ProductImageTile[]>([])

const activeProduct = computed(() => mockProducts[props.productId] ?? fallbackProduct)

const applyProduct = (product: MockProduct) => {
  title.value = product.title
  price.value = product.price
  description.value = product.description
  category.value = product.category
  condition.value = product.condition
  location.value = product.location
  currency.value = product.currency
  stock.value = product.stock
  currentImages.value = product.oldImages.map(image => ({ ...image }))
  removedImages.value = []
  newImages.value = []
}

watch(
  () => props.productId,
  () => {
    applyProduct(activeProduct.value)
  },
  { immediate: true },
)

const totalImageCount = computed(() => currentImages.value.length + newImages.value.length)

const completionCount = computed(() =>
  [
    title.value.trim(),
    price.value.trim(),
    description.value.trim(),
    category.value,
    condition.value,
    location.value.trim(),
    stock.value.trim(),
    totalImageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => t("pages.productEditor.completionText", { count: completionCount.value }))

const mediaSummary = computed(() => {
  if (totalImageCount.value === 0) return t("pages.editProductPage.noImages")
  return totalImageCount.value === 1
    ? t("pages.editProductPage.oneKeptImage")
    : t("pages.editProductPage.keptImages", { count: totalImageCount.value })
})

const newImageTiles = computed(() => newImages.value)

const imageButtonLabel = computed(() =>
  newImages.value.length >= 6 ? t("pages.editProductPage.maxNewImages") : t("pages.editProductPage.addNewImage"),
)

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: t("pages.editProductPage.statCompletion"),
    value: `${completionCount.value}/8`,
    description: t("pages.editProductPage.statCompletionDescription"),
  },
  {
    label: t("pages.editProductPage.statImagesLeft"),
    value: String(currentImages.value.length),
    description: t("pages.editProductPage.statImagesLeftDescription"),
  },
  {
    label: t("pages.editProductPage.statStatus"),
    value: activeProduct.value.updatedAt,
    description: t("pages.editProductPage.statStatusDescription"),
  },
])

const previewBackground = computed(() => categoryMeta.value[category.value].background)
const previewIcon = computed(() => categoryMeta.value[category.value].icon)
const previewCategoryLabel = computed(() => categoryMeta.value[category.value].label)
const previewConditionLabel = computed(() => conditionMap.value[condition.value])
const previewCurrencyLabel = computed(() => currencyMeta[currency.value].label)
const previewDescription = computed(() =>
  description.value.trim() || t("pages.editProductPage.previewDescription"),
)

const previewPrice = computed(() => formatProductPrice(price.value, currency.value))
const stockLabel = computed(() => formatProductStockLabel(stock.value))

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: t("pages.editProductPage.checkPrefill"),
    description: t("pages.editProductPage.checkPrefillDescription"),
    done: true,
  },
  {
    label: t("pages.editProductPage.checkMainContent"),
    description: t("pages.editProductPage.checkMainContentDescription"),
    done: title.value.trim().length > 0 && Number(price.value) > 0 && description.value.trim().length >= 20,
  },
  {
    label: t("pages.editProductPage.checkOldImages"),
    description: t("pages.editProductPage.checkOldImagesDescription"),
    done: removedImages.value.length >= 0,
  },
  {
    label: t("pages.editProductPage.checkReady"),
    description: t("pages.editProductPage.checkReadyDescription"),
    done: totalImageCount.value > 0 && completionCount.value >= 7,
  },
])

const editingTips = computed<ProductTipItem[]>(() => [
  {
    title: t("pages.editProductPage.tipSmallChanges"),
    description: t("pages.editProductPage.tipSmallChangesDescription"),
    icon: "i-ph-pencil-line-fill",
  },
  {
    title: t("pages.editProductPage.tipRemoveOld"),
    description: t("pages.editProductPage.tipRemoveOldDescription"),
    icon: "i-ph-trash-fill",
  },
  {
    title: t("pages.editProductPage.tipPreview"),
    description: t("pages.editProductPage.tipPreviewDescription"),
    icon: "i-ph-eye-fill",
  },
])

const addNewImage = () => {
  if (newImages.value.length >= 6) return
  newImages.value.push({ name: `new-image-${newImages.value.length + 1}` })
}

const removeCurrentImage = (imageId: string) => {
  currentImages.value = currentImages.value.filter(image => image.id !== imageId)
  if (!removedImages.value.includes(imageId)) {
    removedImages.value.push(imageId)
  }
}

const removeNewImage = (imageName: string) => {
  newImages.value = newImages.value.filter(image => image.name !== imageName)
}

const restoreOriginal = () => {
  applyProduct(activeProduct.value)
}
</script>
