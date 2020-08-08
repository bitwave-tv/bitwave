<template>
    <div>
      <div class="pa-3">
        <!-- Current Settings -->
        <div class="d-flex px-3 caption" v-if="false">
          <div class="flex-grow-1">
            <div>Allow Links: {{ config.allowLinks }}</div>
            <div>Block Spam: {{ config.blockSpam }}</div>
          </div>
          <div class="flex-grow-1">
            <div>Short Rate: {{ ( 1 / ( config.rates.short / 10 ) ).toFixed( 2 ) }} per 1 Second</div>
            <div>Long Rate: {{ ( 1 / ( config.rates.long / 20 ) ).toFixed( 2 ) }} per 30 Seconds</div>
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
            class="mt-2"
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
            class="mt-2"
            :disabled="saving"
          />
        </div>

        <!-- Quick config rate limiter -->
        <v-subheader>Rate Limiter Configuration</v-subheader>
        <div class="d-flex mt-4 justify-space-around">
          <v-btn
            outlined
            small
            color="red"
            class="mx-2"
            :disabled="saving"
            @click="() => { this.config.rates.short = 10; this.config.rates.long = 20; }"
          >
            slow
          </v-btn>
          <v-btn
            outlined
            small
            color="green"
            class="mx-2"
            :disabled="saving"
            @click="() => { this.config.rates.short = 5; this.config.rates.long = 5; }"
          >
            default
          </v-btn>
          <v-btn
            outlined
            small
            color="blue"
            class="mx-2"
            :disabled="saving"
            @click="() => { this.config.rates.short = 2.5; this.config.rates.long = 2.5; }"
          >
            double
          </v-btn>
          <v-btn
            outlined
            small
            color="purple"
            class="mx-2"
            :disabled="saving"
            @click="() => { this.config.rates.short = 1; this.config.rates.long = 1; }"
          >
            insane
          </v-btn>
        </div>

        <div class="mb-4">
          <v-subheader>Short Rate: {{ ( 1 / ( config.rates.short / 10 ) ).toFixed( 2 ) }} per 1 Second</v-subheader>
          <div class="px-3">
            <v-slider
              v-model="config.rates.short"
              step=".5"
              min="1"
              max="10"
              ticks
              hide-details
              dense
              :disabled="saving"
            ></v-slider>
          </div>

          <v-subheader>Long Rate: {{ ( 1 / ( config.rates.long / 20 ) ).toFixed( 2 ) }} per 30 Seconds</v-subheader>
          <div class="px-3">
            <v-slider
              v-model="config.rates.long"
              step="1"
              min="1"
              max="20"
              ticks
              hide-details
              dense
              :disabled="saving"
            ></v-slider>
          </div>
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
        shortRateTicks: [ 1, 2, 2.5, 5, 10 ],
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
      async getConfig () {
        this.saving = true;

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
