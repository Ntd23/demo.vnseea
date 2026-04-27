<template>
  <ProductPresentationEditorFields v-bind="$attrs">
    <template #media>
      <slot name="media" />
    </template>
  </ProductPresentationEditorFields>
</template>

<script setup lang="ts">
import ProductPresentationEditorFields from "../../../src/product/presentation/components/EditorFields.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
