let state = {
  web3: {
    isInjected: false,
    web3Instance: null,
    networkId: null,
    coinbase: null,
    balance: null,
    error: null
  },
  isLoading: {
    eventContracts: false,
    generateEvent: false,
    applyEvent: false,
    cancelEvent: false,
  },
  factoryInstance: () => null,
  eventInstances: () => [],
  newEventAddress: null,
 }
 export default state
