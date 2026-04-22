  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

    <div class="relative z-10 space-y-1 mb-6">
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
        {{ t("pages.groupDetailPage.topicsTitle") }}
      </p>
      <div class="h-1 w-12 bg-primary-600 rounded-full ml-1" />
    </div>

    <div class="relative z-10 flex flex-wrap gap-2 mb-6">
      <UBadge
        v-for="tag in group.tags"
        :key="tag"
        variant="soft"
        class="rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100/50 hover:bg-primary-600 hover:text-white transition-all cursor-default"
      >
        #{{ tag }}
      </UBadge>
    </div>

    <div class="relative z-10 grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.groupDetailPage.topicsAudienceTitle") }}</p>
        <p class="text-xs font-medium leading-relaxed text-secondary-600">
          {{ t("pages.groupDetailPage.topicsAudienceDescription", { category: categoryLabel.toLowerCase() }) }}
        </p>
      </div>
      <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.groupDetailPage.topicsJoinTitle") }}</p>
        <p class="text-xs font-medium leading-relaxed text-secondary-600">
          {{ t("pages.groupDetailPage.topicsJoinDescription", { privacy: privacyDescription }) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

const { t } = useI18n()

defineProps<{
  group: CommunityGroupRecord
  categoryLabel: string
  privacyDescription: string
}>()
</script>
