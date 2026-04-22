  <UCard class="surface-card ring-1 ring-secondary-100 shadow-xl" :ui="{ body: { padding: 'p-6' } }">
    <p class="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-4 pl-1">
      {{ title || $t("pages.productEditor.checklist") }}
    </p>
    
    <div class="space-y-4">
      <div class="px-1">
        <UProgress :model-value="donePercent" color="success" size="sm" class="h-1.5" />
      </div>

      <div class="space-y-3 pt-2">
        <div
          v-for="item in items"
          :key="item.label"
          class="flex items-start gap-4 p-4 rounded-2xl transition-all border group"
          :class="item.done 
            ? 'border-emerald-100 bg-emerald-50/40' 
            : 'border-secondary-100 bg-secondary-50/20'"
        >
          <div
            class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all"
            :class="item.done 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
              : 'bg-white border-2 border-secondary-100 text-secondary-300 group-hover:border-primary-200 group-hover:text-primary-300'"
          >
            <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-circle'" class="h-4 w-4" />
          </div>
          <div class="space-y-0.5">
            <p class="text-sm font-black text-secondary-950 tracking-tight leading-tight transition-colors" :class="{ 'text-emerald-900': item.done }">
              {{ item.label }}
            </p>
            <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </UCard>

<script setup lang="ts">
import type { ProductChecklistItem } from "../../../types/product-editor"

const props = withDefaults(defineProps<{
  title?: string
  items: ProductChecklistItem[]
}>(), {
  title: undefined,
})

const donePercent = computed(() => {
  if (!props.items.length) return 0
  const doneCount = props.items.filter(item => item.done).length
  return (doneCount / props.items.length) * 100
})
</script>
