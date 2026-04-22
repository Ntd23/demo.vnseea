  <UCard 
    class="surface-card group overflow-hidden ring-1 ring-secondary-100 hover:ring-primary-400/50 transition-all duration-500 hover:shadow-2xl" 
    :ui="{ body: { padding: 'p-0' }, base: 'overflow-hidden' }"
  >
    <!-- Media Preview Layer -->
    <div class="relative h-[250px] overflow-hidden">
      <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-105" :style="{ background: previewBackground }" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_30%)]" />
      
      <Icon 
        :name="previewIcon" 
        class="absolute right-6 top-6 h-28 w-28 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
      />

      <!-- Badges -->
      <div class="absolute left-4 top-4 flex gap-2">
        <UBadge color="white" variant="solid" class="rounded-lg bg-black/60 text-white font-black text-[10px] backdrop-blur-md px-3 py-1">
          {{ categoryLabel }}
        </UBadge>
        <UBadge color="white" variant="soft" class="rounded-lg bg-white/10 text-white font-bold text-[10px] backdrop-blur-md px-3 py-1 border border-white/20">
          {{ conditionLabel }}
        </UBadge>
      </div>

      <!-- Location Info -->
      <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div class="flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-2 text-[10px] font-bold text-white backdrop-blur-xl border border-white/10">
          <Icon name="i-ph-map-pin-bold" class="h-3.5 w-3.5" />
          {{ location || locationPlaceholder || $t("pages.productEditor.previewLocationPlaceholder") }}
        </div>
        <div class="rounded-full bg-white/20 px-3 py-2 text-[10px] font-black text-white backdrop-blur-xl border border-white/20 uppercase tracking-tighter">
          {{ $t("pages.productEditor.imageCount", { count: imageCount }) }}
        </div>
      </div>
    </div>

    <!-- Content Details Layer -->
    <div class="relative p-6 space-y-4">
      <!-- Preview Action Icons (Mock) -->
      <div class="absolute -top-7 right-6 flex items-center gap-2.5">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-secondary-400 shadow-xl ring-1 ring-secondary-100">
          <Icon :name="leadingIcon" class="h-6 w-6" />
        </div>
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-500/30">
          <Icon :name="trailingIcon" class="h-6 w-6" />
        </div>
      </div>

      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">
          {{ currencyLabel }}
        </p>
        <h3 class="pr-20 text-xl font-black leading-tight tracking-tight text-secondary-950 group-hover:text-primary-950 transition-colors">
          {{ title || emptyTitle }}
        </h3>
      </div>

      <p class="text-xs font-medium leading-relaxed text-secondary-500 line-clamp-3 min-h-[4.5rem]">
        {{ description }}
      </p>

      <div class="flex items-end justify-between gap-4 pt-2 border-t border-secondary-50">
        <div class="space-y-0.5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-secondary-400 leading-none">{{ $t("pages.productEditor.priceLabel") }}</p>
          <p class="text-2xl font-black text-emerald-600 tracking-tight leading-none pt-1">
            {{ price }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-2 text-right">
          <div class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700 border border-emerald-100/50 shadow-sm">
            <Icon name="i-ph-check-circle-duotone" class="h-4 w-4" />
            {{ statusLabel }}
          </div>
          <p class="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">
            {{ stockLabel }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  previewBackground: string
  previewIcon: string
  categoryLabel: string
  conditionLabel: string
  currencyLabel: string
  title: string
  emptyTitle: string
  description: string
  price: string
  stockLabel: string
  location: string
  imageCount: number
  leadingIcon: string
  trailingIcon: string
  statusLabel: string
  locationPlaceholder?: string
}>(), {
  locationPlaceholder: undefined,
})
</script>
