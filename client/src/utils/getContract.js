import Web3 from 'web3'
import { factoryAddresses, factoryABI, eventABI } from './constants/contract'

export const getFactoryContract = (networkId) => {
  return new Promise((resolve, reject) => {
    const web3 = new Web3(window.web3.currentProvider)
    const contract = web3.eth.contract(factoryABI)
    const factoryInstance = contract.at(factoryAddresses[networkId])
    resolve(factoryInstance)
  })
}

export const getEventContract = (address) => {
  return new Promise((resolve, reject) => {
    const web3 = new Web3(window.web3.currentProvider)
    const contract = web3.eth.contract(eventABI)
    const eventInstance = contract.at(address)
    resolve(eventInstance)
  })
}
