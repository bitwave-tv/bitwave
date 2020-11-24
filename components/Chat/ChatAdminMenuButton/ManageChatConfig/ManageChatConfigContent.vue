<template>
    <div>

      <!-- Skeleton Loader -->
      <div v-if="loading">
        <v-skeleton-loader
          v-bind="attrs"
          type="article, article, divider, actions"
        ></v-skeleton-loader>
      </div>

      <!-- Controls -->
      <div class="pa-3" v-else>

        <!-- Config Adjustments -->
        <div class="px-3 mt-2">

          <!-- Allow Trolls in Chat -->
          <v-switch
            v-model="config.allowTrolls"
            label="Allow Trolls to Chat"
            color="primary"
            hide-details
            dense
            inset
            class="mt-2"
            :disabled="saving"
          />

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
          <v-subheader>Short Rate: {{ shortRate }}</v-subheader>
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

          <v-subheader>Long Rate: {{ longRate }}</v-subheader>
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

        <!-- Actions -->
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
  export default {
    name: 'ManageChatConfigContent',

    data() {
      return {
        loading: true,
        saving: true,
        shortRateTicks: [ 1, 2, 2.5, 5, 10 ],
        config: {
          allowTrolls: true,
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
        this.loading = true;

        const endpoint = `https://api.bitwave.tv/v1/chat/config`;

        try {
          const { data } = await this.$axios.get( endpoint );

          console.log( data );

          if ( data.success ) {
            this.config = {
              allowTrolls: data.config?.allowTrolls ?? true,
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
        this.loading = false;
      },

      async updateConfig () {
        this.saving = true;

        const endpoint = `https://api.bitwave.tv/v1/chat/config`;
        const payload = {
          user: 'thisdoesnotmatter',
          config: {
            allowTrolls: this.config.allowTrolls,
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

    computed: {
      shortRate () {
        const rate = 1 / ( this.config.rates.short / 10 );
        return `${rate.toFixed(2)} per 1 Second`;
      },
      longRate () {
        const rate = 1 / ( this.config.rates.long / 20 );
        return `${rate.toFixed(2)} per 30 Seconds`;
      },
    },

    async mounted () {
      setTimeout( async () => {
        await this.getConfig();
      }, 350 );
    },
  };
</script>

<style lang='scss'>

</style>
