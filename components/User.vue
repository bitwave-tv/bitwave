<template>
    <v-btn
      @click.prevent="logout()"
      flat
    >
      {{ currentUser.displayName }}
    </v-btn>
</template>

<script>
  import { mapState } from 'vuex';

  export default {

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser
      })
    },

    methods: {
      logout() {
        // this.$store.dispatch('user/logout');
      }
    },

  };
</script>
