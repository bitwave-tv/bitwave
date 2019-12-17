<template>
  <v-container fluid>
    <div class="display-1 font-weight-thin yellow--text">Bitwave Admin Portal</div>
    <div class="overline">Welcome to hell</div>
    <v-row>

      <v-col
        cols="12"
        md="6"
      >
        <stream-manager />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <archive-manager />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <reports />
      </v-col>

    </v-row>

    <div>Nothing here works yet. In case you didn't notice...</div>
  </v-container>
</template>

<script>
  import Reports from '@/components/Admin/Reports';
  import StreamManager from '@/components/Admin/StreamManager';
  import ArchiveManager from '@/components/Admin/ArchiveManager';

  export default {
    name: 'admin',

    middleware: [ 'auth', 'admin' ],

    components: { ArchiveManager, StreamManager, Reports },

    data () {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
