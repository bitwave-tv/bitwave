<template>
  <div>
    <v-menu
      v-if="isAuth"
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
          fab
          small
        >
          <!-- Avatar with webp support -->
          <picture
            v-if="avatar"
            class="v-avatar ml-0"
            style="height: 40px; min-width: 40px; width: 40px; background: #212121;"
          >
            <source
              v-if="avatars"
              :srcset="`${avatars.webp}`"
              type="image/webp"
            >
            <img
              :src="`${avatar}`"
              :alt="username"
            >
          </picture>

          <v-avatar
            v-else
            size="32"
            color="grey darken-4"
          >
            <!-- Troll Hazzy -->
            <img
              src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
              alt="hazmat suit trolll"
              crossorigin
            >
            <!--<v-icon v-else color="white">person</v-icon>-->
          </v-avatar>

        </v-btn>
      </template>

      <user-menu />

    </v-menu>

    <login-dialog v-else />

  </div>
</template>

<script>
  const UserMenu = async () => await import( '~/components/SubLayout/UserMenu/UserMenu' );
  const LoginDialog = async () => await import( '~/components/LoginDialog' );

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'UserMenuButton',

    components: {
      UserMenu,
      LoginDialog,
    },

    data() {
      return {
        profileMenu: false,
      };
    },

    methods: {},

    computed: {
      ...mapGetters({
        isAuth   : VStore.$getters.isAuth,
        username : VStore.$getters.getUsername,
        user     : VStore.$getters.getUser,
      }),

      avatar () {
        if ( this.user ) return this.user.avatar;
        else return false;
      },

      avatars () {
        if ( this.user ) return this.user.avatars;
        else return false;
      },
    },
  };
</script>
