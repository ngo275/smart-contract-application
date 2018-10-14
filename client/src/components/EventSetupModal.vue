<template>
  <modal name="event-setup-modal" :width="modalWidth" :height="600" transition="pop-out">
    <div class="box">
      <div class="box-part" id="bp-left">
        <div class="partition" id="partition-register">
          <div class="partition-title">CREATE EVENT</div>
          <div class="partition-form">
            <form autocomplete="false">
              <input id="n-name" type="text" v-model="eventName" placeholder="Input your event name">
              <vue-ctk-date-time-picker
                v-model="datetime"
                :minute-interval="10"
              ></vue-ctk-date-time-picker>
              <input id="n-place" type="text" v-model="eventPlace" placeholder="Input your evnet place">
              <input id="n-capacity" type="number" v-model="eventCapacity" placeholder="Input your evnet capacity">
              <input id="n-fee" type="text" v-model="eventFee" placeholder="Input your evnet fee (ETH)">
            </form>

            <div style="margin-top: 42px">
            </div>
            <v-btn class="large-btn" @click="createEvent"><span>CREATE</span></v-btn>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import { mapState } from 'vuex'
import Bignumber from 'bignumber.js'

const MODAL_WIDTH = 656

export default {
  name: 'EventSetupModal',
  data () {
    return {
      time: 0,
      duration: 5000,
      modalWidth: MODAL_WIDTH,
      datetime: (new Date()).toISOString(),
      eventName: null,
      eventPlace: null,
      eventCapacity: null,
      eventFee: null,
    }
  },
  created () {
    this.modalWidth = window.innerWidth < MODAL_WIDTH
      ? MODAL_WIDTH / 2
      : MODAL_WIDTH
  },
  computed: mapState({
    factoryInstance: state => state.factoryInstance,
  }),
  methods: {
    show () {
      this.$modal.show('event-setup-modal');
    },
    hide () {
      this.$modal.hide('event-setup-modal');
    },
    createEvent (event) {
      this.$store.dispatch('startLoading', 'generateEvent')

      this.factoryInstance().generate(
        this.$store.state.web3.coinbase,
        this.eventName,
        this.eventPlace,
        parseInt((new Date(this.datetime).getTime()) / 1000),
        this.eventCapacity,
        new Bignumber(10 ** 18).multipliedBy(this.eventFee).toFixed(0),
        true,
        {
          gas: 3000000,
          value: this.$store.state.web3.web3Instance().toWei(this.amount, 'ether'),
          from: this.$store.state.web3.coinbase,
        }, (err, result) => {
          if (err) {
            console.log(err)
            this.$store.dispatch('stopLoading', 'generateEvent')
          } else {
            this.hide()
            const CreateEvent = this.factoryInstance().CreateEvent()
            CreateEvent.watch((err, result) => {
              if (err) {
                console.log('could not generate event')
              } else {
                this.$store.dispatch('setNewEventAddress', result.args._newEvent)
                this.$store.dispatch('getEventInstance', result.args._newEvent)
                this.$store.dispatch('stopLoading', 'generateEvent')
              }
            })
          }
        }
      )
    }
  }
}
</script>

<style lang="scss">
$background_color: #404142;
.box {
  background: white;
  overflow: hidden;
  width: 656px;
  height: 600px;
  border-radius: 2px;
  box-sizing: border-box;
  box-shadow: 0 0 40px black;
  color: #8b8c8d;
  font-size: 0;
  .box-part {
    display: inline-block;
    position: relative;
    vertical-align: top;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    &#bp-right {
      // background: url("/static/panorama.jpg") no-repeat top left;
      border-left: 1px solid #eee;
    }
  }
  .box-messages {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
  }
  .box-error-message {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    height: 0;
    line-height: 32px;
    padding: 0 12px;
    text-align: center;
    width: 100%;
    font-size: 11px;
    color: white;
    background: #F38181;
  }
  .partition {
    width: 100%;
    height: 100%;
    .partition-title {
      box-sizing: border-box;
      padding: 30px;
      width: 100%;
      text-align: center;
      letter-spacing: 1px;
      font-size: 20px;
      font-weight: 300;
    }
    .partition-form {
      padding: 0 30px;
      box-sizing: border-box;
    }
  }
  input[type=number],
  input[type=text] {
    display: block;
    box-sizing: border-box;
    margin-bottom: 4px;
    width: 100%;
    font-size: 12px;
    line-height: 2;
    border: 0;
    border-bottom: 1px solid #DDDEDF;
    padding: 4px 8px;
    font-family: inherit;
    transition: 0.5s all;
    outline: none;
  }
  .large-btn {
    width: 100%;
    background: white;
    span {
      font-weight: 600;
    }
  }
  .autocomplete-fix {
    position: absolute;
    visibility: hidden;
    overflow: hidden;
    opacity: 0;
    width: 0;
    height: 0;
    left: 0;
    top: 0;
  }
}
.pop-out-enter-active,
.pop-out-leave-active {
  transition: all 0.5s;
}
.pop-out-enter,
.pop-out-leave-active {
  opacity: 0;
  transform: translateY(24px);
}
</style>
