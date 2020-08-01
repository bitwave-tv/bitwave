<template>
    <div>

      <!-- Chat Header -->
      <div class="mx-5">
        <h1 class="font-weight-light rgb-text">Streamer Dashboard</h1>
      </div>

      <v-container>
        <v-row>

          <v-col>
            <v-responsive height="calc( 100% + 32px )">
              <iframe
                :src="`/embed/${username}`"
                frameborder="none"
                scrolling="no"
                width="100%"
                height="100%"
              ></iframe>
            </v-responsive>
          </v-col>

          <v-col>
            <dashboard-superchats />
          </v-col>

          <!-- Chat -->
          <v-col>
            <div
              v-if="displayChat"
              class="d-flex flex-shrink-1"
              :style="{ width: mobile ? '100%' : '450px', 'height': mobile ? '500px' : '555px' }"
            >
              <chat
                :chat-channel="username"
              />
            </div>
          </v-col>
        </v-row>
      </v-container>

    </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { Chat as ChatStore } from '@/store/chat';
  import { VStore } from '@/store';

  export default {
    name: 'dashboard',

    middleware: 'auth',

    data() {
      return {
        mounted: false,
      };
    },

    methods: {},

    computed: {
      ...mapGetters( {
        username: VStore.$getters.getUsername,
      }),

      ...mapState(ChatStore.namespace, {
        displayChat: ChatStore.$states.displayChat
      }),

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    mounted() {
      this.mounted = true;
    },
  };
</script>
