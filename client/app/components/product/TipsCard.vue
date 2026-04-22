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
