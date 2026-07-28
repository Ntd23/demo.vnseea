// English description: Product repository implementation that calls context-local Nuxt API bridges.

import type { ProductRepository } from "../../domain/repositories/ProductRepository"
import type { ProductEditorDraft, ProductRecord } from "../../domain/types/product-editor.types"
import type { ProductMarketplaceQuery, ProductMarketplaceResponse } from "../../domain/types/product-marketplace.types"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"

const productApiRoutes = {
  list: "product",
  cart: "product/cart",
  detail: (id: string) => `product/${id}`,
  create: "product/create",
  update: (id: string) => `product/${id}`,
}

export function createApiProductRepository(): ProductRepository {
  const client = useNuxtApiClient()

  return {
    list(query?: ProductMarketplaceQuery) {
      return client.get<ProductMarketplaceResponse>(productApiRoutes.list, query)
    },
    addToCart(productId: number, quantity = 1) {
      return client.post<{ count: number }, { productId: number; quantity: number }>(productApiRoutes.cart, {
        productId,
        quantity,
      })
    },
    getById(id: string) {
      return client.get<ProductRecord | null>(productApiRoutes.detail(id))
    },
    create(draft: ProductEditorDraft) {
      return client.post<ProductRecord, ProductEditorDraft>(productApiRoutes.create, draft)
    },
    update(id: string, draft: ProductEditorDraft, images: File[] = []) {
      const fields = draft.fields
      const form = new FormData()

      form.append("product_title", fields.title.trim())
      form.append("product_category", fields.category)
      form.append("product_description", fields.description.trim())
      form.append("product_price", fields.price.trim())
      form.append("product_point", fields.point.trim() || "0")
      form.append("product_location", fields.location.trim())
      form.append("product_type", fields.condition === "used" ? "1" : "0")
      form.append("currency", fields.currency)
      form.append("units", fields.stock.trim())
      form.append("deleted_images_ids", draft.removedImageIds.join(","))

      for (const image of images) {
        form.append("images[]", image, image.name)
      }

      return client.post<ProductRecord, FormData>(productApiRoutes.update(id), form)
    },
    delete(id: string | number) {
      return client.delete<{ success: boolean }>(productApiRoutes.detail(String(id)))
    },
  }
}
