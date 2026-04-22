  <UCard class="surface-card ring-1 ring-secondary-100 shadow-xl" :ui="{ body: { padding: 'p-6' } }">
    <p class="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-6 pl-1">
      {{ title }}
    </p>
    <div class="space-y-4">
      <div
        v-for="tip in items"
        :key="tip.title"
        class="rounded-2xl border border-secondary-100 bg-secondary-50/30 p-5 group transition-all hover:bg-white hover:shadow-lg hover:border-primary-100"
      >
        <div class="flex items-center gap-3">
          <UBadge color="primary" variant="soft" class="rounded-xl p-2 group-hover:scale-110 transition-transform">
            <Icon :name="tip.icon" class="h-5 w-5" />
          </UBadge>
          <p class="text-sm font-black text-secondary-950 tracking-tight">{{ tip.title }}</p>
        </div>
        <p class="mt-3 text-xs font-medium leading-relaxed text-secondary-500 pl-1">
          {{ tip.description }}
        </p>
      </div>
    </div>
  </UCard>

<script setup lang="ts">
import type { ProductTipItem } from "../../../types/product-editor"

defineProps<{
  title: string
  items: ProductTipItem[]
}>()
</script>
