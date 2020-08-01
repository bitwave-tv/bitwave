<template>
    <div>

      <v-sheet
        class="py-2 px-3 hide-scrollbar bw-channel-topbar"
        color="accentwave"
        tile
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center grey--text">
            <v-avatar size="32">
              <img
                v-if="avatar"
                :src="avatar"
                :alt="name"
              />
              <v-icon v-else>warning</v-icon>
            </v-avatar>
            <div
              v-if="!mobile"
              class="mx-2"
            >{{ name }}</div>
          </div>

          <div class="d-flex align-center">

            <!-- NSFW Icon -->
            <template v-if="nsfw">
              <div class="font-weight-bold red--text body-2">NSFW</div>
              <v-divider vertical class="mx-2"/>
            </template>

            <!-- Admin Button -->
            <lazy-admin-channel-button
              v-if="isAdmin"
              :streamer="name"
            />

            <!-- Follow Button -->
            <FollowButton
              :streamer-id="streamerId"
            />

          </div>
        </div>
      </v-sheet>

    </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';
  import FollowButton from '@/components/Channel/FollowButton';

  export default {
    name: 'StreamTopBar',

    components: {
      FollowButton,
    },

    props: {
      avatar:     { type: String },
      name:       { type: String },
      nsfw:       { type: Boolean },
      streamerId: { type: String },
    },

    data() {
      return {
        mounted: false,
      };
    },

    computed: {
      ...mapGetters({
        isAdmin  : VStore.$getters.isAdmin,
      }),

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    mounted () {
      this.mounted = true;
    }
  };
</script>
