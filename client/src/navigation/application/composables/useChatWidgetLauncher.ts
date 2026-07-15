// Description: Shares one-shot requests that open a seller mini chat with a structured product inquiry draft.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useAppBreakpoints } from "#shared-kernel/application/composables/useAppBreakpoints"
import type { MessageProductCard } from "../../../messages/domain/types/messages.types"

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
  const request = useState<ProductChatLaunchRequest | null>(
    "navigation:chat-widget:launch-request",
    () => null,
  )

  function openProductChat(input: Omit<ProductChatLaunchRequest, "requestId">) {
    if (!isWide.value) {
      request.value = null
      void navigateTo({
        path: appRoutes.messages,
        query: {
          userId: String(input.sellerId),
          name: input.sellerName,
          productId: input.product.id,
        },
      })
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

  return {
    request,
    openProductChat,
    consumeRequest,
  }
}
