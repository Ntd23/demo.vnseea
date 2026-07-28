// Description: Resolves a product inquiry carried by the messages route into a reusable card and quick-question context.

import type { Ref } from "vue"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { formatProductPriceSummary } from "../../../product/application/formatters/product-currency"
import { createApiProductRepository } from "../../../product/infrastructure/repositories/ApiProductRepository"
import type {
  MessageComposerDraft,
  MessageContact,
  MessageProductCard,
  MessageProductLaunchContext,
} from "../../domain/types/messages.types"
import { buildProductMessageText } from "../utils/message-bubble-content"

function normalizeQueryValue(value: unknown) {
  const normalized = Array.isArray(value) ? value[0] : value

  return typeof normalized === "string" || typeof normalized === "number"
    ? String(normalized).trim()
    : ""
}

export function useMessagesProductContext(
  selectedContact: Ref<MessageContact | null | undefined>,
) {
  const route = useRoute()
  const { locale, t } = useI18n()
  const repository = createApiProductRepository()
  const dismissedProductId = ref("")
  const launchContext = useState<MessageProductLaunchContext | null>(
    "messages:product-launch-context",
    () => null,
  )

  const requestedProductId = computed(() => normalizeQueryValue(route.query.productId))
  const requestedSellerId = computed(() => {
    const value = Number(normalizeQueryValue(route.query.userId))

    return Number.isInteger(value) && value > 0 ? value : 0
  })
  const matchingLaunchContext = computed(() => {
    const context = launchContext.value

    return context
      && context.sellerId === requestedSellerId.value
      && context.product.id === requestedProductId.value
      ? context
      : null
  })

  const {
    data: requestedProduct,
    status: productStatus,
  } = useAsyncData(
    () => requestedProductId.value
      ? `messages:product-context:${requestedProductId.value}`
      : "messages:product-context:none",
    () => requestedProductId.value && !matchingLaunchContext.value
      ? repository.getById(requestedProductId.value)
      : Promise.resolve(null),
    {
      watch: [requestedProductId, matchingLaunchContext],
      default: () => null,
    },
  )

  watch(requestedProductId, () => {
    dismissedProductId.value = ""
  })

  const belongsToSelectedConversation = computed(() =>
    requestedSellerId.value > 0
    && selectedContact.value?.type === "user"
    && selectedContact.value.userId === requestedSellerId.value,
  )

  const productCard = computed<MessageProductCard | null>(() => {
    const contextProduct = matchingLaunchContext.value?.product
    const product = requestedProduct.value

    if (
      !belongsToSelectedConversation.value
      || dismissedProductId.value === requestedProductId.value
    ) {
      return null
    }

    if (contextProduct) {
      return contextProduct
    }

    if (
      !product
      || String(product.id) !== requestedProductId.value
      || (product.sellerId && product.sellerId !== requestedSellerId.value)
    ) {
      return null
    }

    return {
      id: String(product.id),
      title: product.title,
      imageUrl: product.images?.[0]?.src,
      price: formatProductPriceSummary(product, locale.value),
      href: appRoutes.productDetail(product.id),
    }
  })

  const productSuggestions = computed(() => {
    const suggestions = matchingLaunchContext.value?.suggestions

    return suggestions?.length
      ? suggestions
      : [
          t("pages.productsPage.productInquiryMessage"),
          t("pages.productsPage.productAvailabilityMessage"),
          t("pages.productsPage.productNegotiationMessage"),
        ]
  })

  const productContextPending = computed(() =>
    Boolean(
      requestedProductId.value
      && belongsToSelectedConversation.value
      && dismissedProductId.value !== requestedProductId.value
      && !matchingLaunchContext.value
      && productStatus.value === "pending",
    ),
  )

  function decorateProductMessage(input: MessageComposerDraft): MessageComposerDraft {
    if (!productCard.value) {
      return input
    }

    return {
      ...input,
      text: buildProductMessageText({
        text: input.text,
        product: productCard.value,
      }),
    }
  }

  function dismissProductContext() {
    dismissedProductId.value = requestedProductId.value
    if (matchingLaunchContext.value) {
      launchContext.value = null
    }
  }

  return {
    decorateProductMessage,
    dismissProductContext,
    productCard,
    productContextPending,
    productSuggestions,
    requestedProductId,
    requestedSellerId,
  }
}
