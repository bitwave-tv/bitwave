<template>
  <div>
    <v-data-table
      hide-default-header
      :headers="headers"
      :items="ignoreList"
      item-key="username"
      class="data-table-no-hover"
      :loading="loading"
      loading-text="Loading... Please wait"
      no-data-text="You haven't muted any channels :)"
      :search="search"
      :items-per-page="5"
    >

      <!-- Table Top -->
      <template #top>
        <div class="pa-3">
          <v-text-field
            v-model="search"
            :label="`Search ${ignoreList.length} channels...`"
            color="primary"
            prepend-inner-icon="search"
            outlined
            single-line
            hide-details
            dense
            clearable
          />
        </div>
      </template>

      <v-divider />

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
                :disabled="!item.ignored"
                @click="unignoreChannel ( item )"
              >
                unignore
              </v-btn>
            </template>
            <span>Unignore channel in global chat</span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex';
  import { Chat } from '@/store/chat';
  import * as storeUtils from '@/plugins/store-utils';
  import { db } from '@/plugins/firebase';
  import { VStore } from '@/store';

  export default {
    name: 'ChannelIgnoreList',

    data() {
      return {
        loading: false,
        search: '',
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
      ...mapMutations ( Chat.namespace, {
        setIgnoreList: Chat.$mutations.setIgnoreChannelList,
        removeIgnoreList: Chat.$mutations.removeIgnoreChannelList,
      }),

      saveToDb ( collection, field, value ) {
        if( this.isAuth ) {
          storeUtils.saveToDb( db, this.user.uid, collection, field, value );
        }
      },

      async executeAction ( a ) {
        if ( a.saveToDb ) this.saveToDb( ...a.saveToDb );
      },

      async unignoreChannel ( channel ) {
        try {
          // Reusing the command parser for this,
          const actions = await this.$chatCommandParser.unignoreChannel( channel.username.toLowerCase() );
          actions?.forEach( a => this.executeAction( a ) );

          // success toast 🍞
          this.$toast.success( `Unignored channel! :)`, { icon: 'done', duration: 1000, position: 'top-center' } );

        } catch ( error ) {
          // ERROR toast 🍞
          this.$toast.error( error.message, { icon: 'done', duration: 1000, position: 'top-center' } );
          console.error( error );
        }
      },
    },

    computed: {
      ...mapGetters( {
        isAuth: VStore.$getters.isAuth,
        user: VStore.$getters.getUser,
      }),

      ...mapState ( Chat.namespace, {
        getIgnoreList: Chat.$states.ignoreChannelList,
      }),

      ignoreList: {
        set ( val ) {
          this.setIgnoreList( val );
        },
        get () {
          return this.getIgnoreList
            .map( ( val, i ) => ({ username: val, ignored: true }) );
        },
      },
    },
  };
</script>
