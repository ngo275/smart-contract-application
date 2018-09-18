const EventContract = artifacts.require('./EventContract.sol')
const EventContractFactory = artifacts.require('./EventContractFactory.sol')
const Decimal = require('decimal.js')
const expectThrow = require('./helpers/expectThrow')
const block = require('./helpers/block')

contract('EventContract', (accounts) => {
  let event

  const owner = accounts[0]
  const account1 = accounts[1]
  const account2 = accounts[2]
  const account3 = accounts[3]

  const DEFAULT_NAME = 'Smart contract practice'
  const DEFAULT_PLACE = 'Tokyo'
  const TIME_UNTIL_START = 3 * 60 * 60 *24
  const DEFAULT_CAPACITY = 20
  const DEFAULT_FEE = 0.01 * 10 ** 18 // 0.01 Ether

  const generateEvent = async (options) => {
    const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
    const isPublished = options.isPublished === false ? false : true
    const fee = options.fee == null ? DEFAULT_FEE : options.fee
    event = await EventContract.new(
      options.owner || owner,
      options.name || DEFAULT_NAME,
      options.place || DEFAULT_PLACE,
      options.date || nowTime + TIME_UNTIL_START,
      options.capacity || DEFAULT_CAPACITY,
      fee,
      isPublished,
    )
  }


  describe('constructor', () => {
    const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
    beforeEach(async () => {
      await generateEvent({ date: nowTime + TIME_UNTIL_START })
    })

    it('should have correct params', async () => {
      assert.equal(await event.owner(), owner)
      assert.equal(await event.name(), DEFAULT_NAME)
      assert.equal(await event.place(), DEFAULT_PLACE)
      assert.equal(await event.date(), nowTime + TIME_UNTIL_START)
      assert.equal(await event.capacity(), DEFAULT_CAPACITY)
      assert.equal(await event.fee(), DEFAULT_FEE)
      assert.equal(await event.isPublished(), true)
    })
  })

  describe('getInformation', () => {
    const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    context('when params are correct', () => {
      it('should return correct response', async () => {
        await generateEvent({ date: nowTime + TIME_UNTIL_START })
        const info = await event.getInformation(owner)
        assert.equal(info[0], DEFAULT_NAME)
        assert.equal(info[1], DEFAULT_PLACE)
        assert.equal(info[2].toFixed(0), nowTime + TIME_UNTIL_START)
        assert.equal(info[3].toFixed(0), DEFAULT_CAPACITY)
        assert.equal(info[4].toFixed(0), DEFAULT_FEE)
        assert.equal(info[5], true)
        assert.equal(info[6].toFixed(0), 0)
        assert.equal(info[7], false)
        assert.equal(info[8], true)
      })
    })

    context('when argument is non owner against free event', () => {
      it('should return correct response', async () => {
        await generateEvent({ date: nowTime + TIME_UNTIL_START, fee: 0 })
        const info = await event.getInformation(account1)
        assert.equal(info[0], DEFAULT_NAME)
        assert.equal(info[1], DEFAULT_PLACE)
        assert.equal(info[2].toFixed(0), nowTime + TIME_UNTIL_START)
        assert.equal(info[3].toFixed(0), DEFAULT_CAPACITY)
        assert.equal(info[4].toFixed(0), 0)
        assert.equal(info[5], true)
        assert.equal(info[6].toFixed(0), 0)
        assert.equal(info[7], false)
        assert.equal(info[8], false)
      })
    })

    context('when account1 apply', () => {
      it('should return correct response (isApplied returns true)', async () => {
        await generateEvent({ date: nowTime + TIME_UNTIL_START, fee: 0 })
        await event.apply({ value: DEFAULT_FEE, from: account1 })

        const info = await event.getInformation(account1)
        assert.equal(info[0], DEFAULT_NAME)
        assert.equal(info[1], DEFAULT_PLACE)
        assert.equal(info[2].toFixed(0), nowTime + TIME_UNTIL_START)
        assert.equal(info[3].toFixed(0), DEFAULT_CAPACITY)
        assert.equal(info[4].toFixed(0), 0)
        assert.equal(info[5], true)
        assert.equal(info[6].toFixed(0), 1)
        assert.equal(info[7], true)
        assert.equal(info[8], false)
      })
    })
  })

  describe('apply / cancel', () => {
    beforeEach(async () => {
      await generateEvent({})
    })

    context('when params are correct', () => {
      it('should succeed', async () => {
        await event.apply({ value: DEFAULT_FEE, from: account1 })
        let num = await event.numberOfApplicants()
        let paidFee = await event.applications(account1)
        assert.equal(num.toNumber(), 1)
        assert.equal(paidFee.toNumber(), DEFAULT_FEE)

        await event.apply({ value: DEFAULT_FEE, from: account1 })
        num = await event.numberOfApplicants()
        paidFee = await event.applications(account1)
        assert.equal(num.toNumber(), 1)
        assert.equal(paidFee.toNumber(), DEFAULT_FEE * 2)

        await event.apply({ value: DEFAULT_FEE, from: account2 })
        num = await event.numberOfApplicants()
        paidFee = await event.applications(account2)
        assert.equal(num.toNumber(), 2)
        assert.equal(paidFee.toNumber(), DEFAULT_FEE)

        await event.cancel({ from: account1 })
        num = await event.numberOfApplicants()
        paidFee = await event.applications(account1)
        let eventBalance = await web3.eth.getBalance(event.address)
        assert.equal(num.toNumber(), 1)
        assert.equal(paidFee.toNumber(), 0)
        assert.equal(eventBalance.toNumber(), DEFAULT_FEE)

        await event.cancel({ from: account2 })
        num = await event.numberOfApplicants()
        paidFee = await event.applications(account2)
        eventBalance = await web3.eth.getBalance(event.address)
        assert.equal(num.toNumber(), 0)
        assert.equal(paidFee.toNumber(), 0)
        assert.equal(eventBalance.toNumber(), 0)
      })
    })

    context('when fee is too small', () => {
      it('should revert', async () => {
        const value = new Decimal(DEFAULT_FEE)
        await expectThrow(event.apply({ value: value.minus(1).toFixed(0), from: account1 }))
      })
    })

    context('when the event is not published', () => {
      beforeEach(async () => {
        await generateEvent({ isPublished: false })
      })
      it('should revert', async () => {
        await expectThrow(event.apply({ value: DEFAULT_FEE, from: account1 }))
      })
    })

    context('when event has already started', () => {
      const nowTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
      beforeEach(async () => {
        await generateEvent({ date: nowTime + TIME_UNTIL_START })
        await block.increaseTime(TIME_UNTIL_START)
      })
      it('should revert', async () => {
        await expectThrow(event.apply({ value: DEFAULT_FEE, from: account1 }))
      })
    })
  })
})
