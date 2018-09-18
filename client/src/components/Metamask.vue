<template>
  <div class='metamask-info'>
    <p v-if="!isInjected" id="no-metamask">Metamask not found</p>
  </div>
</template>

<script>
import { NETWORKS } from '../utils/constants/networks'
import { mapState } from 'vuex'
export default {
  name: 'Metamask',
  computed: mapState({
    isInjected: state => state.web3.isInjected,
  })
}
</script>

<style scoped>
#no-metamask {
  color:red;
}
</style>
