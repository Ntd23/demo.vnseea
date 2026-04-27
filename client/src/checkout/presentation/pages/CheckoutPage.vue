<template>
  <section class="space-y-4">
    <header>
      <p class="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
        Checkout Context Sample
      </p>
      <h1 class="text-3xl font-black text-slate-900">
        Checkout Page
      </h1>
      <p class="text-sm text-slate-500">
        Sample page under `src/checkout/presentation/pages`.
      </p>
    </header>

    <div class="rounded-2xl border border-slate-200 bg-white p-5">
      <p class="text-sm text-slate-600">
        Items: {{ snapshot.items.length }}
      </p>
      <p class="mt-2 text-sm text-slate-600">
        Total: {{ total }}
      </p>
      <p class="mt-2 text-sm text-slate-600">
        Shipping valid: {{ shippingValidation.valid ? "yes" : "no" }}
      </p>
      <p class="mt-2 text-sm text-slate-600">
        Status: {{ status }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCheckoutFlow } from "../../application/composables/useCheckoutFlow"
import { createCheckoutSnapshot } from "../../application/use-cases/create-checkout-snapshot"

const { snapshot, total, shippingValidation, status } = useCheckoutFlow(
  "sample:checkout-address",
  createCheckoutSnapshot(),
)
</script>
