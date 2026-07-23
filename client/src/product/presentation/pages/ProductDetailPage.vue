<!-- English description: Wowonder-aligned Nuxt product detail page backed by the PHP product API bridge. -->

<template>
  <div class="product-detail-page mx-auto w-full max-w-[1180px] px-3 pb-12 pt-4 sm:px-4">
    <button type="button" class="product-detail-back" @click="goBack">
      <Icon name="i-ph-arrow-left" class="h-5 w-5" />
      {{ $t("pages.productDetailPage.back") }}
    </button>

    <div v-if="status === 'pending'" class="product-detail-card">
      <USkeleton class="product-detail-main-image" />
      <div class="product-detail-summary">
        <USkeleton class="h-8 w-3/4 rounded" />
        <USkeleton class="mt-3 h-7 w-40 rounded" />
        <USkeleton class="mt-8 h-24 w-full rounded" />
      </div>
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-ph-warning-circle"
      :title="$t('pages.productDetailPage.loadErrorTitle')"
      :description="String(error)"
    />

    <UAlert
      v-else-if="!product"
      color="neutral"
      variant="soft"
      icon="i-ph-shopping-bag-open"
      :title="$t('pages.productDetailPage.notFoundTitle')"
      :description="$t('pages.productDetailPage.notFoundDescription')"
    />

    <template v-else>
      <article class="product-detail-card">
        <section class="product-detail-gallery">
          <button
            type="button"
            class="product-detail-main-button"
            @click="openImage"
          >
            <img
              v-if="mainImage && !mainImageFailed"
              :src="mainImage.src"
              :alt="mainImage.alt || product.title"
              class="product-detail-main-image"
              @error="mainImageFailed = true"
            >
            <div v-else class="product-detail-main-image product-detail-main-image--empty">
              <Icon name="i-ph-image-square" class="h-12 w-12" />
              <span>{{ product.title }}</span>
            </div>
          </button>

          <div v-if="product.images?.length" class="product-detail-thumbs">
            <button
              v-for="image in product.images"
              :key="image.id"
              type="button"
              class="product-detail-thumb"
              :class="{ 'product-detail-thumb--active': image.id === mainImage?.id }"
              @click="selectImage(image.id)"
            >
              <img :src="image.src" :alt="image.alt || product.title">
            </button>
          </div>
        </section>

        <section class="product-detail-summary">
          <h1 class="product-detail-title">{{ product.title }}</h1>
          <div class="product-detail-price">{{ formattedPrice }}</div>

          <div class="product-detail-rating">
            <span class="product-detail-stars" :aria-label="$t('pages.productDetailPage.ratingLabel', { count: ratingValue })">
              <Icon
                v-for="star in 5"
                :key="star"
                name="i-ph-star-fill"
                class="h-4 w-4"
                :class="star <= ratingValue ? 'text-[#f6b600]' : 'text-[#d6deea]'"
              />
            </span>
            <button type="button">{{ $t("pages.productDetailPage.reviews", { count: 0 }) }}</button>
          </div>

          <div v-if="product.seller" class="product-detail-seller">
            <span class="product-detail-seller-avatar">
              {{ product.seller.slice(0, 1).toUpperCase() }}
            </span>
            <div>
              <p>{{ $t("pages.productDetailPage.sellerBy") }}</p>
              <strong>{{ product.seller }}</strong>
            </div>
          </div>

          <div class="product-detail-actions">
            <UButton
              v-if="product.canContactSeller"
              color="neutral"
              variant="soft"
              icon="i-ph-chat-text-fill"
              class="product-detail-action"
              @click="openSellerChat"
            >
              {{ $t("pages.productDetailPage.contactSeller") }}
            </UButton>
            <UButton
              v-if="product.canAddToCart"
              color="primary"
              icon="i-ph-shopping-cart-simple-fill"
              class="product-detail-action"
              :loading="cartLoading"
              @click="addProductToCart"
            >
              {{ $t("pages.productDetailPage.buyNow") }}
            </UButton>
            <NuxtLink
              v-if="product.mine"
              :to="`/edit-product/${product.id}`"
              class="product-detail-edit"
            >
              <Icon name="i-ph-pencil-simple-fill" class="h-5 w-5" />
              {{ $t("pages.productDetailPage.editProduct") }}
            </NuxtLink>
          </div>

          <ul class="product-detail-info">
            <li v-if="product.location">
              <span><Icon name="i-ph-map-pin-fill" class="text-[#0ea5e9]" /> {{ $t("pages.productDetailPage.location") }}</span>
              <strong>{{ product.location }}</strong>
            </li>
            <li>
              <span><Icon name="i-ph-package-fill" class="text-[var(--text-brand)]" /> {{ $t("pages.productDetailPage.stockStatus") }}</span>
              <strong>{{ stockLabel }}</strong>
            </li>
            <li>
              <span><Icon name="i-ph-tag-fill" class="text-[var(--text-brand)]" /> {{ $t("pages.productDetailPage.condition") }}</span>
              <strong>{{ conditionLabel }}</strong>
            </li>
                      </ul>
        </section>

        <section class="product-detail-section">
          <h2>
            <Icon name="i-ph-info-fill" class="h-5 w-5" />
            {{ $t("pages.productDetailPage.details") }}
          </h2>
          <p v-if="product.description">{{ product.description }}</p>
          <p v-else class="product-detail-muted">{{ $t("pages.productDetailPage.emptyDescription") }}</p>
        </section>

            </article>

      <section v-if="relatedProducts.length" class="product-detail-related">
        <h2>
          <Icon name="i-ph-storefront-fill" class="h-5 w-5" />
          {{ $t("pages.productDetailPage.related") }}
        </h2>
        <div class="product-detail-related-grid">
          <NuxtLink
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :to="relatedProduct.href"
            class="product-detail-related-card"
          >
            <LazyNuxtImg
              v-if="relatedProduct.imageUrl"
              :src="relatedProduct.imageUrl"
              :alt="relatedProduct.title"
            />
            <div v-else class="product-detail-related-empty">
              <Icon :name="relatedProduct.icon" class="h-8 w-8" />
            </div>
            <strong>{{ relatedProduct.title }}</strong>
            <span>{{ formatRelatedPrice(relatedProduct) }}</span>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useChatWidgetLauncher } from "../../../navigation/application/composables/useChatWidgetLauncher"
import { formatProductPrice } from "../../application/formatters/product-currency"
import type { ProductListing } from "../../domain/types/product-marketplace.types"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"

const props = defineProps<{
  productId: string
}>()

const { t, locale } = useI18n()
const router = useRouter()
const toast = useToast()
const { openProductChat } = useChatWidgetLauncher()
const repository = createApiProductRepository()
const mainImageId = ref("")
const mainImageFailed = ref(false)
const cartLoading = ref(false)

const { data: product, status, error } = await useAsyncData(
  () => `product:detail:${props.productId}`,
  () => repository.getById(props.productId),
)

const { data: relatedData } = await useAsyncData(
  () => `product:detail:${props.productId}:related`,
  () => repository.list({ limit: 10 }),
  {
    default: () => ({
      items: [],
      hasMore: false,
      nextOffset: null,
      categories: [],
      subCategories: [],
      distanceFilterAvailable: false,
    }),
  },
)

const mainImage = computed(() => {
  const images = product.value?.images ?? []

  return images.find(image => image.id === mainImageId.value) || images[0]
})

const ratingValue = computed(() => Math.max(0, Math.min(5, Math.round(product.value?.rating ?? 0))))

const formattedPrice = computed(() => {
  if (!product.value) return ""

  return formatProductPrice(product.value, locale.value)
})

const conditionLabel = computed(() => {
  switch (product.value?.condition) {
    case "used":
      return t("pages.productEditor.conditionUsed")
    case "like-new":
      return t("pages.productEditor.conditionLikeNew")
    default:
      return t("pages.productEditor.conditionNew")
  }
})

const stockLabel = computed(() => {
  if (!product.value?.stock) {
    return t("pages.productDetailPage.stockUnavailable")
  }

  return t("pages.productDetailPage.stockAvailable")
})

const categoryLabel = computed(() => {
  if (!product.value) return ""

  return [product.value.categoryLabel, product.value.subCategoryLabel].filter(Boolean).join(" / ")
})

const mapUrl = computed(() => {
  if (!product.value?.location) return ""

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.value.location)}`
})

const relatedProducts = computed(() =>
  (relatedData.value?.items ?? [])
    .filter(relatedProduct => String(relatedProduct.id) !== product.value?.id)
    .slice(0, 10),
)

const selectImage = (imageId: string) => {
  mainImageId.value = imageId
  mainImageFailed.value = false
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push("/products")
}

const openImage = () => {
  if (!mainImage.value?.src || !import.meta.client) return

  window.open(mainImage.value.src, "_blank", "noopener,noreferrer")
}

const openSellerChat = () => {
  if (!product.value?.sellerId) return

  openProductChat({
    sellerId: product.value.sellerId,
    sellerName: product.value.seller || "",
    suggestions: [
      t("pages.productsPage.productInquiryMessage"),
      t("pages.productsPage.productAvailabilityMessage"),
      t("pages.productsPage.productNegotiationMessage"),
    ],
    product: {
      id: product.value.id,
      title: product.value.title,
      imageUrl: mainImage.value?.src,
      price: formattedPrice.value,
      href: `/product/${encodeURIComponent(product.value.id)}`,
    },
  })
}

const getErrorMessage = (error: unknown) => {
  const fetchError = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }

  return fetchError.data?.statusMessage
    || fetchError.data?.message
    || fetchError.statusMessage
    || fetchError.message
    || ""
}

const addProductToCart = async () => {
  if (!product.value || cartLoading.value) return

  cartLoading.value = true

  try {
    await repository.addToCart(Number(product.value.id))
    toast.add({
      title: t("pages.productDetailPage.addedToCart"),
      color: "success",
      icon: "i-ph-check-circle",
    })
    await navigateTo(appRoutes.checkout)
  }
  catch (cartError) {
    const message = getErrorMessage(cartError)

    if (/already\s+in\s+cart/i.test(message)) {
      await navigateTo(appRoutes.checkout)
      return
    }

    toast.add({
      title: t("pages.productDetailPage.addToCartError"),
      description: message || String(cartError),
      color: "error",
      icon: "i-ph-warning-circle",
    })
  }
  finally {
    cartLoading.value = false
  }
}

const formatRelatedPrice = (relatedProduct: ProductListing) => {
  return formatProductPrice(relatedProduct, locale.value)
}

watch(product, (nextProduct) => {
  mainImageId.value = nextProduct?.images?.[0]?.id ?? ""
  mainImageFailed.value = false
}, { immediate: true })

useSeoMeta({
  title: () => product.value?.title || t("pages.productsPage.seoTitle"),
  description: () => product.value?.description || t("pages.productsPage.seoDescription"),
})
</script>

<style scoped>
.product-detail-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
}

.product-detail-card,
.product-detail-related {
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.product-detail-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
  gap: 28px;
  padding: 22px;
}

.product-detail-gallery {
  min-width: 0;
}

.product-detail-main-button {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.product-detail-main-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  background: #eef3fb;
  object-fit: cover;
}

.product-detail-main-image--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8b9bb2;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
}

.product-detail-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.product-detail-thumb {
  overflow: hidden;
  width: 74px;
  height: 74px;
  flex: 0 0 auto;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #eef3fb;
  cursor: pointer;
  padding: 0;
}

.product-detail-thumb--active {
  border-color: var(--color-brand, var(--bg-brand));
}

.product-detail-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail-summary {
  min-width: 0;
}

.product-detail-title {
  margin: 0;
  color: var(--text-primary, #0f172a);
  font-size: 31px;
  font-weight: 800;
  line-height: 1.16;
}

.product-detail-price {
  margin-top: 12px;
  color: var(--color-brand, var(--bg-brand));
  font-size: 24px;
  font-weight: 800;
}

.product-detail-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.product-detail-stars {
  display: inline-flex;
  gap: 2px;
}

.product-detail-rating button {
  border: 0;
  background: transparent;
  color: var(--text-tertiary, #64748b);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 0;
}

.product-detail-seller {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.product-detail-seller-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--color-brand, var(--bg-brand)) 100%);
  font-weight: 800;
}

.product-detail-seller p {
  margin: 0 0 2px;
  color: var(--text-tertiary, #64748b);
  font-size: 12px;
  font-weight: 800;
}

.product-detail-seller strong {
  color: var(--text-primary, #0f172a);
  font-size: 14px;
}

.product-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.product-detail-action,
.product-detail-edit {
  min-height: 40px;
  border-radius: 12px;
  font-weight: 800;
}

.product-detail-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  color: var(--text-secondary, #334155);
  background: #eef3fb;
  text-decoration: none;
}

.product-detail-info {
  display: grid;
  gap: 0;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.product-detail-info li {
  display: grid;
  grid-template-columns: 126px minmax(0, 1fr);
  align-items: flex-start;
  column-gap: 12px;
  border-bottom: 1px solid #eef2f8;
  padding: 12px 0;
}

.product-detail-info span {
  display: inline-flex;
  align-items: flex-start;
  justify-content: flex-start;
  min-width: 0;
  gap: 6px;
  color: var(--text-tertiary, #64748b);
  font-weight: 800;
  line-height: 1.25;
  text-align: left;
}

.product-detail-info span :deep(.iconify) {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin-top: 2px;
}

.product-detail-info strong {
  min-width: 0;
  color: var(--text-primary, #0f172a);
  font-weight: 800;
  justify-self: end;
  text-align: right;
  overflow-wrap: anywhere;
}

.product-detail-section {
  grid-column: 1 / -1;
  border-top: 1px solid #eef2f8;
  padding-top: 22px;
}

.product-detail-section h2,
.product-detail-related h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--text-primary, #0f172a);
  font-size: 19px;
  font-weight: 800;
}

.product-detail-section p {
  margin: 0;
  color: var(--text-secondary, #334155);
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-line;
}

.product-detail-muted {
  color: var(--text-muted, #94a3b8) !important;
}

.product-detail-map {
  display: flex;
  min-height: 170px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e5eaf1;
  border-radius: 16px;
  color: #5f6368;
  background: linear-gradient(135deg, #f7f4ed 0%, #f2f0ea 100%);
  text-align: center;
  text-decoration: none;
}

.product-detail-related {
  margin-top: 18px;
  padding: 18px;
}

.product-detail-related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}

.product-detail-related-card {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.product-detail-related-card img,
.product-detail-related-empty {
  display: flex;
  width: 100%;
  aspect-ratio: 1 / 1;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #eef3fb;
  object-fit: cover;
  color: #8b9bb2;
}

.product-detail-related-card strong {
  display: block;
  overflow: hidden;
  margin-top: 8px;
  color: var(--text-primary, #0f172a);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-detail-related-card span {
  display: block;
  margin-top: 4px;
  color: var(--color-brand, var(--bg-brand));
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 900px) {
  .product-detail-card {
    grid-template-columns: 1fr;
  }

  .product-detail-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .product-detail-card {
    padding: 14px;
  }

  .product-detail-title {
    font-size: 25px;
  }

  .product-detail-info li {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .product-detail-info span,
  .product-detail-info strong {
    min-width: 0;
    justify-self: start;
    text-align: left;
  }
}
</style>
