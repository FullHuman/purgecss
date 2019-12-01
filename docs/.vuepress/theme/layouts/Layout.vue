<template>
  <ParentLayout>
    <div>Yooooooooooooo</div>
    <template v-slot:sidebar-top>
      <CarbonAds/>
    </template>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
import CarbonAds from '@theme/components/CarbonAds.vue'
export default {
  components: {
    ParentLayout,
    CarbonAds
  }
}
</script>