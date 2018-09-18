var EventContractFactory = artifacts.require("./EventContractFactory.sol")

module.exports = (deployer) => {
  deployer.deploy(EventContractFactory)
}
