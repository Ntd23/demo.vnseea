  <article class="surface-card group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ring-1 ring-secondary-200/50 hover:ring-primary-500/20 relative">
    <div class="h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-sm" />

    <div class="p-6 space-y-6 bg-white">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-4">
          <div class="relative shrink-0">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-[20px] text-[15px] font-black text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-primary-500/30"
              :style="{ background: accentBackground }"
            >
              {{ user.initials }}
            </div>

            <span
              v-if="user.online"
              class="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full border-[3px] border-white bg-green-500 shadow-sm"
            />
          </div>

          <div class="min-w-0 space-y-1">
            <NuxtLink
              :to="user.href"
              class="block truncate text-xl font-black tracking-tight text-secondary-900 transition hover:text-primary-600"
            >
              {{ user.name }}
            </NuxtLink>
            <p class="text-[10px] font-black uppercase tracking-widest text-primary-500 px-1">
              {{ user.role }}
            </p>
          </div>
        </div>

        <UBadge variant="soft" class="rounded-xl font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-secondary-50 text-secondary-500 ring-1 ring-secondary-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:ring-primary-100 transition-all">
          {{ user.mutualLabel }}
        </UBadge>
      </div>

      <p class="text-[13px] font-medium leading-relaxed text-secondary-600 px-1 italic">
        "{{ user.reason }}"
      </p>

      <!-- Meta Grid -->
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[18px] bg-secondary-50/50 p-4 ring-1 ring-secondary-100 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.explorePage.signalLabel") }}</p>
          <div class="flex items-center gap-2">
            <Icon name="i-ph-trend-up-duotone" class="h-4 w-4 text-primary-600 transition-transform group-hover/item:scale-110" />
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">{{ user.meta }}</p>
          </div>
        </div>

        <div class="rounded-[18px] bg-secondary-50/50 p-4 ring-1 ring-secondary-100 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.explorePage.statusLabel") }}</p>
          <div class="flex items-center gap-2">
            <Icon name="i-ph-pulse-duotone" class="h-4 w-4 text-primary-600 transition-transform group-hover/item:scale-110" />
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">{{ profileLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Skills/Tags -->
      <div class="flex flex-wrap gap-2 pt-2">
        <span
          v-for="tag in user.tags"
          :key="tag"
          class="inline-flex items-center rounded-lg border border-secondary-100 bg-secondary-50/50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-secondary-500 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 cursor-default"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 pt-2 sm:flex-row border-t border-secondary-50">
        <UButton
          size="xl"
          class="flex-1 h-11 rounded-[14px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 border-none"
          :style="{ background: accentBackground }"
          @click="connected = !connected"
        >
          <template #leading>
            <Icon :name="connected ? 'i-ph-check-circle-duotone' : 'i-ph-user-plus-duotone'" class="h-4.5 w-4.5" />
          </template>
          {{ connected ? t("pages.explorePage.inviteSent") : t("pages.explorePage.connectNow") }}
        </UButton>

        <UButton
          v-if="!connected"
          :to="user.href"
          variant="soft"
          size="xl"
          class="flex-1 h-11 rounded-[14px] bg-secondary-50 text-secondary-600 ring-1 ring-secondary-100 hover:bg-white hover:text-primary-600 hover:border-primary-100 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
        >
          {{ t("pages.explorePage.viewProfile") }}
        </UButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ExploreUserSpotlight } from "~/composables/useMockExploreData"

const props = defineProps<{
  user: ExploreUserSpotlight
}>()

const { t } = useI18n()
const connected = ref(false)

const accentBackground = computed(() =>
  `linear-gradient(135deg, ${props.user.accent} 0%, #0000ff 100%)`,
)

const profileLabel = computed(() =>
  props.user.online ? t("pages.explorePage.activeNow") : t("pages.explorePage.connectable"),
)
</script>
