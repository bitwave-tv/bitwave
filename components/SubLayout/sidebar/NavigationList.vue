<template>
    <div>
      <!-- Navigation List -->

        <v-list
          class="py-0"
          dense
        >
          <v-list-item
            v-for="( item, i ) in items"
            :key="i"
            :to="item.to"
            router
            exact
            @click="onClick"
            no-prefetch
          >
            <v-list-item-avatar class="my-1" tile>

              <img
                :src="icon"
                alt="bitwave.tv logo"
                title="bitwave.tv homepage"
              />

            </v-list-item-avatar>
            <v-list-item-content class="py-0">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>[bitwave.tv]</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

      <div class="">
        <v-btn
          class="text-center py-2"
          style="height: auto;"
          to="/streamkey"
          text
          tile
          block
          small
          @click="onClick"
          no-prefetch
        >
          STREAM<br>
          HERE
        </v-btn>
      </div>

      <div class="">
        <v-btn
          class="text-center py-2"
          style="height: auto;"
          to="/replays"
          text
          tile
          block
          small
          @click="onClick"
          no-prefetch
        >
          Replays
        </v-btn>
      </div>

      <div class="">
        <v-btn
          class="text-center py-2"
          style="height: auto;"
          to="/store"
          text
          tile
          block
          small
          @click="onClick"
          no-prefetch
        >
          Store
        </v-btn>
      </div>
    </div>
</template>

<script>
  export default {
    name: 'NavigationList',

    data() {
      return {
        icon  : '/icon.png',
        icon1 : '/images/icon-1.png',
        icon2 : '/images/icon-2.png',
        items: [
          {
            icon   : 'whatshot',
            size   : 32,
            title  : 'Home',
            to     : '/',
          },
        ],
      };
    },

    methods: {
      onClick () {
        window.navigator.vibrate( 10 );
      },
    },

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss'>

</style>
