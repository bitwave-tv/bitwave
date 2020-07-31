<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="bannedUsers"
      item-key="username"
      class="data-table-no-hover"
      :loading="loading"
      loading-text="Loading... Please wait"
      :search="search"
      :items-per-page="5"
    >

      <!-- Table Top -->
      <template #top>
        <div class="pa-3">
          <div class="d-flex align-center mb-3">
            <div>{{ bannedUsers.length }} Muted Users</div>
            <v-spacer />
            <v-btn
              color="primary"
              small
              outlined
              @click='getBans'
            >
              refresh
            </v-btn>
          </div>
          <v-text-field
            v-model="search"
            color="primary"
            prepend-inner-icon="search"
            label="Search"
            outlined
            single-line
            hide-details
            dense
            clearable
          />
        </div>
      </template>

      <!-- Action Items -->
      <template #item.action="{ item }">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip
            open-delay="1000"
            left
            transition="slide-x-transition"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                small
                color="red"
                :loading="item.loading"
                :disabled="!item.muted"
                @click="unban( item )"
              >
                unmute
              </v-btn>
            </template>
            <span>Unmute user in chat</span>
          </v-tooltip>
        </div>
      </template>


    </v-data-table>
  </div>
</template>

<script>
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'ViewMutedUsersContent',

    data() {
      return {
        loading: true,
        search: '',
        bannedUsers: [],
        headers: [
          {
            text: 'Username',
            align: 'start',
            sortable: true,
            value: 'username',
          },
          {
            text: 'Action',
            align: 'end',
            value: 'action',
          },
        ],
      };
    },

    methods: {
      async getFreshIdToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },


      async getBans () {
        this.loading = true;
        await this.getFreshIdToken();

        const endpoint = `https://api.bitwave.tv/v1/chat/bans`;
        const payload = {
          user: 'thisdoesntmatter',
        };

        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );

          console.log( data );

          this.bannedUsers = data.users.map( ( user, i ) => ({ username: user, number: i, muted: true, }) ).reverse();

          this.$nextTick( () => this.$toast.success( `Success: Loaded ${this.bannedUsers.length} muted users`, { icon: 'done', duration: 1000 } ) );

        } catch (error) {
          this.$nextTick( () => this.$toast.error( `Error: Failed to get muted user list`, { icon: 'warning', duration: 1000 } ) );
        }
        this.loading = false;
      },

      async unban ( user ) {
        user.loading = true;

        await this.getFreshIdToken();

        const endpoint = `https://api.bitwave.tv/v1/chat/unban`;
        const payload = {
          user: 'thisdoesntmatter',
          ban: user.username,
        };

        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );

          console.log( data );

          this.$nextTick( () => this.$toast.success( `Unmuted user ${user.username}`, { icon: 'done', duration: 1000 } ) );

          user.muted = false;

        } catch (error) {
          this.$nextTick( () =>  this.$toast.error( `Failed to unmute ${user.username}`, { icon: 'warning', duration: 1000 } ) );
        }

        user.loading = false;
      },
    },

    computed: {},

    async mounted() {
      setTimeout( async () => {
        await this.getBans();
      }, 1000 );
    },
  };
</script>

<style lang='scss'>
  .theme--dark.v-data-table.data-table-no-hover tbody tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
    background: none;
  }
</style>
