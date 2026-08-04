<!-- Description: Renders a structured marketplace purchase request consistently across full and mini conversations. -->
<template>
  <article class="order-request-card">
    <header class="order-request-card__header">
      <div class="order-request-card__heading">
        <strong>{{ t("pages.messagesPage.orderRequestTitle") }}</strong>
        <span>#{{ order.orderHash }}</span>
      </div>
      <span class="order-request-card__icon" aria-hidden="true">
        <Icon name="i-ph-bag-simple-bold" />
      </span>
    </header>

    <div class="order-request-card__items">
      <NuxtLink
        v-for="item in order.items"
        :key="`${order.orderHash}-${item.productId}`"
        :to="item.href"
        class="order-request-card__item"
        @click.stop
      >
        <span class="order-request-card__media">
          <img
            v-if="item.imageUrl && !failedImageIds.has(item.productId)"
            :src="item.imageUrl"
            :alt="item.name"
            loading="lazy"
            @error="markImageFailed(item.productId)"
          >
          <Icon v-else name="i-ph-package-duotone" />
        </span>
        <span class="order-request-card__product">
          <strong>{{ item.name }}</strong>
          <span>{{ item.total }}</span>
        </span>
        <span class="order-request-card__quantity">x{{ item.quantity }}</span>
      </NuxtLink>
    </div>

    <footer class="order-request-card__footer">
      <div class="order-request-card__delivery">
        <span class="order-request-card__label">{{ t("pages.messagesPage.orderDeliveryTitle") }}</span>
        <strong v-if="order.buyerName">{{ order.buyerName }}</strong>
        <span v-if="order.buyerPhone">{{ order.buyerPhone }}</span>
        <span v-if="order.buyerAddress">{{ order.buyerAddress }}</span>
      </div>
      <strong v-if="order.total" class="order-request-card__total">{{ order.total }}</strong>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { MessageOrderRequest } from "../../domain/types/messages.types"

defineProps<{ order: MessageOrderRequest }>()
const { t } = useI18n()
const failedImageIds = ref<Set<number>>(new Set())

const markImageFailed = (productId: number) => {
  failedImageIds.value = new Set([...failedImageIds.value, productId])
}
</script>

<style scoped>
.order-request-card { width: 100%; min-width: 0; overflow: hidden; border: 1px solid var(--border-light); border-radius: 16px; background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.order-request-card__header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 13px; background: linear-gradient(135deg, var(--bg-brand-hover), var(--bg-brand)); color: var(--text-inverse); }
.order-request-card__heading { display: grid; min-width: 0; gap: 2px; }
.order-request-card__heading strong { font-size: 13px; font-weight: 800; text-transform: uppercase; }
.order-request-card__heading span { overflow: hidden; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.order-request-card__icon { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: color-mix(in srgb, #ffffff 15%, transparent); }
.order-request-card__icon :deep(svg) { width: 18px; height: 18px; }
.order-request-card__items { display: grid; }
.order-request-card__item { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 10px 12px; border-bottom: 1px solid var(--border-light); color: inherit; text-decoration: none; transition: background 0.15s ease; }
.order-request-card__item:hover { background: color-mix(in srgb, var(--bg-brand) 3%, transparent); }
.order-request-card__media { display: grid; width: 52px; height: 52px; place-items: center; overflow: hidden; border-radius: 10px; background: var(--bg-muted); color: var(--text-tertiary); }
.order-request-card__media img { width: 100%; height: 100%; object-fit: cover; }
.order-request-card__media :deep(svg) { width: 22px; height: 22px; }
.order-request-card__product { display: grid; min-width: 0; gap: 3px; }
.order-request-card__product strong { display: -webkit-box; overflow: hidden; font-size: 13px; font-weight: 700; line-height: 1.3; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.order-request-card__product span { color: var(--bg-brand); font-size: 12px; font-weight: 800; line-height: 1.3; overflow-wrap: break-word; }
.order-request-card__quantity { color: var(--text-tertiary); font-size: 11px; font-weight: 700; }
.order-request-card__footer { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 115px), 1fr)); align-items: flex-start; gap: 9px 12px; padding: 11px 12px; background: var(--bg-muted); }
.order-request-card__delivery { display: grid; min-width: 0; gap: 2px; color: var(--text-secondary); font-size: 11px; line-height: 1.35; }
.order-request-card__delivery strong { color: var(--text-primary); font-size: 12px; }
.order-request-card__label { margin-bottom: 2px; color: var(--text-tertiary); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.order-request-card__total { min-width: 0; max-width: 100%; justify-self: end; color: var(--bg-brand); font-size: 12px; font-weight: 800; line-height: 1.35; text-align: end; overflow-wrap: break-word; }

@media (max-width: 520px) {
  .order-request-card__item { grid-template-columns: 48px minmax(0, 1fr) auto; }
  .order-request-card__media { width: 48px; height: 48px; }
}
</style>
