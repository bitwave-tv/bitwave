<template>
  <v-card class="mt-2">
    <div style="border-top: solid 3px #ffeb3b;">

      <v-sheet
        color="grey darken-4"
      >
        <v-list
          dense
          :style="{ background: 'transparent' }"
        >
          <div>
            <div class="overline text-center grey--text">
              work in progress
            </div>
          </div>

          <v-list-item @click="popoutChat">
            <v-list-item-action class="my-1 mr-3">
              <v-icon>open_in_new</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Pop Out Chat</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!--<v-list-item @click="closeChat">
            <v-list-item-action class="my-1 mr-3">
              <v-icon>block</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Hide Chat</v-list-item-title>
            </v-list-item-content>
          </v-list-item>-->

        </v-list>
      </v-sheet>

    </div>
  </v-card>
</template>

<script>
  export default {
    name: 'ChatOverflowMenu',

    props: {
      channel: { type: String },
    },

    data() {
      return {
        popoutWindow: null,
      };
    },

    methods: {
      closeMenu () {
        this.$emit( 'close' );
      },

      async popoutChat () {
        if ( !this.popoutWindow || this.popoutWindow.closed ) {
          this.popoutWindow = await this.createPopoutWindow();
        } else {
          this.popoutWindow.focus();
        }
      },

      closeChat () {

      },

      createPopoutWindow () {
        const width = 450;
        const leftPos = outerWidth - width;

        const url = `/chat/${this.channel}`;
        const title = `${this.channel} - [bitwave.tv]`;
        const optionsStr = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,personalbar=no,width=${width},height=720,left=${leftPos},top=100`;

        return open( url, title, optionsStr );
      },


    },

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss'>

</style>
