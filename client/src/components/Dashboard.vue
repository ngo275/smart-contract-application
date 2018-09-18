<template>
  <div v-if="isInjected" class="container">
    <h1>Event Smart Contract</h1>
    <event-setup-modal/>
    <div class="wrapper">
      <v-btn v-on:click="openModal">
        Create Event 🙌
      </v-btn>
      <h3 class="label">We have {{ events.length }} upcoming events!!</h3>
    </div>
    <img v-if="isEventContractsLoading" id="loader" src="https://loading.io/spinners/spinner/lg.ajax-spinner-preloader.gif">
    <img v-else-if="isGenerateEventLoading" id="loader" src="https://loading.io/spinners/spinner/lg.ajax-spinner-preloader.gif">
    <img v-else-if="isApplyEventLoading" id="loader" src="https://loading.io/spinners/spinner/lg.ajax-spinner-preloader.gif">
    <img v-else-if="isCancelEventLoading" id="loader" src="https://loading.io/spinners/spinner/lg.ajax-spinner-preloader.gif">
    <ul class="eventContainer">
      <li v-for="event in events" v-bind:key="event.address" class="eventItem">
        <slot v-bind:event="event">
          <h4>{{ event.address }}</h4>
          <h4 class="eventName">{{ event.name }}</h4>
          <div class="eventDate">
            on {{ convertDate(event.date) }}
          </div>
          <div class="eventDetail">
            @{{ event.place }}
            {{ event.numberOfApplicants }}/{{ event.capacity }}
            [{{ event.fee / (10 ** 18) }} ETH]
          </div>
          <div>
            <span v-if="event.isOwner" class="tag">Owner</span>
          </div>
          <div class="actionBtn">
            <v-btn v-if="event.isApplied" v-on:click="cancel(event)">CANCEL 🤔</v-btn>
            <v-btn v-else v-on:click="apply(event)">JOIN 😄</v-btn>
          </div>
        </slot>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EventSetupModal from '@/components/EventSetupModal'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  name: 'dashboard',
  data () {
    return {
      events: [],
    }
  },
  computed: mapState({
    myAddress: state => state.web3.coinbase,
    isInjected: state => state.web3.isInjected,
    factoryInstance: state => state.factoryInstance(),
    eventInstances: state => state.eventInstances(),
    isEventContractsLoading: state => state.isLoading.eventContracts,
    isGenerateEventLoading: state => state.isLoading.generateEvent,
    isApplyEventLoading: state => state.isLoading.applyEvent,
    isCancelEventLoading: state => state.isLoading.cancelEvent,
    newEventAddress: state => state.newEventAddress,
  }),
  watch: {
    isInjected (current, prev) {
      if (current !== prev) {
        this.$store.dispatch('getFactoryInstance')
      }
    },
    factoryInstance (instance, prevInstance) {
      // After EventContractFactory is initialized
      if (!prevInstance && instance) {
        this.loadUpcomingEvents()
      }
    },
    isEventContractsLoading (current, prev) {
      // After upcoming event contracts are loaded, load each detail data
      if (!current && prev) {
        console.log(this.eventInstances)
        this.eventInstances.forEach(i => {
          this.loadEventInfo(i)
        })
      }
    },
    isGenerateEventLoading (current, prev) {
      // After event generation finished, load the new event
      if (!current && prev) {
        this.loadNewEvent(this.newEventAddress)
      }
    },
  },
  methods: {
    loadUpcomingEvents () {
      this.$store.dispatch('startLoading', 'eventContracts')
      this.factoryInstance.upcomingEvents(async (err, result) => {
        if (err) {
          console.log(err)
        } else {
          console.log(`event addresses are: ${result}`)

          // NOTE: remove cache
          this.$store.dispatch('resetEventInstance')
          this.events = []

          result.forEach((address) => {
            this.$store.dispatch('getEventInstance', address)
            this.events.push({ address })
          })

          // FIXME: wait for set event instance into state
          await sleep(800)

          this.$store.dispatch('stopLoading', 'eventContracts')
        }
      })
    },
    loadNewEvent (address) {
      this.events.unshift({ address })
      const instance = this.eventInstances.find(i => i.address === address)
      console.log(instance)
      this.loadEventInfo(instance)
    },
    loadEventInfo (event) {
      // NOTE: Currently, MetaMask doesn't support synchronous methods...
      event.getInformation(this.myAddress, (err, result) => {
        const index = this.events.map(i => i.address).indexOf(event.address)
        const name = result[0]
        const place = result[1]
        const date = result[2].toNumber()
        const capacity = result[3].toNumber()
        const fee = result[4].toNumber()
        // const isPublished = result[5] not used now
        const numberOfApplicants = result[6].toNumber()
        const isApplied = result[7]
        const isOwner = result[8]
        const e = {
          address: event.address,
          name,
          place,
          date,
          capacity,
          fee,
          numberOfApplicants,
          isApplied,
          isOwner,
        }
        this.events.splice(index, 1, e)
      })
    },
    apply (event) {
      const instance = this.eventInstances.find(i => i.address === event.address)
      this.$store.dispatch('startLoading', 'applyEvent')
      web3.eth.sendTransaction({
        from: this.myAddress,
        to: event.address,
        value: event.fee,
      }, (err, result) => {
        if (err) {
          console.log(err)
          this.$store.dispatch('stopLoading', 'applyEvent')
        } else {
          const ApplyEvent = instance.Apply()
          ApplyEvent.watch((err, result) => {
            if (err) {
              console.log('could not apply the event')
            } else {
              this.loadEventInfo(instance)
            }
            this.$store.dispatch('stopLoading', 'applyEvent')
          })
        }
      })
    },
    cancel (event) {
      const instance = this.eventInstances.find(i => i.address === event.address)
      this.$store.dispatch('startLoading', 'cancelEvent')
      instance.cancel(
        { from: this.myAddress },
        (err, result) => {
          if (err) {
            console.log(err)
            this.$store.dispatch('stopLoading', 'cancelEvent')
          } else {
            const CancelEvent = instance.Cancel()
            CancelEvent.watch((err, result) => {
              if (err) {
                console.log('could not cancel the event')
              } else {
                this.loadEventInfo(instance)
              }
              this.$store.dispatch('stopLoading', 'cancelEvent')
            })
          }
        }
      )
    },
    openModal (event) {
      this.$modal.show('event-setup-modal')
    },
    convertDate (unixtime) {
      if (!unixtime) return 'loading...'
      const date = new Date(unixtime * 1000).toLocaleString()
      return date.split('T')[0]
    },
  },
  components: {
    'EventSetupModal': EventSetupModal,
  },
}
</script>

<style scoped>
.container {
  margin-top: 50px;
  text-align:center;
}
.wrapper {
  margin-top: 40px;
}
.label {
  margin-top: 24px;
}
.eventContainer {
  margin-top: 32px;
  padding: 0;
  list-style: none;
}
.eventItem {
  margin-top: 24px;
  box-shadow: 2px 3px 6px rgba(0,0,0,0.12), 2px 3px 6px rgba(0,0,0,0.16);
  padding: 8px;
}
.eventName {
}
.eventDate {
}
.evnetDetail {
}
.tag {
  color: green;
}
#loader {
  width:150px;
}
*{
  color: #444444;
}
</style>
