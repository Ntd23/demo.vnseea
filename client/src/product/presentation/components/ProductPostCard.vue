<!-- English description: Renders a marketplace product inside a feed post with PHTML-parity details and purchase actions. -->

<template>
  <section class="product-post-card">
    <button
      type="button"
      class="product-post-card__media"
      :aria-label="title"
      @click="openImageViewer(0)"
    >
      <NuxtImg
        v-if="displayImageUrl"
        :src="displayImageUrl"
        :alt="title"
        loading="lazy"
        class="product-post-card__image"
      />
      <span v-else class="product-post-card__image-fallback">
        <Icon name="i-ph-package-fill" />
      </span>
    </button>

    <div class="product-post-card__body">
      <NuxtLink
        :to="`${productHref}#reviews`"
        class="product-post-card__rating"
        :aria-label="t('pages.productDetailPage.ratingLabel', { count: roundedRating })"
      >
        <span class="product-post-card__stars" aria-hidden="true">
          <Icon
            v-for="star in 5"
            :key="star"
            name="i-ph-star-fill"
            :class="{ 'product-post-card__star--active': star <= roundedRating }"
          />
        </span>
        <span>{{ t("pages.productDetailPage.reviews", { count: product.reviewsCount }) }}</span>
      </NuxtLink>

      <div class="product-post-card__meta">
        <span v-if="product.location">
          <Icon name="i-ph-map-pin-fill" />
          {{ product.location }}
        </span>
        <span>
          <Icon name="i-ph-package-fill" />
          {{ stockLabel }}
        </span>
        <span>
          <Icon name="i-ph-tag-fill" />
          {{ conditionLabel }}
        </span>
      </div>

      <NuxtLink :to="productHref" class="product-post-card__title">
        {{ title }}
      </NuxtLink>

      <div class="product-post-card__prices">
        <strong>{{ formattedPrice }}</strong>
        <strong v-if="product.point > 0">{{ formattedPoints }}</strong>
      </div>

      <div class="product-post-card__actions">
        <UButton
          v-if="canContactSeller"
          type="button"
          color="neutral"
          variant="soft"
          icon="i-ph-chat-text-fill"
          class="product-post-card__action"
          @click="openSellerChat"
        >
          {{ t("pages.productDetailPage.contactSeller") }}
        </UButton>

        <UButton
          v-if="canPurchase"
          type="button"
          color="primary"
          icon="i-ph-shopping-cart-simple-fill"
          class="product-post-card__action product-post-card__action--buy"
          :loading="cartLoading"
          :disabled="cartLoading"
          @click="buyNow"
        >
          {{ t("pages.productDetailPage.buyNow") }}
        </UButton>

        <UButton
          :to="productHref"
          color="neutral"
          variant="soft"
          icon="i-ph-info-fill"
          class="product-post-card__action"
        >
          {{ t("feed.postCard.productMoreInfo") }}
        </UButton>
      </div>

      <div v-if="description" class="product-post-card__description">
        <Icon name="i-ph-info-fill" />
        <p>{{ description }}</p>
      </div>
    </div>
  </section>

  <ClientOnly>
    <ProductImageViewer
      :open="imageViewerOpen"
      :images="viewerImages"
      :current-index="imageViewerIndex"
      :title="title"
      @close="imageViewerOpen = false"
      @change="imageViewerIndex = $event"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { useChatWidgetLauncher } from "../../../navigation/application/composables/useChatWidgetLauncher"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { formatProductPoints, formatProductPrice, formatProductPriceSummary } from "../../application/formatters/product-currency"
import type { ProductFeedAttachment } from "../../domain/types/product-marketplace.types"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"
import ProductImageViewer from "./ProductImageViewer.vue"

const props = defineProps<{
  product: ProductFeedAttachment
  title: string
  description: string
  imageUrl: string
  href: string
}>()

const { t, locale } = useI18n()
const toast = useToast()
const authStore = useCurrentAuthUserStore()
const repository = createApiProductRepository()
const { openProductChat } = useChatWidgetLauncher()
const cartLoading = ref(false)
const imageViewerOpen = ref(false)
const imageViewerIndex = ref(0)

const roundedRating = computed(() =>
  Math.max(0, Math.min(5, Math.round(props.product.rating))),
)
const productHref = computed(() =>
  props.product.id > 0 ? appRoutes.productDetail(props.product.id) : props.href,
)
const displayImageUrl = computed(() =>
  props.imageUrl
  || props.product.images?.[0]?.thumb
  || props.product.images?.[0]?.src
  || "",
)
const viewerImages = computed(() => {
  if (props.product.images?.length > 0) {
    return props.product.images
  }

  return displayImageUrl.value
    ? [{ id: String(props.product.id), src: displayImageUrl.value, alt: props.title }]
    : []
})
const isOwner = computed(() =>
  props.product.sellerId > 0 && authStore.user?.id === props.product.sellerId,
)
const canContactSeller = computed(() =>
  props.product.sellerId > 0 && !isOwner.value,
)
const canPurchase = computed(() =>
  props.product.id > 0 && props.product.stock > 0 && !isOwner.value,
)
const formattedPrice = computed(() => formatProductPrice(props.product, locale.value))
const formattedPoints = computed(() => formatProductPoints(props.product, locale.value))
const stockLabel = computed(() =>
  props.product.stock > 0
    ? t("pages.productDetailPage.stockAvailable")
    : t("pages.productDetailPage.stockUnavailable"),
)
const conditionLabel = computed(() =>
  props.product.condition === "used"
    ? t("pages.productEditor.conditionUsed")
    : t("pages.productEditor.conditionNew"),
)

function openImageViewer(index: number) {
  if (viewerImages.value.length === 0) return

  imageViewerIndex.value = Math.max(0, Math.min(index, viewerImages.value.length - 1))
  imageViewerOpen.value = true
}

function openSellerChat() {
  if (!canContactSeller.value) return

  openProductChat({
    sellerId: props.product.sellerId,
    sellerName: props.product.sellerName,
    suggestions: [
      t("pages.productsPage.productInquiryMessage"),
      t("pages.productsPage.productAvailabilityMessage"),
      t("pages.productsPage.productNegotiationMessage"),
    ],
    product: {
      id: String(props.product.id),
      title: props.title,
      imageUrl: displayImageUrl.value,
      price: formatProductPriceSummary(props.product, locale.value),
      href: productHref.value,
    },
  })
}

function getErrorMessage(error: unknown) {
  const fetchError = error as {
    data?: { statusMessage?: string, message?: string }
    statusMessage?: string
    message?: string
  }

  return fetchError.data?.statusMessage
    || fetchError.data?.message
    || fetchError.statusMessage
    || fetchError.message
    || ""
}

async function buyNow() {
  if (!canPurchase.value || cartLoading.value) return

  if (props.product.addedToCart) {
    await navigateTo(appRoutes.checkout)
    return
  }

  cartLoading.value = true

  try {
    await repository.addToCart(props.product.id)
    await navigateTo(appRoutes.checkout)
  }
  catch (error) {
    const message = getErrorMessage(error)

    if (/already\s+in\s+cart/i.test(message)) {
      await navigateTo(appRoutes.checkout)
      return
    }

    toast.add({
      title: t("pages.productDetailPage.addToCartError"),
      description: message || t("feed.postCard.productCartError"),
      color: "error",
      icon: "i-ph-warning-circle-bold",
    })
  }
  finally {
    cartLoading.value = false
  }
}
</script>

<style scoped>
.product-post-card {
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.product-post-card__media {
  display: flex;
  width: 100%;
  min-height: 260px;
  max-height: 520px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: var(--bg-muted);
  cursor: zoom-in;
}

.product-post-card__image {
  width: 100%;
  height: 100%;
  max-height: 520px;
  object-fit: contain;
}

.product-post-card__image-fallback {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  color: var(--icon-secondary);
}

.product-post-card__image-fallback svg,
.product-post-card__image-fallback :deep(svg) {
  width: 58px;
  height: 58px;
}

.product-post-card__body {
  display: grid;
  gap: 11px;
  padding: 16px;
}

.product-post-card__rating,
.product-post-card__meta,
.product-post-card__description {
  color: var(--text-secondary);
  font-size: 13px;
}

.product-post-card__rating {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 5px;
  text-decoration: none;
}

.product-post-card__rating:hover {
  color: var(--text-primary);
}

.product-post-card__stars {
  display: inline-flex;
  gap: 2px;
}

.product-post-card__stars svg,
.product-post-card__stars :deep(svg) {
  width: 17px;
  height: 17px;
  color: var(--text-tertiary);
}

.product-post-card__stars .product-post-card__star--active,
.product-post-card__stars :deep(.product-post-card__star--active) {
  color: var(--color-warning);
}

.product-post-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--border-light);
}

.product-post-card__meta span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.product-post-card__meta svg,
.product-post-card__meta :deep(svg) {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  color: var(--icon-secondary);
}

.product-post-card__title {
  width: fit-content;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;
}

.product-post-card__title:hover {
  color: var(--text-brand);
}

.product-post-card__prices {
  display: grid;
  gap: 3px;
}

.product-post-card__prices strong {
  color: var(--text-brand);
  font-size: 17px;
  line-height: 1.25;
}

.product-post-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.product-post-card__action {
  width: 100%;
  min-width: 0;
  justify-content: center;
}

.product-post-card__description {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 2px;
  line-height: 1.55;
}

.product-post-card__description svg,
.product-post-card__description :deep(svg) {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--icon-secondary);
}

.product-post-card__description p {
  margin: 0;
  white-space: pre-line;
}

@media (max-width: 640px) {
  .product-post-card__media {
    min-height: 210px;
  }

  .product-post-card__body {
    padding: 13px;
  }

  .product-post-card__title {
    font-size: 17px;
  }

  .product-post-card__actions {
    grid-template-columns: 1fr;
  }
}
</style>
