<template>
  <div class="carbon-ads"></div>
</template>
<script>
export default {
  name: 'CarbonAds',
  mounted () {
    this.load()
  },
  watch: {
    '$route' (to, from) {
      if (
        to.path !== from.path
        // Only reload if the ad has been loaded
        // otherwise it's possible that the script is appended but
        // the ads are not loaded yet. This would result in duplicated ads.
        && this.$el.querySelector('#carbonads')
      ) {
        this.$el.innerHTML = ''
        this.load()
      }
    }
  },
  methods: {
    load () {
      const s = document.createElement('script')
      s.id = '_carbonads_js'
      s.src = `//cdn.carbonads.com/carbon.js?serve=CE7DKKJJ&placement=wwwpurgecsscom`
      this.$el.appendChild(s)
    }
  }
}
</script>

<style scoped lang="scss">
.carbon-ads {
  min-height: 102px;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: -0.5rem;
  font-size: 0.75rem;
}
a {
    color: #444;
    font-weight: normal;
    display: inline;
}
.carbon-img {
  float: left;
  margin-right: 1rem;
  border: 1px solid black;
}
img {
  display: block;
}
.carbon-poweredby {
  color: #999;
  display: block;
  margin-top: 0.5em;
}

$MQMobile: 719px !default;

@media (max-width: $MQMobile) {
    .carbon-img img {
      width: 100px;
      height: 77px;
    }
}
</style>
