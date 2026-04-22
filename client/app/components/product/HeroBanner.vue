  <section :class="theme.container">
    <!-- Premium Deco -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
    <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
    <div :class="theme.bottomGlow" />

    <div class="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px] space-y-6">
        <div class="space-y-4">
          <UBadge color="white" variant="soft" class="rounded-full bg-white/10 px-4 py-1.5 font-black uppercase tracking-widest text-primary-200 border border-white/10 backdrop-blur-md">
            {{ badge }}
          </UBadge>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight text-white">
            {{ title }}
          </h1>
          <p class="max-w-[580px] text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            {{ description }}
          </p>
        </div>

        <div class="flex flex-wrap gap-4 pt-4">
          <UButton
            to="/my-products"
            color="white"
            variant="soft"
            size="xl"
            leading-icon="i-ph-arrow-left-bold"
            class="rounded-full px-8 font-black bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
             {{ $t("pages.productsPage.backToMyProducts") || "Back" }}
          </UButton>

          <UButton
            color="white"
            variant="solid"
            size="xl"
            class="rounded-full px-8 font-black shadow-2xl active:scale-95 transition-all"
            :class="theme.secondaryAction"
            @click="$emit('secondaryAction')"
          >
            {{ secondaryActionLabel }}
          </UButton>
        </div>
      </div>

      <!-- Hero Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:w-[450px] xl:grid-cols-1">
        <UCard
          v-for="item in stats"
          :key="item.label"
          class="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10"
          :ui="{ body: { padding: 'p-5' }, base: 'overflow-hidden' }"
        >
          <div class="space-y-3">
            <p class="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/70 transition-colors">
              {{ item.label }}
            </p>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-black text-white leading-none tracking-tight">
                {{ item.value }}
              </p>
              <p class="text-xs font-bold text-white/60">
                {{ item.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductHeroStat } from "../../../types/product-editor"

const props = defineProps<{
  variant: "create" | "edit"
  badge: string
  title: string
  description: string
  stats: ProductHeroStat[]
  secondaryActionLabel: string
}>()

defineEmits<{
  (e: "secondaryAction"): void
}>()

const theme = computed(() => {
  if (props.variant === "edit") {
    return {
      container: "relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-6 pb-20 pt-10 text-white shadow-2xl sm:px-10 lg:px-12",
      bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[240px] w-[240px] rounded-full bg-primary-400/20 blur-3xl",
      secondaryAction: "bg-white text-primary-950 hover:bg-primary-50",
    }
  }

  return {
    container: "relative overflow-hidden rounded-[40px] bg-gradient-to-br from-orange-950 via-amber-900 to-rose-900 px-6 pb-20 pt-10 text-white shadow-2xl sm:px-10 lg:px-12",
    bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[240px] w-[240px] rounded-full bg-amber-500/20 blur-3xl",
    secondaryAction: "bg-white text-amber-950 hover:bg-amber-50",
  }
})
</script>
