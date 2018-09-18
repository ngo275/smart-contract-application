const EventContractFactory = artifacts.require('./EventContractFactory.sol')

contract('EventContractFactory', (accounts) => {
  let generatedEvents
  let factory

  const owner = accounts[0]
  const account1 = accounts[1]

  const DEFAULT_NAME = 'Smart contract practice'
  const DEFAULT_PLACE = 'Tokyo'
  const TIME_UNTIL_START = 3 * 60 * 60 *24
  const DEFAULT_CAPACITY = 20
  const DEFAULT_FEE = 0.01 * 10 ** 18 // 0.01 Ether

  beforeEach(async () => {
    factory = await EventContractFactory.new({ from: owner })
    generatedEvents = []
  })

  const deployEvent = async (options) => {
    const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
    const generateEventLog = await factory.generate(
      options.owner || owner,
      options.name || DEFAULT_NAME,
      options.place || DEFAULT_PLACE,
      options.date || nowTime + TIME_UNTIL_START,
      options.capacity || DEFAULT_CAPACITY,
      options.fee || DEFAULT_FEE,
      options.isPublished || true
    )
    generatedEvents.push(generateEventLog.logs[0].args._newEvent)
  }

  describe('generate', () => {
    it('should succeed', async () => {
      await deployEvent({})
      const eventAddress = await factory.events(0)
      assert.equal(eventAddress, await factory.myEvents(owner, 0))
    })
  })

  describe('upcomingEvents', () => {
    it('should return correct response', async () => {
      const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
      await deployEvent({ date: nowTime + 1000 })
      await deployEvent({ date: nowTime + 100 })
      await deployEvent({ date: nowTime + 10 })
      const ue = await factory.upcomingEvents()
      assert.equal(ue.length, 3)
      assert.deepEqual(ue, generatedEvents)
    })
  })
})
