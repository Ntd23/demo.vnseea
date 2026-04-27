<template>
  <LightboxModal
    :open="open"
    :items="items"
    :current-index="currentIndex"
    :title="resolvedTitle"
    :description="resolvedDescription"
    :author="author"
    :caption="caption"
    @close="emit('close')"
    @change="emit('change', $event)"
    @share="emit('share')"
    @download="emit('download')"
    @like="emit('like')"
    @comment="emit('comment')"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  description?: string
  author?: string
  caption?: string
  items: Array<{ type: "image" | "video"; src: string; alt?: string; mime?: string }>
  currentIndex?: number
}>(), {
  open: false,
  title: "",
  description: "",
  author: "VNSEEA",
  caption: "",
  currentIndex: 0,
})

const emit = defineEmits<{
  close: []
  share: []
  download: []
  like: []
  comment: []
  change: [index: number]
}>()

const resolvedTitle = computed(() =>
  props.title || t("feed.lightboxViewer.title"),
)

const resolvedDescription = computed(() =>
  props.description || t("feed.lightboxViewer.description", { count: props.items.length }),
)
</script>
