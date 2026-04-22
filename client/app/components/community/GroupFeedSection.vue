  <div class="space-y-6">
    <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
      <!-- Visual Decor -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
            {{ t("pages.groupDetailPage.feedEyebrow") }}
          </p>
          <h2 class="text-2xl font-black text-secondary-900 tracking-tighter leading-none">
            {{ t("pages.groupDetailPage.feedTitle") }}
          </h2>
          <p class="text-xs font-medium leading-relaxed text-secondary-500 max-w-[480px] px-1">
            {{ t("pages.groupDetailPage.feedDescription", { activity: group.activityLabel }) }}
          </p>
        </div>

        <div class="rounded-2xl bg-secondary-50/50 px-4 py-3 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1">
            Admin
          </p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none">
            {{ group.ownerLabel }}
          </p>
        </div>
      </div>
    </section>

    <FeedPublisherBox />

    <FeedPostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
    />
  </div>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

const { t } = useI18n()

defineProps<{
  group: CommunityGroupRecord
  posts: Array<{
    id: number
    author: string
    role: string
    audience: string
    time: string
    text: string
    tags: string[]
    stats: { likes: number; comments: number; shares: number }
    media?: "double" | "single"
    comments: { id: number; author: string; role: string; text: string }[]
  }>
}>()
</script>
