// Description: Shares one-shot requests that open a seller mini chat with a structured product inquiry draft.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useAppBreakpoints } from "#shared-kernel/application/composables/useAppBreakpoints"
import type {
  MessageProductCard,
  MessageProductLaunchContext,
} from "../../../messages/domain/types/messages.types"

export type ProductChatLaunchRequest = {
  requestId: string
  sellerId: number
  sellerName: string
  suggestions: string[]
  product: MessageProductCard
}

let launchSequence = 0

export function useChatWidgetLauncher() {
  const { isWide } = useAppBreakpoints()
  const widgetReady = useState<boolean>(
    "navigation:chat-widget:ready",
    () => false,
  )
  const request = useState<ProductChatLaunchRequest | null>(
    "navigation:chat-widget:launch-request",
    () => null,
  )
  const messagesProductContext = useState<MessageProductLaunchContext | null>(
    "messages:product-launch-context",
    () => null,
  )

  function openMessagesConversation(input: Omit<ProductChatLaunchRequest, "requestId">) {
    request.value = null
    messagesProductContext.value = {
      sellerId: input.sellerId,
      product: input.product,
      suggestions: [...input.suggestions],
    }
    const query = {
      userId: String(input.sellerId),
      name: input.sellerName,
      productId: input.product.id,
    }

    void Promise.resolve(navigateTo({
      path: appRoutes.messages,
      query,
    })).catch(() => {
      if (!import.meta.client) {
        return
      }

      const search = new URLSearchParams(query)
      window.location.assign(`${appRoutes.messages}?${search.toString()}`)
    })
  }

  function openProductChat(input: Omit<ProductChatLaunchRequest, "requestId">) {
    if (!isWide.value || !widgetReady.value) {
      openMessagesConversation(input)
      return
    }

    request.value = {
      ...input,
      requestId: `${Date.now()}:${++launchSequence}`,
    }
  }

  function consumeRequest(requestId: string) {
    if (request.value?.requestId === requestId) {
      request.value = null
    }
  }

  function setWidgetReady(ready: boolean) {
    widgetReady.value = ready
  }

  return {
    request,
    widgetReady,
    openProductChat,
    openMessagesConversation,
    consumeRequest,
    setWidgetReady,
  }
}
