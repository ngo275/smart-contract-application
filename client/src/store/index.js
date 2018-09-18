import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getWeb3 from '../utils/getWeb3'
import pollWeb3 from '../utils/pollWeb3'
import { getFactoryContract, getEventContract } from '../utils/getContract'

Vue.use(Vuex)
export const store = new Vuex.Store({
  strict: true,
  state,
  mutations: {
    registerWeb3Instance (state, payload) {
      let result = payload
      let web3Copy = state.web3
      web3Copy.coinbase = result.coinbase
      web3Copy.networkId = result.networkId
      web3Copy.balance = parseInt(result.balance, 10)
      web3Copy.isInjected = result.injectedWeb3
      web3Copy.web3Instance = result.web3
      state.web3 = web3Copy
      pollWeb3()
    },
    pollWeb3Instance (state, payload) {
      state.web3.coinbase = payload.coinbase
      state.web3.balance = parseInt(payload.balance, 10)
    },
    registerFactoryInstance (state, payload) {
      state.factoryInstance = () => payload
    },
    registerEventInstance (state, payload) {
      let copy = state.eventInstances()
      if (copy === null) {
        copy = [payload]
      } else {
        copy.unshift(payload)
      }
      state.eventInstances = () => copy
    },
    resetEventInstance (state) {
      state.eventInstances = () => []
    },
    registerNewEventAddress (state, address) {
      state.newEventAddress = address
    },
    startLoading (state, key) {
      state.isLoading[key] = true
    },
    stopLoading (state, key) {
      state.isLoading[key] = false
    },
  },
  actions: {
    registerWeb3 ({commit}) {
      getWeb3.then(result => {
        commit('registerWeb3Instance', result)
      }).catch(e => {
        console.log('error in action registerWeb3', e)
      })
    },
    pollWeb3 ({commit}, payload) {
      commit('pollWeb3Instance', payload)
    },
    getFactoryInstance ({commit}) {
      getFactoryContract(state.web3.networkId).then(result => {
        commit('registerFactoryInstance', result)
      }).catch(e => console.log(e))
    },
    getEventInstance ({commit}, address) {
      getEventContract(address).then(result => {
        commit('registerEventInstance', result)
      })
    },
    resetEventInstance ({commit}) {
      commit('resetEventInstance')
    },
    setNewEventAddress ({commit}, address) {
      commit('registerNewEventAddress', address)
    },
    startLoading ({commit}, key) {
      commit('startLoading', key)
    },
    stopLoading ({commit}, key) {
      commit('stopLoading', key)
    },
  }
})
