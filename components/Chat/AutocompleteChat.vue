<template>
  <v-sheet
    class="chat-autocomplete body-2 py-1"
    color="grey darken-4"
  >

    <template v-for="( user, index ) in filteredData">
      <v-lazy
        min-height="32"
        :key="user.username"
      >
        <v-sheet
          :color="index === selection ? 'blue darken-2' : 'transparent'"
          class="d-flex px-3 py-1 mb-1 align-center"
          @click="onClick( index )"
        >
          <v-avatar
            v-if="user.hasOwnProperty( 'avatar' ) || user.hasOwnProperty( 'color' )"
            class="mr-3"
            :color="user.color"
            size="24"
          >
            <img
              v-if="!!user.avatar"
              :src="user.avatar"
              :alt="user.label"
            >
            <v-icon v-else>person</v-icon>
          </v-avatar>
          <div class="">
            {{ user.label }}
          </div>
        </v-sheet>
      </v-lazy>
    </template>

    <div
      v-if="!filteredData || filteredData.length === 0"
      class="d-flex px-3 py-1 align-center"
    >
      <v-avatar
        class="mr-3"
        size="24"
      >
        <v-icon color="red">block</v-icon>
      </v-avatar>
      <div>No result</div>
    </div>

  </v-sheet>
</template>

<script>
  export default {
    name: 'AutocompleteUsername',

    props: {
      data   : { type: Array },
      size   : { type: Number, default: 5 },
      filter : { type: String },
      index  : { type: Number, default: 0 },
    },

    data () {
      return {
        acData: this.data,
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
      filteredData () {
        const filter = this.filter
          ? this.filter.toLowerCase()
          : '';

        return this.acData
          .filter( user => user.value.toLowerCase().includes( filter ) )
          .splice( 0, this.size );
      },

      selectedValue () {
        return this.filteredData[ this.selection ];
      },
    },

    watch: {
      data: function ( newVal ) {
        this.acData = newVal;
      },

      index: function ( newVal ) {
        // Set value bounds
        this.selection = Math.max( Math.min( newVal, this.filteredData.length - 1 ), 0 );
        this.$emit( 'update:index', this.selection );
      },

      selectedValue: function ( newVal ) {
        this.$emit( 'update:value', newVal );
      },
    },

    mounted () {
      this.$emit( 'update:value', this.selectedValue );
    },

  };
</script>

<style lang='scss'>
  .chat-autocomplete {
    position: absolute;
    top: 0;
    transform: translate( 12.5%, -100% );
    width: 75%;
    max-height: 300px;
    overflow-y: hidden;
    /*opacity: .9;*/

    .v-sheet {
      cursor: pointer;
      transition: .1s;

      &:hover {
        background-color: #0D47A1 !important;
      }
    }
  }
</style>
