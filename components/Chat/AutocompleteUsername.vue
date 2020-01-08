<template>
  <v-sheet
    :style="{ position: 'absolute', top: 0, transform: 'translateY(-100%)', width: '75%', }"
    class="chat-autocomplete"
  >

    <template v-for="(user, index) in filteredUsers">
      <v-lazy
        min-height="56"
        :key="user.user"
      >
        <v-sheet
          :color=" index === selection ? 'grey darken-4' : '' "
          class="d-flex pa-3 align-center"
          @click="onClick( index )"
        >
          <v-avatar
            class="mr-3"
            :color="user.data.color"
            size="32"
          >
            <img
              v-if="!!user.data.avatar"
              :src="user.data.avatar"
              :alt="user.data.username"
            >
            <v-icon v-else>person</v-icon>
          </v-avatar>
          <div class="">
            {{ user.data.username }}
          </div>
        </v-sheet>
      </v-lazy>
    </template>

  </v-sheet>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'AutocompleteUsername',

    props: {
      // users: { type: Array },
      size: { type: Number, default: 5 },
      filter: { type: String },
      index: { type: Number, default: 0 },
    },

    data () {
      return {
        selection: this.index,
      };
    },

    methods: {
      onClick ( index ) {
        this.selection = index;
        this.$emit( 'update:index', this.selection );
        this.$nextTick( () => this.$emit('click') );
      },
    },

    computed: {
      ...mapGetters({
        users: VStore.$getters.getUserList,
      }),

      filteredUsers () {
        const filter = this.filter
          ? this.filter.toLowerCase()
          : '';
        return this.users
          .filter( user => user.user.toLowerCase().includes( filter ) )
          .reverse()
          .splice( -this.size );
      },

      selectedValue () {
        return this.filteredUsers[ this.selection ];
      },
    },

    watch: {
      index: function ( newVal ) {
        // Set value bounds
        this.selection = Math.max( Math.min( newVal, this.filteredUsers.length - 1 ), 0 );
        this.$emit( 'update:index', this.selection );
      },

      selectedValue: function ( newVal ) {
        this.$emit( 'update:value', newVal );
      },
    },

  };
</script>

<style lang='scss'>
  .chat-autocomplete {
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    width: 75%;
    max-height: 300px;

    .v-sheet {
      transition: .2s;

      &:hover {
        background-color: #212121;
      }
    }
  }
</style>
