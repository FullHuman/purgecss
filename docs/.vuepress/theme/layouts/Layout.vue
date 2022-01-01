<template>
  <Layout>
    <template #sidebar-top>
      <CarbonAds/>
    </template>
  </Layout>
</template>

<script>
import Layout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import CarbonAds from './../components/CarbonAds.vue'

export default {
  components: {
    Layout,
    CarbonAds
  }
}
</script>
