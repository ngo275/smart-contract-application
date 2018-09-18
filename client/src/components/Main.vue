<template>
  <div>
    <Metamask/>
    <Dashboard/>
  </div>
</template>

<script>
import Metamask from '@/components/Metamask'
import Dashboard from '@/components/Dashboard'
export default {
  name: 'Main',
  beforeCreate() {
    this.$store.dispatch('registerWeb3')
  },
  components: {
    'Metamask': Metamask,
    'Dashboard': Dashboard,
  }
}
</script>

<style scoped>
</style>
