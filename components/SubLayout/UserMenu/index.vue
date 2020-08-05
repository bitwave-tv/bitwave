<template>
  <div>
    <div
      v-if="isAuth"
    >
      <v-menu
        v-model="profileMenu"
        :close-on-content-click="true"
        bottom
        offset-y
        left
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            color="transparent"
            class="black--text"
            rounded
            small
            fab
          >
            <!-- Avatar with webp support -->
            <picture
              class="v-avatar ml-0"
              style="height: 40px; min-width: 40px; width: 40px; background: #212121;"
            >
              <source
                v-if="avatars"
                :srcset="avatars.webp"
                type="image/webp"
              >
              <img
                :src="avatar"
                :alt="username"
              >
            </picture>
          </v-btn>
        </template>

        <lazy-user-menu-content />
      </v-menu>
    </div>

    <div
      v-else
    >
      <v-btn
        color="primary"
        class="black--text"
        small
        @click="showLogin = true"
      >
        Login
      </v-btn>

      <v-dialog
        v-model="showLogin"
        width="420"
      >
        <lazy-login-dialog @close="showLogin = false"/>
    </v-dialog>
  </div>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'UserMenuButton',

    data() {
      return {
        profileMenu: false,
        showLogin: false,
        defaultProfilePic: 'https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw',
      };
    },

    methods: {},

    computed: {
      ...mapGetters({
        isAuth    : VStore.$getters.isAuth,
        username  : VStore.$getters.getUsername,
        auth      : VStore.$getters.getAuth,
        getAvatar : VStore.$getters.getAvatar,
      }),

      avatar () {
        if ( this.auth
          && this.auth.hasOwnProperty( 'avatar' )
          && this.auth.avatar  ) {
          return this.auth.avatar;
        } else return this.defaultProfilePic;
      },

      avatars () {
        if ( this.user
          && this.user.hasOwnProperty( 'avatars' )
          && this.user.avatars.length > 0 ) {
          return this.user.avatars;
        } else return false;
      },
    },
  };
</script>
