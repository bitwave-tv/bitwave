<template>
  <v-sheet
    class="chat-autocomplete body-2 py-1"
    color="grey darken-4"
  >
    <!-- Loops through resulting items -->
    <!-- This can be one of a few options -->
    <!-- ( users / emotes / commands ) -->
    <template
      v-for="( item, index ) in filteredData"
    >
      <v-lazy
        min-height="32"
        :key="item.username"
      >
        <v-sheet
          :color="index === selection ? 'blue darken-2' : 'transparent'"
          class="d-flex px-3 py-1 mb-1 align-center"
          @click="onClick( index )"
        >
          <v-avatar
            v-if="item.hasOwnProperty( 'image' ) || item.hasOwnProperty( 'color' )"
            class="mr-3"
            :color="item.color"
            size="24"
          >
            <!-- attempt to show image or avatar -->
            <!-- this occurs for users / emotes -->
            <img
              v-if="!!item.image"
              :src="item.image"
              :alt="item.label"
            >

            <!-- Fallback to icon if no image -->
            <v-icon v-else>person</v-icon>

          </v-avatar>

          <!-- Display Label -->
          <!-- this is the vaalue that will -->
          <!-- be inserted if tab / enter is pressed -->
          <div class="">{{ item.label }}</div>

        </v-sheet>
      </v-lazy>
    </template>

    <!-- Handle instances with no results -->
    <div
      v-if="!filteredData || filteredData.length === 0"
      class="d-flex px-3 py-1 align-center"
    >
      <!-- Show crossed out circle BLOCKING  -->
      <v-avatar
        class="mr-3"
        size="24"
      >
        <v-icon color="red">block</v-icon>
      </v-avatar>

      <!-- Let users know that no results -->
      <div>No result</div>
    </div>

  </v-sheet>
</template>

<script>
  export default {
    name: 'AutocompleteChat',

    props: {
      data   : {
        // this is an array of objects like:
        // { value: String, label: String }
        type: Array,
      },                                      //   DATA - autocomplete source data to filter thru
      filter : { type: String },              // FILTER - input string used on source data
      index  : { type: Number, default: 0 },  //  INDEX - currently selected index value of the highlighted result
      size   : { type: Number, default: 5 },  //   SIZE - max number of results in autocomplete array
    },

    data () {
      return {
        acData: this.data,     // local autocomplete data value
        selection: this.index, // selected autocomplete index
      };
    },

    methods: {
      // Allow a user to autocomplete by clicking on result also
      onClick ( index ) {
        this.selection = index;
        this.$emit( 'update:index', this.selection );
        this.$nextTick( () => this.$emit('click') );
      },
    },

    computed: {
      // returns a subset of the source data - this.data
      // filtered by user input - this.filter
      filteredData () {
        // normalize our input and make sure it exists
        const filter = this.filter
          ? this.filter.toLowerCase()
          : '';

        /**
         * check if array object contains a 'filter' substring
         * @param val - element from source data array
         * @return {boolean} - returns true if elements contains filter string
         */
        const filterFn = val => ( val.value.toLowerCase() ).includes( filter );

        // Sort helper functions for what's about to come up
        // checkStartsWith creates a function that returns a function that allows
        // for checking if a string starts with another string
        // Then we use it check for string that start with the filter
        const checkStartsWith = checkForThis => val => ( val.label.toLowerCase() ).startsWith( checkForThis );
        const startsWithFilter = checkStartsWith( filter );

        // This is a very simple alphabetical search copied from:
        // https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
        const localeSort = ( a, b ) => a.label.localeCompare( b.label );

        // This is a cluster so to put simply:
        // Sort values that START with our input higher than
        // value that just contain our input
        // But also sort everything alphabetically
        const sortFn = ( a, b ) => {
          // We might need this multiple times,
          // se we store in a local const
          const alphaSort = localeSort( a, b );

          // sort alphabetically when no active filter
          if ( !filter ) return alphaSort;

          // --- SORTING LOGIC --- ///
          // Check if a starts with the filter value
          // if it does, check if b also starts with the filter value
          // if it does, alphabetically sort the results
          // if only a starts with the filter, then sort it higher
          // if b starts with the filter and a does NOT, sort it lower
          // if NEITHER start with the filter value, alphabetically sort
          // --- END LOGIC --- //
          // starsWith is called at most ONCE for both A & B
          // so we don't need to store the values in a const
          // --- --- --- --- --- --- --- --- --- --- --- --- //
          return startsWithFilter( a )
            ? startsWithFilter( b )
              ? alphaSort
              : -1
            : startsWithFilter( b )
              ? 1
              : alphaSort; // yes this is ternary abuse
        }

        // returns an array formed by filtering the copied source data array
        return this.acData
          .filter( filterFn )       // does the (normalized) source value string contain our filter string
          .sort( sortFn )           // sort results that start with our filter value first (or alphabetically)
          .splice( 0, this.size );  // limit number of results
      },

      // is used to get a single value out from
      // the array we just filtered above using
      // the currently specified input selection index
      // where selection is an index value clamped between
      // 0 and the max length of the filtered array result
      selectedValue () {
        return this.filteredData[ this.selection ];
      },
    },

    watch: {
      // Watch when our prop is updated,
      // update local autocomplete data variable to new value
      data: function ( newVal ) {
        this.acData = newVal;
      },

      // Watch selected index autocomplete value
      // Ensure it's value is within valid bounds
      // Then trigger an event for parent to listen to
      index: function ( newVal ) {
        // Set value bounds
        // This will limit between 0 and the size of filteredData array
        this.selection = Math.max( Math.min( newVal, this.filteredData.length - 1 ), 0 );

        // Trigger update:index event with new (and validated) selection index
        this.$emit( 'update:index', this.selection );
      },

      // Watch the value of the selected autocomplete value
      // Trigger an event for parent to listen to on change
      selectedValue: function ( newVal ) {
        this.$emit( 'update:value', newVal );
      },
    },

    mounted () {
      // As soon as autocomplete suggestions are mounted,
      // trigger an update so our parent is in sync from the start
      this.$emit( 'update:value', this.selectedValue );
    },

  };
</script>

<style lang='scss'>
  .chat-autocomplete {
    position: absolute;
    top: -.5rem;
    transform: translate( 5%, -100% );
    width: 90%;
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
