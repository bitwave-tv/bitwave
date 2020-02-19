<template>
  <v-card class="mt-3">
    <div style="border-top: solid 3px #ffeb3b;">

      <v-sheet color="grey darken-4">
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
            <v-list-item-action class="mr-1">
              <v-icon small>open_in_new</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Pop Out Chat</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="closeChat">
            <v-list-item-action class="mr-1">
              <v-icon small>block</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Close Chat</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="getPWaPrompt" class="mt-2" />

          <v-list-item v-if="getPWaPrompt"  @click="showPWAPrompt">
            <v-list-item-action class="mr-1">
              <v-icon small>important_devices</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Install App</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list>
      </v-sheet>

    </div>
  </v-card>
</template>

<script>
  import { mapState, mapGetters, mapMutations } from 'vuex';
  import { Chat } from '@/store/chat';
  import { pwaPrompt } from '@/plugins/pwa.client';
  import { VStore } from '@/store';

  export default {
    name: 'ChatOverflowMenu',

    props: {
      channel: { type: String },
    },

    data() {
      return {};
    },

    methods: {
      ...mapMutations(Chat.namespace,{
        setDisplayChat: Chat.$mutations.setDisplayChat,
        setChatWindow: Chat.$mutations.setChatWindow,
      }),

      async popoutChat () {
        if ( !this.chatWindow || !this.chatWindow.getWindow() || this.chatWindow.getWindow().closed ) {

          console.log( `Creating new popup window` );

          const cw = await this.createPopoutWindow();
          this.setDisplayChat( false );

          cw.addEventListener( 'beforeunload', () => this.setDisplayChat( true ) );

          const vcx = { getWindow: () => cw };
          Object.freeze( vcx );

          this.setChatWindow( vcx );

        } else {
          this.setDisplayChat( false );
          this.chatWindow.getWindow().focus();
        }
      },

      closeChat () {
        this.setDisplayChat( false );
      },

      createPopoutWindow () {
        const width = 450;
        const leftPos = outerWidth - width;

        const url = `/chat/${this.channel}`;
        const title = `${this.channel} - [bitwave.tv]`;
        const optionsStr = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,personalbar=no,width=${width},height=720,left=${leftPos},top=100`;

        return open( url, title, optionsStr );
      },

      async showPWAPrompt () {
        const prompt = this.getPWaPrompt;
        await prompt.prompt();
        const userAction = await prompt.userChoice;
        if ( userAction.outcome === 'accepted' ) {
          this.$toast.success('Successfully installed.', { duration: 2000 });
        } else if (userAction.outcome === 'dismissed') {
          this.$toast.error('Installation cancelled', { duration: 2000 });
        } else {
          this.$toast.error('ERROR: Installation failed', { duration: 2000 });
        }
      },

    },

    computed: {
      ...mapGetters({
        getPWaPrompt: VStore.$getters.getPWaPrompt,
      }),

      ...mapState(Chat.namespace, {
        chatWindow: Chat.$states.chatWindow,
      }),
    },

    mounted () {

    },
  };
</script>
