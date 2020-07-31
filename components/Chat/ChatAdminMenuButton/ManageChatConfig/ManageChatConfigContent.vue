<template>
    <div>
      <div class="pa-3">
        <!-- Current Settings -->
        <div class="d-flex px-3 caption">
          <div class="flex-grow-1">
            <div>Allow Links: {{ config.allowLinks }}</div>
            <div>Block Spam: {{ config.blockSpam }}</div>
          </div>
          <div class="flex-grow-1">
            <div>Short Rate: {{ 1 / ( config.rates.short / 10 ) }} per 1 Second</div>
            <div>Long Rate: {{ 1 / ( config.rates.long / 20 ) }} per 30 Seconds</div>
          </div>
        </div>

        <!-- Config Adjustments -->
        <div class="px-3 mt-2">
          <!-- Allow Links in Chat -->
          <v-switch
            v-model="config.allowLinks"
            label="Allow Links"
            color="primary"
            hide-details
            dense
            inset
            class="mt-1"
            :disabled="saving"
          />

          <!-- Block Spam in Chat -->
          <v-switch
            v-model="config.blockSpam"
            label="Block Repetitive Spam"
            color="primary"
            hide-details
            dense
            inset
            class="mt-1"
            :disabled="saving"
          />
        </div>

        <div class="d-flex">
          <v-spacer />
          <v-btn
            color="primary"
            small
            :loading="saving"
            @click="updateConfig"
          >
            Save
          </v-btn>
        </div>
      </div>
    </div>
</template>

<script>
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'ManageChatConfigContent',

    data() {
      return {
        saving: true,
        config: {
          allowLinks: true,
          blockSpam: false,
          rates: {
            big: 0,
            long: 5,
            short: 5,
          },
        },
      };
    },

    methods: {
      async getFreshIdToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },

      async getConfig () {
        this.saving = true;
        await this.getFreshIdToken();

        const endpoint = `https://api.bitwave.tv/v1/chat/config`;

        try {
          const { data } = await this.$axios.get( endpoint );

          console.log( data );

          if ( data.success ) {
            this.config = {
              allowLinks: data.config?.allowLinks,
              blockSpam: data.config?.blockSpam,
              rates: {
                big: 0,
                long: data.config?.rates?.long ?? 5,
                short: data.config?.rates?.short ?? 5,
              },
            };
            this.$nextTick( () => this.$toast.success( `Success: Got chat config`, { icon: 'done', duration: 1000 } ) );
          } else {
            this.$nextTick( () => this.$toast.error( `Error: ${data.message}`, { icon: 'warning', duration: 1000 } ) );
          }
        } catch (error) {
          this.$nextTick( () => this.$toast.error( `Error: Failed to get chat config`, { icon: 'warning', duration: 1000 } ) );
        }
        this.saving = false;
      },

      async updateConfig () {
        this.saving = true;
        await this.getFreshIdToken();

        const endpoint = `https://api.bitwave.tv/v1/chat/config`;
        const payload = {
          user: 'thisdoesnotmatter',
          config: {
            allowLinks: this.config.allowLinks,
            blockSpam: this.config.blockSpam,
            shortRate: this.config.rates.short ?? 5,
            longRate: this.config.rates.long ?? 5,
          },
        };

        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );

          console.log( data );

          if ( data.success ) {
            this.$nextTick( () => this.$toast.success( `Success: Updated chat config`, { icon: 'done', duration: 1000 } ) );
          } else {
            this.$nextTick( () => this.$toast.error( `Error: ${data.message}`, { icon: 'warning', duration: 1000 } ) );
          }
        } catch (error) {
          this.$nextTick( () => this.$toast.error( `Error: Failed to update chat config`, { icon: 'warning', duration: 1000 } ) );
        }
        this.saving = false;
      },
    },

    async mounted () {
      setTimeout( async () => {
        await this.getConfig();
      }, 1000 );
    },
  };
</script>

<style lang='scss'>

</style>
